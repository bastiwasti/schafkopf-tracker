import { useState, useEffect, Suspense } from "react";
import Scoreboard from "../../components/Scoreboard.jsx";
import CommentaryOverlay from "../../components/CommentaryOverlay.jsx";
import CommentarySettingsPanel from "../../components/CommentarySettingsPanel.jsx";
import useCommentatorSettings from "../../hooks/useCommentatorSettings.js";
import styles from "../../components/styles.js";

/**
 * Generischer Container für Spiel-Sessions.
 *
 * Verwaltet: History-State, Form-State, Commentary, Rules-Toggle.
 * Spiel-spezifische Logik (API-Calls, Punkteberechnung) kommt als Props.
 *
 * Wizard und Watten nutzen dies NICHT — sie haben legitimerweise andere UIs.
 *
 * @param {object[]} [initialHistory] - Startwerte (z.B. session.history für Schafkopf)
 * @param {function} [fetchHistory]   - async () => game[] — wenn keine initialHistory
 * @param {function} onSubmitGame     - async (form, ctx) => game — Spiel hinzufügen
 * @param {function} onUpdateGame     - async (gameId, form, ctx) => game — Spiel bearbeiten
 * @param {function} onArchiveGame    - async (gameId) => { id, archived_at } — archivieren
 * @param {function} onUndoGame       - async () => void — letztes Spiel löschen
 * @param {function} makeDefaultForm  - (players) => formObject
 * @param {function} makeEditForm     - (game) => formObject — Spiel → Formular für Bearbeitung
 * @param {function} calcBalances     - (history, players) => { [player]: number }
 * @param {function} [buildCommentary]- optional — aktiviert Commentary-Feature
 * @param {Component} FormComponent   - Spiel-spezifisches Eingabeformular
 * @param {Component} HistoryCardComponent - Karten-Darstellung eines Spiels
 * @param {Component} [RulesComponent]- optional Regelwerk-Overlay
 * @param {JSX} [topSlot]             - optional — z.B. BockBar, wird über Scoreboard gerendert
 * @param {JSX} [middleSlot]         - optional — wird zwischen Scoreboard und Actions gerendert
 * @param {object} [gameContext]      - game-spezifische Daten (bock, stake, etc.)
 */
