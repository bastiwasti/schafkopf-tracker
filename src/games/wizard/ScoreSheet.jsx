import { useState, useEffect } from "react";
import styles from "../../components/styles.js";
import RulesBox from "./RulesBox.jsx";
import { buildWizardCommentary } from "./commentary.js";
import CommentaryOverlay from "../../components/CommentaryOverlay.jsx";
import CommentarySettingsPanel from "../../components/CommentarySettingsPanel.jsx";
import useCommentatorSettings from "../../hooks/useCommentatorSettings.js";
import ErrorBoundary from "../../components/ErrorBoundary.jsx";

export default function ScoreSheet({ session, registeredPlayers = [], onBack, onSessionUpdated }) {
  const [showRules, setShowRules] = useState(false);
  const [showCommentatorSettings, setShowCommentatorSettings] = useState(false);
  const [pendingCommentary, setPendingCommentary] = useState(null);
  const [editingRound, setEditingRound] = useState(null);
  const { personality, voice, enabled, setPersonality, setVoice, setEnabled } = useCommentatorSettings();
  const [predictions, setPredictions] = useState({});
  const [tricks, setTricks] = useState({});
  const [showEndSession, setShowEndSession] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  // State für alle Runden-Zwischenstände
  const [roundsData, setRoundsData] = useState({});
  
  // State für Runden-Phasen: 'prediction', 'tricks', 'completed'
  const [roundPhases, setRoundPhases] = useState({});

  // Hilfsfunktionen für Workflow
  const startPredictionPhase = (roundNum) => {
    setRoundPhases(prev => ({ ...prev, [roundNum]: 'prediction' }));
    setRoundsData(prev => ({
      ...prev,
      [roundNum]: {
        predictions: {},
        tricks: {},
      }
    }));
    setEditingRound({ id: `new-${Date.now()}-${roundNum}`, round_number: roundNum, predictions: {}, tricks: {} });
    setPredictions({});
    setTricks({});
  };

  const finishPredictionPhase = (roundNum) => {
    setRoundPhases(prev => ({ ...prev, [roundNum]: 'tricks' }));
  };

  const finishTricksPhase = async (roundNum) => {
    const data = roundsData[roundNum];
    if (!data) {
      console.error('No data found for round:', roundNum);
      return;
    }

    const { predictions, tricks } = data;
    const currentHistory = Array.isArray(history) ? history : [];
    
    // Prüfen ob Runde bereits existiert
    const existingRound = currentHistory.find(r => r.round_number === roundNum);
    
    try {
      if (existingRound) {
        // Bearbeitete Runde aktualisieren
        const res = await fetch(`/api/sessions/${session.id}/wizard-rounds/${existingRound.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ predictions, tricks }),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Failed to update round:', res.status, errorText);
          alert('Fehler beim Aktualisieren der Runde: ' + errorText);
          return;
        }
        
        const updated = await res.json();
        console.log('Updated round:', updated);
        onSessionUpdated({
          ...session,
          history: currentHistory.map((r) => (r.id === updated.id ? updated : r)),
        });
      } else {
        // Neue Runde speichern
        const res = await fetch(`/api/sessions/${session.id}/wizard-rounds`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ predictions, tricks }),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Failed to save round:', res.status, errorText);
          alert('Fehler beim Speichern der Runde: ' + errorText);
          return;
        }
        
        const newRound = await res.json();
        console.log('Saved new round:', newRound);
        
        try {
          onSessionUpdated({
            ...session,
            history: [...currentHistory, newRound],
          });
          
          if (enabled && newRound) {
            console.log('[ScoreSheet] Setting pending commentary for round:', newRound);
            setPendingCommentary(newRound);
          }
        } catch (error) {
          console.error('[ScoreSheet] Error updating session or setting commentary:', error);
          alert('Fehler beim Aktualisieren der Session: ' + error.message);
          return;
        }
      }

      // State zurücksetzen
      setRoundPhases(prev => {
        const newPhases = { ...prev };
        delete newPhases[roundNum];
        return newPhases;
      });
      setRoundsData(prev => {
        const newData = { ...prev };
        delete newData[roundNum];
        return newData;
      });
      setPredictions({});
      setTricks({});
      setEditingRound(null);
    } catch (error) {
      console.error('Error saving round:', error);
      alert('Fehler beim Speichern der Runde: ' + error.message);
    }
  };

  const editSavedRound = (roundNum) => {
    const round = (history || []).find(r => r.round_number === roundNum);
    if (!round) return;

    setRoundPhases(prev => ({ ...prev, [roundNum]: 'prediction' }));
    setRoundsData(prev => ({
      ...prev,
      [roundNum]: {
        predictions: round.predictions,
        tricks: round.tricks,
        id: round.id,
      }
    }));
    setEditingRound({ id: `edit-${roundNum}`, round_number: roundNum, predictions: round.predictions, tricks: round.tricks });
    setPredictions(round.predictions);
    setTricks(round.tricks);
  };

  const cancelRound = (roundNum) => {
    setRoundPhases(prev => {
      const newPhases = { ...prev };
      delete newPhases[roundNum];
      return newPhases;
    });
    setRoundsData(prev => {
      const newData = { ...prev };
      delete newData[roundNum];
      return newData;
    });
    setPredictions({});
    setTricks({});
    setEditingRound(null);
  };

  // Wizard-Runden beim Start laden (sessions-Endpoint liefert nur Schafkopf-Games)
  useEffect(() => {
    const loadRounds = async () => {
      try {
        const r = await fetch(`/api/sessions/${session.id}/wizard-rounds`);
        if (r.ok) {
          const rounds = await r.json();
          if (Array.isArray(rounds) && rounds.length > 0) {
            onSessionUpdated({ ...session, history: rounds });
          }
        }
      } catch (error) {
        console.error('Error loading wizard rounds:', error);
      }
    };
    loadRounds();
  }, [session.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const { players, history = [] } = session;
  const avatarMap = Object.fromEntries(registeredPlayers.map((p) => [p.name, p.avatar]));

  // Aktive Runden (kein Archiv bei Wizard)
  const activeRounds = Array.isArray(history) ? history : [];
  
  // Gesamtpunkte berechnen
  const balances = {};
  players.forEach((p) => (balances[p] = 0));
  activeRounds.forEach((r) => {
    if (r && r.scores && typeof r.scores === 'object') {
      players.forEach((p) => {
        balances[p] += r.scores[p] || 0;
      });
    }
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
    const currentHistory = Array.isArray(history) ? history : [];
    try {
      const res = await fetch(`/api/sessions/${session.id}/wizard-rounds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roundData),
      });
      if (res.ok) {
        const newRound = await res.json();
        onSessionUpdated({
          ...session,
          history: [...currentHistory, newRound],
        });
        setPredictions({});
        setTricks({});
        setEditingRound(null);
        setRoundsData({});
      } else {
        console.error('Failed to save round:', await res.text());
        alert('Fehler beim Speichern der Runde');
      }
    } catch (error) {
      console.error('Error saving round:', error);
      alert('Fehler beim Speichern der Runde: ' + error.message);
    }
  };

  const handleUndo = async () => {
    if (!confirm("Letzte Runde rückgängig machen?")) return;
    
    try {
      const res = await fetch(`/api/sessions/${session.id}/wizard-rounds/last`, {
        method: "DELETE",
      });
      if (res.ok) {
        const updatedHistory = activeRounds.slice(0, -1);
        onSessionUpdated({
          ...session,
          history: updatedHistory,
        });
      } else {
        console.error('Failed to undo:', await res.text());
        alert('Fehler beim Rückgängig machen');
      }
    } catch (error) {
      console.error('Error undoing round:', error);
      alert('Fehler beim Rückgängig machen');
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

  return (
    <>
      {/* Commentary overlay */}
      {pendingCommentary && (
        <ErrorBoundary>
          <CommentaryOverlay
            game={pendingCommentary}
            buildFn={buildWizardCommentary}
            registeredPlayers={registeredPlayers}
            commentatorPersonality={personality}
            commentatorVoice={voice}
            onClose={() => {
              console.log('[ScoreSheet] Commentary overlay closing');
              setPendingCommentary(null);
            }}
          />
        </ErrorBoundary>
      )}

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
      <div style={styles.actions}>
        {isSessionActive && activeRounds.length > 0 && (
          <button style={styles.btnUndo} onClick={handleUndo}>↩ Rückgängig</button>
        )}
        <button
          style={{ ...styles.btnSecondary, padding: "8px 12px" }}
          onClick={() => setShowRules(!showRules)}
        >
          {showRules ? "✕ Regeln ausblenden" : "📜 Regeln"}
        </button>
        <button
          style={{ ...styles.btnGear, ...(showCommentatorSettings ? { background: "#2c1810", color: "#fdf6e3" } : {}) }}
          onClick={() => setShowCommentatorSettings((v) => !v)}
          title="Kommentator einstellen"
        >
          🎙️
        </button>
      </div>

      {showCommentatorSettings && (
        <CommentarySettingsPanel
          personality={personality} voice={voice} enabled={enabled}
          onPersonality={setPersonality} onVoice={setVoice} onEnabled={setEnabled}
        />
      )}

      {/* Regeln (modal) */}
      {showRules && (
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
            maxWidth: 500,
            width: "80%", minWidth: 0,
            border: "2px solid #8b6914",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button
                style={styles.btnSecondary}
                onClick={() => setShowRules(false)}
              >
                ✕ Schließen
              </button>
            </div>
            <RulesBox />
          </div>
        </div>
      )}

      {/* Runden-Tabelle */}
      <div style={styles.historySection}>
        <div style={{ marginBottom: 12 }}>
          <h3 style={styles.historyTitle}>Score Sheet</h3>
          {Object.keys(roundPhases).length > 0 && (
            <div style={{
              background: "#e3f2fd",
              color: "#1976d2",
              padding: "8px 12px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: "bold",
              display: "inline-block",
              marginTop: 8,
            }}>
              Bearbeite Runde {Object.keys(roundPhases).join(", ")}
            </div>
          )}
        </div>
          <div style={{
            background: "#fdf6e3",
            border: "1.5px solid #8b6914",
            borderRadius: 12,
            padding: 12,
            maxWidth: "100%",
            overflow: "hidden",
          }}>
          {/* Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `28px repeat(${players.length}, 1fr) 76px`,
            gap: "3px",
            marginBottom: "6px",
            fontWeight: "bold",
            color: "#2c1810",
            fontSize: 10,
          }}>
            <div style={{ textAlign: "center", padding: "3px" }}>R</div>
            {players.map(p => (
              <div key={p} style={{ textAlign: "center", padding: "3px", fontSize: 10, lineHeight: 1.3 }}>
                <div>{avatarMap[p] || "🃏"}</div>
                <div style={{ fontSize: 9, fontWeight: "normal", marginTop: 1 }}>{p}</div>
              </div>
            ))}
            <div style={{ textAlign: "center", padding: "3px", fontSize: 9, color: "#8b6914" }}></div>
          </div>

          {Array.from({ length: maxRounds }, (_, i) => {
            const roundNum = i + 1;
            const round = (history || []).find(r => r.round_number === roundNum);
            const isSaved = !!round;

            const phase = roundPhases[roundNum];
            const isEditing = !!roundsData[roundNum];

            const roundData = roundsData[roundNum] || round;
            const currentPredictions = roundData?.predictions || {};
            const currentTricks = roundData?.tricks || {};

            // Live scores berechnen
            const liveScores = {};
            players.forEach(p => {
              const pred = currentPredictions[p];
              const trick = currentTricks[p];
              if (pred !== undefined && trick !== undefined && pred !== "" && trick !== "") {
                const predNum = parseInt(pred) || 0;
                const trickNum = parseInt(trick) || 0;
                const diff = predNum - trickNum;
                liveScores[p] = diff === 0 ? 20 + (trickNum * 10) : -(Math.abs(diff) * 10);
              } else {
                liveScores[p] = round?.scores?.[p] ?? null;
              }
            });

            const handlePredictionChange = (player, value) => {
              const predNum = parseInt(value) || 0;
              setRoundsData(prev => ({
                ...prev,
                [roundNum]: {
                  ...prev[roundNum],
                  predictions: { ...(prev[roundNum]?.predictions || {}), [player]: predNum },
                  tricks: prev[roundNum]?.tricks || {},
                }
              }));
            };

            const handleTricksChange = (player, value) => {
              const trickNum = parseInt(value) || 0;
              setRoundsData(prev => ({
                ...prev,
                [roundNum]: {
                  ...prev[roundNum],
                  predictions: prev[roundNum]?.predictions || {},
                  tricks: { ...(prev[roundNum]?.tricks || {}), [player]: trickNum }
                }
              }));
            };

            const predictionsEnabled = phase === 'prediction';
            const tricksEnabled = phase === 'tricks';
            const showSavedValues = isSaved && !isEditing;

            const getAvailableTricks = (playerName) => {
              if (!tricksEnabled) return roundNum;
              const otherTricks = Object.entries(currentTricks)
                .filter(([name]) => name !== playerName)
                .reduce((sum, [, val]) => sum + (parseInt(val) || 0), 0);
              return roundNum - otherTricks;
            };

            // Dropdown-Stil
            const dropdownStyle = (active) => ({
              ...styles.input,
              width: "80%", minWidth: 0,
              padding: "2px 1px",
              fontSize: 11,
              textAlign: "center",
              background: active ? "#fff" : "#f0f0f0",
              border: active ? "1px solid #8b6914" : "1px solid #ddd",
              fontWeight: "bold",
              color: active ? "#2c1810" : "#bbb",
              cursor: active ? "pointer" : "default",
              borderRadius: 3,
            });

            return (
              <div
                key={roundNum}
                style={{
                  display: "grid",
                  gridTemplateColumns: `28px repeat(${players.length}, 1fr) 76px`,
                  gap: "3px",
                  padding: "5px 0",
                  borderBottom: roundNum < maxRounds ? "1px solid #e8ddb5" : "none",
                  backgroundColor: phase === 'prediction' ? "#e8f4fd" : phase === 'tricks' ? "#fff8e1" : "transparent",
                  borderRadius: phase ? 4 : 0,
                }}
              >
                {/* Rundennummer */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#8b6914", fontSize: 11 }}>
                  {roundNum}
                </div>

                {/* Spieler-Zellen */}
                {players.map(p => {
                  const currentPred = currentPredictions[p] ?? "";
                  const currentTrick = currentTricks[p] ?? "";
                  const displayScore = liveScores[p];
                  const scoreColor = displayScore !== null ? (displayScore >= 0 ? "#2d6a4f" : "#9d0208") : "#ccc";

                  return (
                    <div key={p} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      {showSavedValues ? (
                        // Gespeichert: kompakte "Vorhersage/Stiche" Anzeige
                        <>
                          <div style={{ fontSize: 10, color: "#555", letterSpacing: 0 }}>
                            <span style={{ fontWeight: "bold", color: "#2c1810" }}>{currentPred !== "" ? currentPred : "–"}</span>
                            <span style={{ color: "#bbb", margin: "0 1px" }}>/</span>
                            <span style={{ fontWeight: "bold", color: "#2c1810" }}>{currentTrick !== "" ? currentTrick : "–"}</span>
                          </div>
                          <div style={{ fontSize: 10, fontWeight: "bold", color: scoreColor }}>
                            {displayScore !== null ? (displayScore >= 0 ? "+" : "") + displayScore : "–"}
                          </div>
                        </>
                      ) : phase ? (
                        // Bearbeitungsmodus: gestapelte Dropdowns
                        <>
                          <select
                            value={currentPred}
                            onChange={(e) => handlePredictionChange(p, e.target.value)}
                            disabled={!predictionsEnabled}
                            style={dropdownStyle(predictionsEnabled)}
                          >
                            <option value="">–</option>
                            {Array.from({ length: roundNum + 1 }, (_, j) => j).map(val => (
                              <option key={val} value={val}>{val}</option>
                            ))}
                          </select>
                          <select
                            value={currentTrick}
                            onChange={(e) => handleTricksChange(p, e.target.value)}
                            disabled={!tricksEnabled}
                            style={dropdownStyle(tricksEnabled)}
                          >
                            <option value="">–</option>
                            {Array.from({ length: getAvailableTricks(p) + 1 }, (_, j) => j).map(val => (
                              <option key={val} value={val}>{val}</option>
                            ))}
                          </select>
                          {displayScore !== null && (
                            <div style={{ fontSize: 10, fontWeight: "bold", color: scoreColor }}>
                              {(displayScore >= 0 ? "+" : "") + displayScore}
                            </div>
                          )}
                        </>
                      ) : (
                        // Noch nicht gestartet
                        <div style={{ fontSize: 11, color: "#ccc" }}>–</div>
                      )}
                    </div>
                  );
                })}
                {/* Aktionen */}
                <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center", justifyContent: "center", padding: "2px 4px" }}>
                  {!phase && !isSaved && roundNum === currentRound && (
                    <button
                      style={{ ...styles.btnPrimary, width: "80%", minWidth: 0, fontSize: 10, padding: "5px 4px", background: "#1976d2", fontWeight: "bold" }}
                      onClick={() => startPredictionPhase(roundNum)}
                    >
                      Starten
                    </button>
                  )}
                  {phase === 'prediction' && (
                    <>
                      <div style={{ fontSize: 8, color: "#1976d2", fontWeight: "bold", textAlign: "center" }}>Vorhersage</div>
                      <button
                        style={{ ...styles.btnPrimary, width: "80%", minWidth: 0, fontSize: 10, padding: "4px", background: "#2d6a4f" }}
                        onClick={() => finishPredictionPhase(roundNum)}
                      >
                        Weiter →
                      </button>
                      <button
                        style={{ ...styles.btnSecondary, width: "80%", minWidth: 0, fontSize: 9, padding: "3px 4px" }}
                        onClick={() => cancelRound(roundNum)}
                      >
                        ✕
                      </button>
                    </>
                  )}
                  {phase === 'tricks' && (
                    <>
                      <div style={{ fontSize: 8, color: "#b45309", fontWeight: "bold", textAlign: "center" }}>Stiche</div>
                      <button
                        style={{ ...styles.btnPrimary, width: "80%", minWidth: 0, fontSize: 10, padding: "4px", background: "#2d6a4f" }}
                        onClick={() => finishTricksPhase(roundNum)}
                      >
                        ✓ Speichern
                      </button>
                      <button
                        style={{ ...styles.btnSecondary, width: "80%", minWidth: 0, fontSize: 9, padding: "3px 4px" }}
                        onClick={() => cancelRound(roundNum)}
                      >
                        ✕
                      </button>
                    </>
                  )}
                  {isSaved && !phase && (
                    <button
                      style={{ ...styles.btnSecondary, width: "80%", minWidth: 0, fontSize: 9, padding: "3px 4px", color: "#8b6914", borderColor: "#8b6914" }}
                      onClick={() => editSavedRound(roundNum)}
                    >
                      ✎ Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
            width: "80%", minWidth: 0,
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
    </>
  );
}

function getMaxRounds(playerCount) {
  const counts = { 3: 20, 4: 15, 5: 12, 6: 10 };
  return counts[playerCount] || 15;
}
