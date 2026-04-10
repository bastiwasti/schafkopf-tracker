import { getEnabledGameTypes, calcSpielwert } from "./logic.js";
import styles from "../../components/styles.js";

export default function GameForm({ form, onFormChange, players, stake, bock, sessionOptions = {}, onSubmit, _onCancel, submitLabel }) {
  const isSolo = form.type !== "Sauspiel";
  const liveSpielwert = calcSpielwert({ ...form, stake, bock });
  const gameTypes = getEnabledGameTypes(sessionOptions);

  const setForm = (patch) => onFormChange({ ...form, ...patch });

  const toggleKlopfer = (p) => {
    const klopfer = form.klopfer.includes(p)
      ? form.klopfer.filter((x) => x !== p)
      : [...form.klopfer, p];
    setForm({ klopfer });
  };

  return (
    <div style={styles.formBox}>
      <h3 style={styles.formTitle}>Spiel eintragen</h3>

      <div style={styles.spielwertPreview}>
        <span style={styles.spielwertLabel}>Spielwert</span>
        <span style={styles.spielwertAmount}>{liveSpielwert.toFixed(2)} €</span>
        <span style={styles.spielwertSub}>pro Gegner</span>
      </div>

      {bock > 1 && (
        <div style={styles.bockFormHint}>🔥 Bockrunde ×{bock} aktiv</div>
      )}

      <label style={styles.label}>Spielart</label>
      <div style={styles.chipRow}>
        {gameTypes.map((gt) => (
          <button
            key={gt.name}
            style={{ ...styles.chip, ...(form.type === gt.name ? styles.chipActive : {}) }}
            onClick={() => setForm({ type: gt.name })}
          >
            {gt.name}
            <span style={styles.chipMult}>×{gt.multiplier}</span>
          </button>
        ))}
      </div>

      <label style={styles.label}>Spieler (Ansager)</label>
      <div style={styles.chipRow}>
        {players.map((p) => (
          <button
            key={p}
            style={{ ...styles.chip, ...(form.player === p ? styles.chipActive : {}) }}
            onClick={() => setForm({
              player: p,
              partner: players.find((x) => x !== p && x !== form.partner) || players.find((x) => x !== p),
            })}
          >{p}</button>
        ))}
      </div>

      {!isSolo && (
        <>
          <label style={styles.label}>Partner</label>
          <div style={styles.chipRow}>
            {players.filter((p) => p !== form.player).map((p) => (
              <button
                key={p}
                style={{ ...styles.chip, ...(form.partner === p ? styles.chipActive : {}) }}
                onClick={() => setForm({ partner: p })}
              >{p}</button>
            ))}
          </div>
        </>
      )}

      <label style={styles.label}>Klopfer 👊</label>
      <div style={styles.chipRow}>
        {players.map((p) => (
          <button
            key={p}
            style={{ ...styles.chip, ...(form.klopfer.includes(p) ? styles.chipKlopf : {}) }}
            onClick={() => toggleKlopfer(p)}
          >
            {form.klopfer.includes(p) ? "👊 " : ""}{p}
          </button>
        ))}
        {form.klopfer.length > 0 && (
          <span style={styles.klopfInfo}>×{Math.pow(2, form.klopfer.length)}</span>
        )}
      </div>

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
        <div style={styles.laufendeRow}>
          <span style={styles.checkText}>Laufende:</span>
          <button style={styles.btnSmall}
            onClick={() => setForm({ laufende: Math.max(0, form.laufende - 1) })}>−</button>
          <span style={styles.laufendeVal}>{form.laufende}</span>
          <button style={styles.btnSmall}
            onClick={() => setForm({ laufende: form.laufende + 1 })}>+</button>
        </div>
      </div>

      <button style={styles.btnConfirm} onClick={onSubmit}>
        {submitLabel ?? `✓ Spiel eintragen — Spielwert ${liveSpielwert.toFixed(2)} €`}
      </button>
    </div>
  );
}
