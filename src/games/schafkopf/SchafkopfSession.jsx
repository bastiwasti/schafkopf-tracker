import { useState } from "react";
import { Suspense } from "react";
import { GAME_PLUGINS } from "../index.js";
import BockBar from "../../components/BockBar.jsx";
import Scoreboard from "../../components/Scoreboard.jsx";
import CommentaryOverlay from "../../components/CommentaryOverlay.jsx";
import CommentarySettingsPanel from "../../components/CommentarySettingsPanel.jsx";
import useCommentatorSettings from "../../hooks/useCommentatorSettings.js";
import styles from "../../components/styles.js";

export default function SchafkopfSession({ session, registeredPlayers = [], onBack, onSessionUpdated }) {
  const [showForm, setShowForm] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [form, setForm] = useState(null);
  const [editingGame, setEditingGame] = useState(null);
  const [pendingCommentary, setPendingCommentary] = useState(null);
  const [showCommentatorSettings, setShowCommentatorSettings] = useState(false);

  const { personality, voice, enabled, setPersonality, setVoice, setEnabled } = useCommentatorSettings();

  const plugin = GAME_PLUGINS[session.game_type];
  const { players, history, bock, stake } = session;

  const activeHistory = history.filter((g) => !g.archived_at);
  
  const balances = plugin.calcBalances(activeHistory, players);

  const getForm = () => form ?? plugin.makeDefaultForm(players);

  const handleBockChange = async (newBock) => {
    const res = await fetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bock: newBock }),
    });
    if (res.ok) onSessionUpdated({ ...session, bock: newBock });
  };

  const handleAddGame = async () => {
    const currentForm = getForm();
    const isSolo = currentForm.type !== "Sauspiel";
    const { changes, spielwert } = plugin.resolveGame({ ...currentForm, bock, players, stake });
    const payload = {
      type: currentForm.type,
      player: currentForm.player,
      partner: isSolo ? null : currentForm.partner,
      won: currentForm.won,
      schneider: currentForm.schneider,
      schwarz: currentForm.schwarz,
      laufende: currentForm.laufende,
      bock,
      klopfer: currentForm.klopfer,
      spielwert,
      changes,
    };

    const res = await fetch(`/api/sessions/${session.id}/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const newGame = await res.json();
      onSessionUpdated({ ...session, history: [...history, newGame] });
      setShowForm(false);
      setForm(null);
      if (enabled) setPendingCommentary(newGame);
    }
  };

  const handleEditGame = (game) => {
    setEditingGame(game);
    setForm({
      type: game.type,
      player: game.player,
      partner: game.partner ?? players.find((p) => p !== game.player),
      won: game.won,
      schneider: game.schneider,
      schwarz: game.schwarz,
      laufende: game.laufende,
      klopfer: game.klopfer,
    });
    setShowForm(true);
  };

  const handleUpdateGame = async () => {
    const currentForm = getForm();
    const isSolo = currentForm.type !== "Sauspiel";
    const gameBock = editingGame.bock;
    const { changes, spielwert } = plugin.resolveGame({ ...currentForm, bock: gameBock, players, stake });
    const payload = {
      type: currentForm.type,
      player: currentForm.player,
      partner: isSolo ? null : currentForm.partner,
      won: currentForm.won,
      schneider: currentForm.schneider,
      schwarz: currentForm.schwarz,
      laufende: currentForm.laufende,
      bock: gameBock,
      klopfer: currentForm.klopfer,
      spielwert,
      changes,
    };

    const res = await fetch(`/api/sessions/${session.id}/games/${editingGame.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const updated = await res.json();
      onSessionUpdated({
        ...session,
        history: history.map((g) => (g.id === updated.id ? updated : g)),
      });
      setShowForm(false);
      setForm(null);
      setEditingGame(null);
    }
  };

  const handleArchiveGame = async (gameId) => {
    const res = await fetch(`/api/sessions/${session.id}/games/${gameId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived_at: new Date().toISOString() }),
    });
    if (res.ok) {
      const updated = await res.json();
      onSessionUpdated({
        ...session,
        history: history.map((g) => (g.id === updated.id ? updated : g)),
      });
    }
  };

  const handleUndo = async () => {
    const res = await fetch(`/api/sessions/${session.id}/games/last`, { method: "DELETE" });
    if (res.ok) {
      const lastActive = [...activeHistory].pop();
      if (lastActive) {
        onSessionUpdated({
          ...session,
          history: history.filter((g) => g.id !== lastActive.id),
        });
      }
    }
  };

  const toggleForm = () => {
    if (showForm) {
      setShowForm(false);
      setForm(null);
      setEditingGame(null);
    } else {
      setForm(plugin.makeDefaultForm(players));
      setShowForm(true);
    }
  };

  const handleSubmit = () => {
    if (editingGame) {
      handleUpdateGame();
    } else {
      handleAddGame();
    }
  };

  const handleCancel = () => {
    toggleForm();
  };

  const { FormComponent, HistoryCardComponent, RulesComponent } = plugin;
  const submitLabel = editingGame ? "✓ Änderungen speichern" : undefined;

  return (
    <>
      {pendingCommentary && (
        <CommentaryOverlay
          game={pendingCommentary}
          registeredPlayers={registeredPlayers}
          commentatorPersonality={personality}
          commentatorVoice={voice}
          onClose={() => setPendingCommentary(null)}
        />
      )}

      {showCommentatorSettings && (
        <CommentarySettingsPanel
          personality={personality} voice={voice} enabled={enabled}
          onPersonality={setPersonality} onVoice={setVoice} onEnabled={setEnabled}
        />
      )}

      <BockBar bock={bock} onBockChange={handleBockChange} />

      <Scoreboard 
        players={players} 
        balances={balances} 
        history={activeHistory} 
        registeredPlayers={registeredPlayers} 
      />

      <div style={styles.actions}>
        <button style={styles.btnPrimary} onClick={toggleForm}>
          {showForm ? "✕ Abbrechen" : "＋ Neues Spiel"}
        </button>
        {RulesComponent && (
          <button style={styles.btnSecondary} onClick={() => setShowRules(!showRules)}>
            {showRules ? "✕ Regeln ausblenden" : "📜 Regeln"}
          </button>
        )}
        {activeHistory.length > 0 && !showForm && (
          <button style={styles.btnUndo} onClick={handleUndo}>↩ Rückgängig</button>
        )}
      </div>

      {showRules && (
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
            stake={stake}
            bock={editingGame ? editingGame.bock : bock}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel={submitLabel}
          />
        </Suspense>
      )}

      <div style={styles.historySection}>
        <h3 style={styles.historyTitle}>Spielverlauf</h3>
        {activeHistory.length === 0 && (
          <p style={styles.emptyMsg}>Noch keine Spiele eingetragen.</p>
        )}
        {[...activeHistory].reverse()
          .filter((g) => !g.archived_at)
          .map((g) => (
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
