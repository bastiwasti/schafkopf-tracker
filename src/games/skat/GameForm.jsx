import { GAME_TYPES, calcSpielwert } from "./logic.js";
import styles from "../../components/styles.js";

export default function GameForm({ form, onFormChange, players, stake, bock, onSubmit, onCancel, submitLabel }) {
  const liveSpielwert = calcSpielwert({ ...form, stake, bock });

  const setForm = (patch) => onFormChange({ ...form, ...patch });

  const isKontra = form.game_type === "Kontra";
  const isFarbe = ["Kreuz", "Pik", "Herz"].includes(form.game_type);
  const isGrand = form.game_type === "Grand";
  const isNull = form.game_type === "Null";

  const getMaxLaufende = () => {
    if (isGrand) return 4;
    if (isFarbe) return 2;
    return 0;
  };

  const minLaufende = 0;
  const maxLaufende = getMaxLaufende();

  return (
    <div style={styles.formBox}>
      <h3 style={styles.formTitle}>Spiel eintragen</h3>

      <div style={styles.spielwertPreview}>
        <span style={styles.spielwertLabel}>Spielwert</span>
        <span style={styles.spielwertAmount}>{liveSpielwert.toFixed(2)} €</span>
        <span style={styles.spielwertSub}>Punkte × Einsatz</span>
      </div>

      {bock > 1 && (
        <div style={styles.bockFormHint}>🔥 Bockrunde ×{bock} aktiv</div>
      )}

      <label style={styles.label}>Spielart</label>
      <div style={styles.chipRow}>
        {GAME_TYPES.map((gt) => (
          <button
            key={gt.name}
            style={{ ...styles.chip, ...(form.game_type === gt.name ? styles.chipActive : {}) }}
            onClick={() => setForm({ game_type: gt.name, laufende: 0 })}
          >
            {gt.name}
            <span style={styles.chipMult}>×{gt.multiplier}</span>
          </button>
        ))}
      </div>

      <label style={styles.label}>Alleinspieler</label>
      <div style={styles.chipRow}>
        {players.map((p) => (
          <button
            key={p}
            style={{ ...styles.chip, ...(form.declarer === p ? styles.chipActive : {}) }}
            onClick={() => setForm({ declarer: p })}
          >{p}</button>
        ))}
      </div>

      {(isFarbe || isGrand) && (
        <>
          <label style={styles.label}>Partner (optional)</label>
          <div style={styles.chipRow}>
            <button
              style={{ ...styles.chip, ...(form.partner === null ? styles.chipActive : {}) }}
              onClick={() => setForm({ partner: null })}
            >Kein Partner</button>
            {players.filter((p) => p !== form.declarer).map((p) => (
              <button
                key={p}
                style={{ ...styles.chip, ...(form.partner === p ? styles.chipActive : {}) }}
                onClick={() => setForm({ partner: p })}
              >{p}</button>
            ))}
          </div>
        </>
      )}

      {isKontra && (
        <>
          <label style={styles.label}>Kontra-Spieler</label>
          <div style={styles.chipRow}>
            {players.filter((p) => p !== form.declarer).map((p) => (
              <button
                key={p}
                style={{ ...styles.chip, ...(form.contra === p ? styles.chipActive : {}) }}
                onClick={() => setForm({ contra: p })}
              >{p}</button>
            ))}
          </div>

          <label style={styles.label}>Kontra-Multiplikator</label>
          <div style={styles.chipRow}>
            {[1, 2, 3, 4].map((m) => (
              <button
                key={m}
                style={{ ...styles.chip, ...(form.kontra_multiplier === m ? styles.chipActive : {}) }}
                onClick={() => setForm({ kontra_multiplier: m })}
              >×{m}</button>
            ))}
          </div>
        </>
      )}

      {!isNull && (
        <>
          <label style={styles.label}>Ergebnis</label>
          <div style={styles.chipRow}>
            <button
              style={{ ...styles.chip, ...(form.won ? styles.chipWon : {}) }}
              onClick={() => setForm({ won: true })}
            >✓ Gewonnen</button>
            <button
              style={{ ...styles.chip, ...(!form.won ? styles.chipLost : {}) }}
              onClick={() => setForm({ won: false })}
            >✕ Verloren</button>
          </div>

          <label style={styles.label}>Aufschläge</label>
          <div style={styles.modRow}>
            <label style={styles.checkLabel}>
              <input type="checkbox" checked={form.schneider}
                onChange={(e) => setForm({ schneider: e.target.checked })} />
              <span style={styles.checkText}>Schneider</span>
            </label>
            <label style={styles.checkLabel}>
              <input type="checkbox" checked={form.schwarz}
                onChange={(e) => setForm({ schwarz: e.target.checked })} />
              <span style={styles.checkText}>Schwarz</span>
            </label>
            {maxLaufende > 0 && (
              <div style={styles.laufendeRow}>
                <span style={styles.checkText}>Laufende:</span>
                <button style={styles.btnSmall}
                  onClick={() => setForm({ laufende: Math.max(minLaufende, form.laufende - 1) })}>−</button>
                <span style={styles.laufendeVal}>{form.laufende}</span>
                <button style={styles.btnSmall}
                  onClick={() => setForm({ laufende: Math.min(maxLaufende, form.laufende + 1) })}>+</button>
              </div>
            )}
          </div>
        </>
      )}

      <button style={styles.btnConfirm} onClick={onSubmit}>
        {submitLabel ?? `✓ Spiel eintragen — ${liveSpielwert.toFixed(2)} €`}
      </button>
    </div>
  );
}
