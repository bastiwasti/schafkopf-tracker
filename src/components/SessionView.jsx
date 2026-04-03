import { useState, useEffect, lazy, Suspense } from "react";
import { GAME_PLUGINS } from "../games/index.js";
import { PERSONALITIES } from "../games/schafkopf/commentary.js";
import BockBar from "./BockBar.jsx";
import Scoreboard from "./Scoreboard.jsx";
import CommentaryOverlay from "./CommentaryOverlay.jsx";
import useCommentatorSettings from "../hooks/useCommentatorSettings.js";
import styles from "./styles.js";

// Dynamische Import für Wizard-Komponenten
const WizardScoreSheet = lazy(() => import("../games/wizard/ScoreSheet.jsx"));
const WizardRoundForm = lazy(() => import("../games/wizard/RoundForm.jsx"));
const WizardHistoryCard = lazy(() => import("../games/wizard/HistoryCard.jsx"));
const WizardRulesBox = lazy(() => import("../games/wizard/RulesBox.jsx"));

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
  const [showEndSession, setShowEndSession] = useState(false);
  const [editingRound, setEditingRound] = useState(null);
  const [predictions, setPredictions] = useState({});
  const [tricks, setTricks] = useState({});

  const { personality, voice, enabled, setPersonality, setVoice, setEnabled } = useCommentatorSettings();

  const plugin = GAME_PLUGINS[session.game_type];
  const { players, history, bock, stake } = session;
  
  // Wizard-spezifische State-Initialisierung
  useEffect(() => {
    if (session.game_type === "wizard") {
      setPredictions({});
      setTricks({});
      setEditingRound(null);
    } else {
      setForm(null);
      setEditingGame(null);
    }
  }, [session.game_type, players]);

  const isWizard = session.game_type === "wizard";
  
  // Active History bestimmen (Wizard hat kein Archiv)
  const activeHistory = history.filter((g) => !g.archived_at);
  const activeRounds = isWizard ? history : activeHistory;
  
  // Balances berechnen
  let balances = {};
  if (isWizard) {
    // Wizard: Punkte berechnen
    players.forEach((p) => (balances[p] = 0));
    activeRounds.forEach((r) => {
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

  // Wizard-spezifische Werte
  const maxRounds = isWizard ? plugin.getRoundCount(players.length) : null;
  const currentRound = activeRounds.length + 1;
  const isSessionActive = isWizard ? currentRound <= maxRounds : true;

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

  // Wizard-spezifische Funktionen
  const handleRoundSaved = async (roundData) => {
    const res = await fetch(`/api/sessions/${session.id}/wizard-rounds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roundData),
    });
    if (res.ok) {
      const newRound = await res.json();
      onSessionUpdated({
        ...session,
        history: [...history, newRound],
      });
      setShowForm(false);
      setPredictions({});
      setTricks({});
      setEditingRound(null);
    }
  };

  const handleEditRound = (round) => {
    setEditingRound(round);
    setPredictions({ ...round.predictions });
    setTricks({ ...round.tricks });
    setShowForm(true);
  };

  const handleUpdateRound = async () => {
    const roundData = {
      predictions,
      tricks,
    };

    const res = await fetch(`/api/sessions/${session.id}/wizard-rounds/${editingRound.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roundData),
    });
    if (res.ok) {
      const updated = await res.json();
      onSessionUpdated({
        ...session,
        history: activeRounds.map((r) => (r.id === updated.id ? updated : r)),
      });
      setShowForm(false);
      setPredictions({});
      setTricks({});
      setEditingRound(null);
    }
  };

  const handleArchiveRound = async (roundId) => {
    const res = await fetch(`/api/sessions/${session.id}/wizard-rounds/${roundId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived_at: new Date().toISOString() }),
    });
    if (res.ok) {
      const updated = await res.json();
      onSessionUpdated({
        ...session,
        history: activeRounds.map((r) => (r.id === roundId ? updated : r)),
      });
    }
  };

  const handleEndSession = async () => {
    const res = await fetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        wizard_status: isSessionActive ? "completed" : "completed"
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      onSessionUpdated(updated);
      setShowEndSession(false);
    }
  };

  // Gemeinsame Funktionen
  const handleUndo = async () => {
    const endpoint = isWizard 
      ? `/api/sessions/${session.id}/wizard-rounds/last`
      : `/api/sessions/${session.id}/games/last`;
      
    const res = await fetch(endpoint, { method: "DELETE" });
    if (res.ok) {
      const lastActive = [...activeRounds].pop();
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
    FormComponent = WizardRoundForm;
    HistoryCardComponent = WizardHistoryCard;
    RulesComponent = WizardRulesBox;
    submitLabel = editingRound ? "✓ Änderungen speichern" : undefined;
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
            {plugin.label} · {players.join(", ")} · 
            {isWizard 
              ? (isSessionActive ? `Runde ${currentRound}/${maxRounds}` : `✓ Beendet (${activeRounds.length}/${maxRounds})`)
              : `${stake.toFixed(2)} € Einsatz`
            }
          </div>
        </div>
        {isWizard && isSessionActive && (
          <button
            style={{
              ...styles.btnSecondary,
              padding: "8px 12px",
              marginRight: 8,
            }}
            onClick={() => setShowEndSession(true)}
            title="Session beenden"
          >
            🏁 Beenden
          </button>
        )}
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

      {/* Session Status für Wizard */}
      {!isSessionActive && isWizard && (
        <div style={{
          background: "#9d0208",
          color: "#fdf6e3",
          padding: "12px 16px",
          borderRadius: 8,
          marginBottom: 16,
          textAlign: "center",
          fontWeight: "bold",
        }}>
          Session beendet
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
        <Suspense fallback={<div style={{ padding: 20, textAlign: "center" }}>Laden...</div>}>
          <WizardScoreSheet
            session={session}
            registeredPlayers={registeredPlayers}
            onBack={onBack}
            onSessionUpdated={onSessionUpdated}
          />
        </Suspense>
      )}

      {/* Gemeinsame Aktionen */}
      {!isWizard || isSessionActive ? (
        <div style={styles.actions}>
          <button style={styles.btnPrimary} onClick={toggleForm}>
            {showForm ? "✕ Abbrechen" : (isWizard ? "＋ Neue Runde" : "＋ Neues Spiel")}
          </button>
          {RulesComponent && (
            <button style={styles.btnSecondary} onClick={() => setShowRules(!showRules)}>
              {showRules ? "✕ Regeln ausblenden" : "📜 Regeln"}
            </button>
          )}
          {activeRounds.length > 0 && !showForm && (
            <button style={styles.btnUndo} onClick={handleUndo}>↩ Rückgängig</button>
          )}
        </div>
      ) : null}

      {showRules && (
        <Suspense fallback={<div style={{ padding: 20, textAlign: "center" }}>Laden...</div>}>
          <RulesComponent />
        </Suspense>
      )}

      {/* Formular */}
      {showForm && (
        <Suspense fallback={<div style={{ padding: 20, textAlign: "center" }}>Laden...</div>}>
          {isWizard ? (
            <FormComponent
              round={editingRound}
              players={players}
              currentRound={currentRound}
              maxRounds={maxRounds}
              predictions={predictions}
              tricks={tricks}
              onPredictionChange={setPredictions}
              onTricksChange={setTricks}
              onSave={handleSubmit}
              onCancel={handleCancel}
            />
          ) : (
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
          )}
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

      {/* Session beenden Modal */}
      {showEndSession && isWizard && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "#fdf6e3",
            padding: 24,
            borderRadius: 12,
            maxWidth: 400,
            width: "100%",
            border: "2px solid #8b6914",
          }}>
            <h3 style={{ ...styles.formTitle, marginBottom: 12 }}>Session beenden?</h3>
            <p style={{ fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
              {isSessionActive 
                ? `Alle ${maxRounds} Runden wurden gespielt. Sollen die Session wirklich beendet werden?`
                : "Diese Session ist bereits beendet."
              }
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                style={{ ...styles.btnSecondary, flex: 1 }}
                onClick={() => setShowEndSession(false)}
              >
                Abbrechen
              </button>
              {isSessionActive && (
                <button
                  style={{ ...styles.btnPrimary, flex: 1, background: "#9d0208" }}
                  onClick={handleEndSession}
                >
                  ✓ Beenden
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
