import { useState, useEffect } from "react";
import styles from "../../components/styles.js";
import RoundForm from "./RoundForm.jsx";
import HistoryCard from "./HistoryCard.jsx";
import RulesBox from "./RulesBox.jsx";

export default function ScoreSheet({ session, registeredPlayers = [], onBack, onSessionUpdated }) {
  const [showForm, setShowForm] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [editingRound, setEditingRound] = useState(null);
  const [predictions, setPredictions] = useState({});
  const [tricks, setTricks] = useState({});
  const [showEndSession, setShowEndSession] = useState(false);

  const { players, history = [], game_type } = session;
  const avatarMap = Object.fromEntries(registeredPlayers.map((p) => [p.name, p.avatar]));

  // Aktive Runden (kein Archiv bei Wizard)
  const activeRounds = history;
  
  // Gesamtpunkte berechnen
  const balances = {};
  players.forEach((p) => (balances[p] = 0));
  activeRounds.forEach((r) => {
    players.forEach((p) => {
      balances[p] += r.scores[p] || 0;
    });
  });

  // Führender Spieler bestimmen
  const maxScore = Math.max(...Object.values(balances));
  const leader = maxScore > 0 
    ? players.reduce((a, b) => (balances[a] >= balances[b] ? a : b))
    : null;

  // Session-Status bestimmen
  const maxRounds = getMaxRounds(players.length);
  const currentRound = activeRounds.length + 1;
  const isSessionActive = currentRound <= maxRounds;

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

  const handleUndo = async () => {
    if (!confirm("Letzte Runde rückgängig machen?")) return;
    
    const res = await fetch(`/api/sessions/${session.id}/wizard-rounds/last`, {
      method: "DELETE",
    });
    if (res.ok) {
      const lastActive = [...activeRounds].pop();
      if (lastActive) {
        onSessionUpdated({
          ...session,
          history: [...activeRounds],
        });
      }
    }
  };

  const handleEdit = (round) => {
    setEditingRound(round);
    setPredictions({ ...round.predictions });
    setTricks({ ...round.tricks });
    setShowForm(true);
  };

  const handleArchive = async (roundId) => {
    if (!confirm("Runde ins Archiv verschieben?")) return;
    
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

  const handleUpdate = async (roundData) => {
    if (!editingRound) return;
    
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

  const handleSubmit = () => {
    const roundData = {
      predictions,
      tricks,
    };

    if (editingRound) {
      handleUpdate(roundData);
    } else {
      handleRoundSaved(roundData);
    }
  };

  // Live-Score-Berechnung
  const liveScores = {};
  players.forEach(p => {
    const pred = predictions[p] ?? 0;
    const act = tricks[p] ?? 0;
    const diff = pred - act;
    
    if (diff === 0) {
      liveScores[p] = 20 + (act * 10);
    } else {
      liveScores[p] = -(Math.abs(diff) * 10);
    }
  });

  return (
    <div style={styles.container}>
      <div style={styles.sessionHeader}>
        <button style={styles.backBtn} onClick={onBack}>← Runden</button>
        <div style={{ flex: 1 }}>
          <div style={styles.sessionTitle}>{session.name}</div>
          <div style={styles.sessionSubtitle}>
            Wizard · {players.join(", ")} · {isSessionActive ? `Runde ${currentRound}/${maxRounds} (${activeRounds.length}/${maxRounds})` : `✓ Beendet (${activeRounds.length}/${maxRounds})`}
          </div>
        </div>
        {isSessionActive && (
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
      </div>

      {/* Session-Status Badge */}
      {!isSessionActive && (
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

      {/* Scoreboard */}
      <div style={styles.scoreboard}>
        {players.map((p) => {
          const score = balances[p] ?? 0;
          const isLeader = p === leader && score > 0;
          const avatar = avatarMap[p] ?? "❓";
          return (
            <div key={p} style={{ ...styles.playerCard, ...(isLeader ? styles.leaderCard : {}) }}>
              {isLeader && <div style={styles.crownBadge}>👑</div>}
              <div style={styles.playerCardAvatar}>{avatar}</div>
              <div style={styles.playerName}>{p}</div>
              <div style={{
                ...styles.playerBalance,
                color: score > 0 ? "#2d6a4f" : score < 0 ? "#9d0208" : "#555",
              }}>
                {score >= 0 ? "+" : ""}{score.toFixed(0)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Aktionen */}
      {!isSessionActive && (
        <div style={styles.actions}>
          <button style={styles.btnPrimary} onClick={() => {
            if (showForm) {
              setShowForm(false);
              setPredictions({});
              setTricks({});
              setEditingRound(null);
            } else {
              setShowForm(true);
            }
          }}>
            {showForm ? "✕ Abbrechen" : "＋ Neue Runde"}
          </button>
          {activeRounds.length > 0 && !showForm && (
            <button style={styles.btnUndo} onClick={handleUndo}>↩ Rückgängig</button>
          )}
          <button
            style={{
              ...styles.btnSecondary,
              padding: "8px 12px",
            }}
            onClick={() => setShowRules(!showRules)}
          >
            {showRules ? "✕ Regeln ausblenden" : "📜 Regeln"}
          </button>
        </div>
      )}

      {/* Runden-Formular */}
      {isSessionActive && showForm && (
        <RoundForm
          round={editingRound}
          players={players}
          currentRound={currentRound}
          maxRounds={maxRounds}
          predictions={predictions}
          tricks={tricks}
          onPredictionChange={setPredictions}
          onTricksChange={setTricks}
          onSave={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setPredictions({});
            setTricks({});
            setEditingRound(null);
          }}
        />
      )}

      {/* Regeln */}
      {showRules && <RulesBox />}

      {/* Runden-Liste (immer alle Runden sichtbar) */}
      <div style={styles.historySection}>
        <h3 style={styles.historyTitle}>Score Sheet</h3>
        {activeRounds.length === 0 && (
          <p style={styles.emptyMsg}>Noch keine Runden eingetragen.</p>
        )}
        {[...activeRounds].reverse().map((r) => (
          <HistoryCard
            key={r.id}
            round={r}
            players={players}
            avatarMap={avatarMap}
            onEdit={handleEdit}
            onArchive={handleArchive}
          />
        ))}
      </div>

      {/* Session beenden Modal */}
      {showEndSession && (
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
                : "Diese Session ist bereits beendet."}
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

function getMaxRounds(playerCount) {
  const counts = { 3: 20, 4: 15, 5: 12, 6: 10 };
  return counts[playerCount] || 15;
}
