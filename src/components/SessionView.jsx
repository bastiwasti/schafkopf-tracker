import { useState, useEffect, Suspense } from "react";
import { GAME_PLUGINS } from "../games/index.js";
import { PERSONALITIES } from "../games/schafkopf/commentary.js";
import BockBar from "./BockBar.jsx";
import Scoreboard from "./Scoreboard.jsx";
import CommentaryOverlay from "./CommentaryOverlay.jsx";
import useCommentatorSettings from "../hooks/useCommentatorSettings.js";
import styles from "./styles.js";
import WizardScoreSheet from "../games/wizard/ScoreSheet.jsx";
import WizardRulesBox from "../games/wizard/RulesBox.jsx";

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

export default function SessionView({ session, registeredPlayers = [], onBack, onSessionUpdated }) {
  const [showForm, setShowForm] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [form, setForm] = useState(null);
  const [editingGame, setEditingGame] = useState(null);
  const [pendingCommentary, setPendingCommentary] = useState(null);
  const [showCommentatorSettings, setShowCommentatorSettings] = useState(false);

  const { personality, voice, enabled, setPersonality, setVoice, setEnabled } = useCommentatorSettings();

  const plugin = GAME_PLUGINS[session.game_type];
  const { players, history, bock, stake } = session;

  const isWizard = session.game_type === "wizard";
  
  // Active History bestimmen (Wizard hat kein Archiv)
  const activeHistory = history.filter((g) => !g.archived_at);
  
  // Balances berechnen
  let balances = {};
  if (isWizard) {
    // Wizard: Punkte berechnen
    players.forEach((p) => (balances[p] = 0));
    history.forEach((r) => {
      players.forEach((p) => {
        balances[p] += r.scores[p] || 0;
      });
    });
  } else {
    // Schafkopf: Kontostände berechnen
    balances = plugin.calcBalances(activeHistory, players);
  }

  // Führender Spieler bestimmen
  const maxScore = Math.max(...Object.values(balances));
  const leader = maxScore > 0 
    ? players.reduce((a, b) => (balances[a] >= balances[b] ? a : b))
    : null;

  // Schafkopf-spezifische Funktionen
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

  // Gemeinsame Funktionen
  const handleUndo = async () => {
    const endpoint = isWizard 
      ? `/api/sessions/${session.id}/wizard-rounds/last`
      : `/api/sessions/${session.id}/games/last`;
        
    const res = await fetch(endpoint, { method: "DELETE" });
    if (res.ok) {
      const historyToUse = isWizard ? history : activeHistory;
      const lastActive = [...historyToUse].pop();
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
      setPredictions({});
      setTricks({});
      setEditingRound(null);
    } else {
      if (isWizard) {
        setShowForm(true);
      } else {
        setForm(plugin.makeDefaultForm(players));
        setShowForm(true);
      }
    }
  };

  const handleSubmit = () => {
    if (isWizard) {
      if (editingRound) {
        handleUpdateRound();
      } else {
        handleRoundSaved({ predictions, tricks });
      }
    } else {
      if (editingGame) {
        handleUpdateGame();
      } else {
        handleAddGame();
      }
    }
  };

  const handleCancel = () => {
    toggleForm();
  };

  // Plugin-Komponenten bestimmen
  let FormComponent, HistoryCardComponent, RulesComponent;
  let submitLabel;
  
  if (isWizard) {
    RulesComponent = WizardRulesBox;
  } else {
    FormComponent = plugin.FormComponent;
    HistoryCardComponent = plugin.HistoryCardComponent;
    RulesComponent = plugin.RulesComponent;
    submitLabel = editingGame ? "✓ Änderungen speichern" : undefined;
  }

  return (
    <div style={styles.container}>
      {/* Commentary overlay */}
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
            {plugin.label} · {players.join(", ")}
          </div>
        </div>
        {!isWizard && (
          <button
            style={{ ...styles.btnGear, ...(showCommentatorSettings ? { background: "#2c1810", color: "#fdf6e3" } : {}) }}
            onClick={() => setShowCommentatorSettings((v) => !v)}
            title="Kommentator einstellen"
          >
            🎙️
          </button>
        )}
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

      {/* Schafkopf-spezifische UI */}
      {!isWizard && (
        <>
          <BockBar bock={bock} onBockChange={handleBockChange} />

          <Scoreboard 
            players={players} 
            balances={balances} 
            history={activeHistory} 
            registeredPlayers={registeredPlayers} 
          />
        </>
      )}

      {/* Wizard-spezifische UI */}
      {isWizard && (
        <WizardScoreSheet
          session={session}
          registeredPlayers={registeredPlayers}
          onBack={onBack}
          onSessionUpdated={onSessionUpdated}
        />
      )}

      {/* Gemeinsame Aktionen */}
      {!isWizard && (
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
      )}

      {showRules && (
        <Suspense fallback={<div style={{ padding: 20, textAlign: "center" }}>Laden...</div>}>
          <RulesComponent />
        </Suspense>
      )}

      {/* Formular */}
      {showForm && !isWizard && (
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

      {/* History */}
      {!isWizard && (
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
      )}
    </div>
  );
}