export default function GameSessionContainer({
  session,
  registeredPlayers = [],
  onSessionUpdated,
  // History
  initialHistory,
  fetchHistory,
  // CRUD
  onSubmitGame,
  onUpdateGame,
  onArchiveGame,
  onUndoGame,
  // Plugin interface
  makeDefaultForm,
  makeEditForm,
  calcBalances,
  buildCommentary,
  // Components
  _FormComponent,
  _HistoryCardComponent,
  RulesComponent,
  topSlot,
  middleSlot,
    // Game-specific context forwarded to CRUD handlers
    gameContext,
    // Optional custom balance formatter (e.g. Punkte statt €)
    formatBalance,
    // Optional custom won counts calculator
    wonCounts,
    // Optional flag for lowest wins logic (e.g. Romme: lowest points = leader)
    lowestWins,
    // Optional callback for history updates (e.g. for won counts calculation)
    onHistoryChange,
}) {
  const { players } = session;

  const [history, setHistory] = useState(
    initialHistory !== undefined ? initialHistory : null
  );
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [form, setForm] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [pendingCommentary, setPendingCommentary] = useState(null);
  const [showCommentatorSettings, setShowCommentatorSettings] = useState(false);

  const { personality, voice, enabled, setPersonality, setVoice, setEnabled } =
    useCommentatorSettings();

  // History laden wenn nicht als prop übergeben
  useEffect(() => {
    if (initialHistory !== undefined) return;
    if (fetchHistory) {
      fetchHistory().then((data) => {
        setHistory(data ?? []);
        if (onHistoryChange) onHistoryChange(data ?? []);
      });
    }
  }, [session.id]);

  const activeHistory = (history ?? []).filter((g) => !g.archived_at);
  const balances = calcBalances(activeHistory, players);
  const getForm = () => form ?? makeDefaultForm(players);

  const handleSubmit = async () => {
    if (editingGame) {
      const updated = await onUpdateGame(editingGame.id, getForm(), gameContext);
      if (updated) {
        setHistory((h) => {
          const newHistory = h.map((g) => (g.id === updated.id ? updated : g));
          if (onHistoryChange) onHistoryChange(newHistory);
          return newHistory;
        });
        closeForm();
      }
    } else {
      const newGame = await onSubmitGame(getForm(), gameContext);
      if (newGame) {
        setHistory((h) => {
          const newHistory = [...(h ?? []), newGame];
          if (onHistoryChange) onHistoryChange(newHistory);
          return newHistory;
        });
        onSessionUpdated({ ...session, game_count: (session.game_count || 0) + 1 });
        closeForm();
        if (enabled && buildCommentary) setPendingCommentary(newGame);
      }
    }
  };

  const handleEditGame = (game) => {
    setEditingGame(game);
    setForm(makeEditForm(game));
    setShowForm(true);
  };

  const handleArchiveGame = async (gameId) => {
    const result = await onArchiveGame(gameId);
    if (result) {
      setHistory((h) => {
        const newHistory = h.map((g) => (g.id === result.id ? { ...g, ...result } : g));
        if (onHistoryChange) onHistoryChange(newHistory);
        return newHistory;
      });
    }
  };

  const handleUndo = async () => {
    await onUndoGame(gameContext);
    const lastActive = [...activeHistory].pop();
    if (lastActive) {
      setHistory((h) => {
        const newHistory = h.filter((g) => g.id !== lastActive.id);
        if (onHistoryChange) onHistoryChange(newHistory);
        return newHistory;
      });
      onSessionUpdated({
        ...session,
        game_count: Math.max(0, (session.game_count || 0) - 1),
      });
    }
  };

  const toggleForm = () => {
    if (showForm) {
      closeForm();
    } else {
      setForm(makeDefaultForm(players));
      setShowForm(true);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(null);
    setEditingGame(null);
  };

  if (history === null) {
    return <div style={styles.emptyMsg}>Lade...</div>;
  }

  return (
    <>
      {pendingCommentary && buildCommentary && (
        <CommentaryOverlay
          game={pendingCommentary}
          buildFn={buildCommentary}
          registeredPlayers={registeredPlayers}
          commentatorPersonality={personality}
          commentatorVoice={voice}
          onClose={() => setPendingCommentary(null)}
          sessionHistory={history}
        />
      )}

      {showCommentatorSettings && buildCommentary && (
        <CommentarySettingsPanel
          personality={personality}
          voice={voice}
          enabled={enabled}
          onPersonality={setPersonality}
          onVoice={setVoice}
          onEnabled={setEnabled}
        />
      )}

      {topSlot}

      <Scoreboard
        players={players}
        balances={balances}
        history={activeHistory}
        registeredPlayers={registeredPlayers}
        formatBalance={formatBalance}
        wonCounts={wonCounts}
        lowestWins={lowestWins}
      />

      {middleSlot}

      <div style={styles.actions}>
        <button style={styles.btnPrimary} onClick={toggleForm}>
          {showForm ? "✕ Abbrechen" : "＋ Neues Spiel"}
        </button>
        {RulesComponent && (
          <button
            style={styles.btnSecondary}
            onClick={() => setShowRules((s) => !s)}
          >
            {showRules ? "✕ Regeln ausblenden" : "📜 Regeln"}
          </button>
        )}
        {buildCommentary && (
          <button
            style={styles.btnGear}
            onClick={() => setShowCommentatorSettings((s) => !s)}
            title="Kommentator-Einstellungen"
          >
            🎙️
          </button>
        )}
        {activeHistory.length > 0 && !showForm && (
          <button style={styles.btnUndo} onClick={handleUndo}>
            ↩ Rückgängig
          </button>
        )}
      </div>

      {showRules && RulesComponent && (
        <Suspense fallback={<div style={{ padding: 20, textAlign: "center" }}>Laden...</div>}>
          <RulesComponent />
        </Suspense>
      )}

      {showForm && (
        <Suspense fallback={<div style={{ padding: 20, textAlign: "center" }}>Laden...</div>}>
          <FormComponent
            form={getForm()}
            onFormChange={setForm}
            players={players}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            submitLabel={editingGame ? "✓ Änderungen speichern" : undefined}
            {...(gameContext ?? {})}
          />
        </Suspense>
      )}

      <div style={styles.historySection}>
        <h3 style={styles.historyTitle}>Spielverlauf</h3>
        {activeHistory.length === 0 && (
          <p style={styles.emptyMsg}>Noch keine Spiele eingetragen.</p>
        )}
        {[...activeHistory].reverse().map((g) => (
          <HistoryCardComponent
            key={g.id}
            game={g}
            players={players}
            onEdit={handleEditGame}
            onArchive={handleArchiveGame}
          />
        ))}
      </div>
    </>
  );
}
