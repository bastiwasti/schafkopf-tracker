import { useState, useEffect } from "react";
import { PERSONALITIES } from "../games/schafkopf/commentary.js";
import BockBar from "./BockBar.jsx";
import Scoreboard from "./Scoreboard.jsx";
import CommentaryOverlay from "./CommentaryOverlay.jsx";
import useCommentatorSettings from "../hooks/useCommentatorSettings.js";
import styles from "./styles.js";

import { GAME_PLUGINS } from "../../games/index.js";
import BaseSessionView from "./BaseSessionView.jsx";

const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

function VoicePickerInline({ value, onChange }) {
  const [voices, setVoices] = useState([]);
  useEffect(() => {
    if (!hasSpeech) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);
  if (!hasSpeech || voices.length === 0) return null;
  return (
    <select style={styles.voiceSelect} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">— Standard (System) —</option>
      {voices.map((v) => (
        <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
      ))}
    </select>
  );
}

export default function SchafkopfSessionView({ session, registeredPlayers = [], onBack, onSessionUpdated }) {
  const [showForm, setShowForm] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [form, setForm] = useState(null);
  const [editingGame, setEditingGame] = useState(null);
  const [pendingCommentary, setPendingCommentary] = useState(null);
  const [showCommentatorSettings, setShowCommentatorSettings] = useState(false);

  const { personality, voice, enabled, setPersonality, setVoice, setEnabled } = useCommentatorSettings();

  const plugin = GAME_PLUGINS.schafkopf;
  const { players, history, bock, stake } = session;

  const getForm = () => form ?? plugin.makeDefaultForm(players);

  const activeHistory = history.filter((g) => !g.archived_at);
  const balances = plugin.calcBalances(activeHistory, players);

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

  const { FormComponent, HistoryCardComponent, RulesComponent } = plugin;
  const formBock = editingGame ? editingGame.bock : bock;
  const submitLabel = editingGame ? `✓ Änderungen speichern` : undefined;

  return (
    <BaseSessionView
      session={session}
      registeredPlayers={registeredPlayers}
      onBack={onBack}
      onSessionUpdated={onSessionUpdated}
    >
      {({ showForm, setShowForm, showRules, setShowRules, showCommentatorSettings, setShowCommentatorSettings, editingGame, setEditingGame, pendingCommentary, setPendingCommentary, onUndo, avatarMap }) => (
        <>
          {/* Commentator overlay */}
          {pendingCommentary && (
            <CommentaryOverlay
              game={pendingCommentary}
              registeredPlayers={registeredPlayers}
              commentatorPersonality={personality}
              commentatorVoice={voice}
              onClose={() => setPendingCommentary(null)}
            />
          )}

          <div style={styles.sessionHeader}>
            <button style={styles.backBtn} onClick={onBack}>← Runden</button>
            <div style={{ flex: 1 }}>
              <div style={styles.sessionTitle}>{session.name}</div>
              <div style={styles.sessionSubtitle}>
                {plugin.label} · {players.join(", ")} · {stake.toFixed(2)} € Einsatz
              </div>
            </div>
            <button
              style={{ ...styles.btnGear, ...(showCommentatorSettings ? { background: "#2c1810", color: "#fdf6e3" } : {}) }}
              onClick={() => setShowCommentatorSettings((v) => !v)}
              title="Kommentator einstellen"
            >
              🎙️
            </button>
          </div>

          {/* Commentator settings panel */}
          {showCommentatorSettings && (
            <div style={styles.commentatorSettingsPanel}>
              <div style={styles.commentatorSettingsTitle}>Kommentator</div>

              <div style={{ ...styles.commentatorToggleRow, marginBottom: 10 }}>
                <span>Kommentator aktiv</span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: "pointer" }}
                />
              </div>

              {enabled && (
                <>
                  <label style={{ ...styles.label, marginTop: 0 }}>Persönlichkeit</label>
                  <div style={styles.personalityChipRow}>
                    {Object.entries(PERSONALITIES).map(([key, p]) => (
                      <button
                        key={key}
                        style={{ ...styles.personalityChip, ...(personality === key ? styles.personalityChipActive : {}) }}
                        onClick={() => setPersonality(key)}
                      >
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>

                  <label style={styles.label}>Stimme des Kommentators</label>
                  <VoicePickerInline value={voice} onChange={setVoice} />
                </>
              )}
            </div>
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

          {showRules && RulesComponent && <RulesComponent />}

          {showForm && (
            <FormComponent
              form={getForm()}
              onFormChange={setForm}
              players={players}
              stake={stake}
              bock={formBock}
              onSubmit={editingGame ? handleUpdateGame : handleAddGame}
              onCancel={toggleForm}
              submitLabel={submitLabel}
            />
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
      )}
    </BaseSessionView>
  );
}
