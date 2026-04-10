import { useState, useEffect } from "react";
import styles from "../../components/styles.js";

export default function RoundForm({ round, players, currentRound, _maxRounds, predictions, tricks, onPredictionChange, onTricksChange, onSave, onCancel }) {
  const [localPredictions, setLocalPredictions] = useState({});
  const [localTricks, setLocalTricks] = useState({});

  // Initialize form from round data
  useEffect(() => {
    if (predictions && Object.keys(predictions).length > 0) {
      setLocalPredictions({ ...predictions });
    } else if (round) {
      setLocalPredictions({ ...round.predictions });
    } else {
      const defaultPreds = {};
      players.forEach(p => {
        defaultPreds[p] = 0;
      });
      setLocalPredictions(defaultPreds);
    }

    if (tricks && Object.keys(tricks).length > 0) {
      setLocalTricks({ ...tricks });
    } else if (round) {
      setLocalTricks({ ...round.tricks });
    } else {
      const defaultTricks = {};
      players.forEach(p => {
        defaultTricks[p] = 0;
      });
      setLocalTricks(defaultTricks);
    }
  }, [round, players, predictions, tricks]);

  // Live-Score-Berechnung
  const scores = {};
  players.forEach(p => {
    const pred = localPredictions[p] ?? 0;
    const act = localTricks[p] ?? 0;
    const diff = pred - act;

    if (diff === 0) {
      scores[p] = 20 + (act * 10);
    } else {
      scores[p] = -(Math.abs(diff) * 10);
    }
  });

  const handlePredictionChange = (player, value) => {
    setLocalPredictions(prev => ({
      ...prev,
      [player]: Math.max(0, Math.min(currentRound, parseInt(value) || 0))
    }));
    onPredictionChange(player, value);
  };

  const handleTricksChange = (player, value) => {
    setLocalTricks(prev => ({
      ...prev,
      [player]: Math.max(0, Math.min(currentRound, parseInt(value) || 0))
    }));
    onTricksChange(player, value);
  };

  const canSubmit = players.every(p =>
    localPredictions[p] !== undefined &&
    localPredictions[p] !== null &&
    localTricks[p] !== undefined &&
    localTricks[p] !== null
  );

  return (
    <div style={styles.newSessionForm}>
      <h3 style={{ ...styles.formTitle, marginBottom: 16 }}>
        {round ? `Runde ${round.round_number} bearbeiten` : `Runde ${currentRound} eintragen`}
      </h3>

      {/* Spieler-Tabelle */}
      <div style={{
        background: "#fdf6e3",
        border: "1.5px solid #8b6914",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "auto repeat(3, 1fr)",
          gap: "12px",
          marginBottom: "12px",
          fontWeight: "bold",
          color: "#2c1810",
          fontSize: 13,
        }}>
          <div>Spieler</div>
          <div>Vorhersage</div>
          <div>Tatsächlich</div>
          <div style={{ textAlign: "center" }}>Punkte</div>
        </div>

        {players.map((p, idx) => {
          const score = scores[p] ?? 0;
          const avatarMap = {
            "Basti": "🃏",
            "Fabi": "⚡",
            "Patrick": "🥨",
            "Testor": "🎲",
          };
          const avatar = avatarMap[p] || "🃏";

          return (
            <div key={p} style={{
              display: "grid",
              gridTemplateColumns: "auto repeat(3, 1fr)",
              gap: "12px",
              padding: "12px 0",
              borderBottom: idx < players.length - 1 ? "1px solid #d4c49a" : "none",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span style={{ fontSize: 20 }}>{avatar}</span>
                <span>{p}</span>
              </div>

              <div>
                <input
                  type="number"
                  min="0"
                  max={currentRound}
                  value={localPredictions[p]}
                  onChange={(e) => handlePredictionChange(p, e.target.value)}
                  style={{
                    ...styles.input,
                    width: "70px",
                    padding: "8px 12px",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                />
              </div>

              <div>
                <input
                  type="number"
                  min="0"
                  max={currentRound}
                  value={localTricks[p]}
                  onChange={(e) => handleTricksChange(p, e.target.value)}
                  style={{
                    ...styles.input,
                    width: "70px",
                    padding: "8px 12px",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                />
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: score >= 0 ? "#2d6a4f" : "#9d0208",
                fontSize: 16,
              }}>
                {score >= 0 ? "+" : ""}{score}
              </div>
            </div>
          );
        })}

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 16,
          paddingTop: 16,
          borderTop: "2px solid #8b6914",
        }}>
          <div style={{ fontWeight: "bold", fontSize: 14 }}>
            Gesamtpunkte: {Object.values(scores).reduce((sum, s) => sum + s, 0)}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          style={{
            ...styles.btnConfirm,
            flex: 1,
            opacity: canSubmit ? 1 : 0.5,
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
          onClick={onSave}
          disabled={!canSubmit}
        >
          {round ? "Änderungen speichern" : "Runde speichern"}
        </button>
        <button style={styles.btnSecondary} onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}
