import { useState, useEffect } from "react";
import styles from "../../components/styles.js";

export default function RommeForm({ form, onFormChange, players, onSubmit, onCancel, submitLabel }) {
  const [localWinner, setLocalWinner] = useState("");
  const [localScores, setLocalScores] = useState({});

  useEffect(() => {
    if (form) {
      setLocalWinner(form.winner ?? "");
      setLocalScores(form.scores ?? {});
    }
  }, [form]);

  const setScore = (player, value) => {
    const parsed = parseInt(value) || 0;
    setLocalScores(prev => ({ ...prev, [player]: parsed }));
    onFormChange({ winner: localWinner, scores: { ...localScores, [player]: parsed } });
  };

  const handleSubmit = () => {
    if (!localWinner) {
      alert("Bitte wähle einen Gewinner aus");
      return;
    }

    const nonWinners = players.filter(p => p !== localWinner);
    for (const player of nonWinners) {
      if (localScores[player] === undefined || localScores[player] === 0) {
        alert(`Bitte gib Punkte für ${player} ein`);
        return;
      }
    }

    onSubmit({ winner: localWinner, scores: localScores });
  };

  const setWinner = (winner) => {
    setLocalWinner(winner);
    onFormChange({ winner, scores: localScores });
  };

  return (
    <div style={styles.formBox}>
      <h3 style={styles.formTitle}>Runde eintragen</h3>

      <label style={styles.label}>Gewinner</label>
      <div style={styles.chipRow}>
        {players.map((p) => (
          <button
            key={p}
            style={{ ...styles.chip, ...(localWinner === p ? styles.chipActive : {}) }}
            onClick={() => setWinner(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <label style={styles.label}>Minus-Punkte</label>
      {players.filter(p => p !== localWinner).map((p) => (
        <div key={p} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ minWidth: 100, fontWeight: 500 }}>{p}</span>
            <input
              type="number"
              min="0"
              value={localScores[p] ?? ""}
              onChange={(e) => setScore(p, e.target.value)}
              style={{
                ...styles.input,
                flex: 1,
              }}
              placeholder="Punkte"
            />
          </div>
        </div>
      ))}

      <div style={styles.actions}>
        <button
          style={{ ...styles.btnPrimary, flex: 1 }}
          onClick={handleSubmit}
        >
          {submitLabel || "✓ Runde eintragen"}
        </button>
        <button
          style={{ ...styles.btnSecondary, flex: 1 }}
          onClick={onCancel}
        >
          ✕ Abbrechen
        </button>
      </div>
    </div>
  );
}
