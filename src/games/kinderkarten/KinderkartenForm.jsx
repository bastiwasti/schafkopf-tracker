import { useState, useEffect } from "react";
import styles from "../../components/styles.js";

export default function KinderkartenForm({ form, onFormChange, players, onSubmit, onCancel, submitLabel, session }) {
  const [localTrickCounts, setLocalTrickCounts] = useState({});

  useEffect(() => {
    if (form) {
      setLocalTrickCounts(form.trick_counts ?? {});
    }
  }, [form]);

  const kinderkartenOptions = session?.kinderkarten_options || {};
  const cardCount = kinderkartenOptions.card_count || 5;

  const getAvailableOptions = (player) => {
    const enteredCount = Object.values(localTrickCounts).reduce((sum, val) => sum + (val || 0), 0);
    const remaining = cardCount - enteredCount;

    if (remaining <= 0) {
      return [localTrickCounts[player] || 0];
    }

    const enteredOthers = Object.entries(localTrickCounts)
      .filter(([p]) => p !== player)
      .reduce((sum, [_, val]) => sum + (val || 0), 0);

    const maxForPlayer = cardCount - enteredOthers;
    const options = [];
    for (let i = 0; i <= maxForPlayer; i++) {
      options.push(i);
    }

    return options;
  };

  const setTrickCount = (player, value) => {
    const parsed = parseInt(value) || 0;
    const newCounts = { ...localTrickCounts, [player]: parsed };

    const playersWithValues = Object.keys(newCounts).filter(p => newCounts[p] !== undefined && newCounts[p] !== "");

    if (playersWithValues.length === players.length - 1) {
      const playerWithoutValue = players.find(p => !playersWithValues.includes(p));
      const enteredSum = Object.values(newCounts).reduce((sum, val) => sum + (val || 0), 0);
      const remaining = cardCount - enteredSum;

      if (remaining >= 0) {
        newCounts[playerWithoutValue] = remaining;
      }
    }

    setLocalTrickCounts(newCounts);
    onFormChange({ trick_counts: newCounts });
  };

  const handleSubmit = () => {
    onSubmit({ trick_counts: localTrickCounts });
  };

  return (
    <div style={styles.formBox}>
      <h3 style={styles.formTitle}>Runde eintragen</h3>

      <label style={styles.label}>Stiche pro Spieler (max. {cardCount} pro Runde)</label>
      {players.map((p) => (
        <div key={p} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ minWidth: 100, fontWeight: 500 }}>{p}</span>
            <select
              value={localTrickCounts[p] ?? ""}
              onChange={(e) => setTrickCount(p, parseInt(e.target.value))}
              style={{
                ...styles.input,
                flex: 1,
                cursor: "pointer",
              }}
            >
              <option value="">Wählen...</option>
              {getAvailableOptions(p).map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
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
