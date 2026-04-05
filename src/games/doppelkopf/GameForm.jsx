import { resolveGame } from "./logic.js";
import styles from "../../components/styles.js";

const ANSAGEN = [
  { key: "keine30", label: "Keine 30" },
  { key: "keine60", label: "Keine 60" },
  { key: "keine90", label: "Keine 90" },
  { key: "schwarz",  label: "Schwarz"   },
];

function SonderpunkteSection({ label, value, fuchsMax = 2, karlchenDisabled, onChange }) {
  const set = (field, val) => onChange({ ...value, [field]: val });

  return (
    <div style={{ marginBottom: 10 }}>
      <label style={styles.label}>{label}</label>
      <div style={styles.modRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={styles.checkText}>Fuchs:</span>
          <button style={styles.btnSmall} onClick={() => set("fuchs", Math.max(0, value.fuchs - 1))}>−</button>
          <span style={styles.laufendeVal}>{value.fuchs}</span>
          <button style={{ ...styles.btnSmall, opacity: value.fuchs >= fuchsMax ? 0.4 : 1 }} disabled={value.fuchs >= fuchsMax} onClick={() => set("fuchs", Math.min(fuchsMax, value.fuchs + 1))}>+</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={styles.checkText}>Doppelkopf:</span>
          <button style={styles.btnSmall} onClick={() => set("doppelkopf", Math.max(0, value.doppelkopf - 1))}>−</button>
          <span style={styles.laufendeVal}>{value.doppelkopf}</span>
          <button style={styles.btnSmall} onClick={() => set("doppelkopf", value.doppelkopf + 1)}>+</button>
        </div>
        <label style={{ ...styles.checkLabel, opacity: karlchenDisabled ? 0.4 : 1 }}>
          <input
            type="checkbox"
            checked={value.karlchen === 1}
            disabled={karlchenDisabled}
            onChange={(e) => set("karlchen", e.target.checked ? 1 : 0)}
          />
          <span style={styles.checkText}>Karlchen</span>
        </label>
      </div>
    </div>
  );
}

export default function GameForm({ form, onFormChange, players, stake, bock, soloValue = 3, onSubmit, onCancel, submitLabel }) {
  const { spielwert: liveSpielwert } = resolveGame({ ...form, bock, players, stake, soloValue });
  const isSolo = form.type === "Solo";

  const setForm = (patch) => onFormChange({ ...form, ...patch });

  const toggleAnsage = (key) => {
    setForm({ ansage: form.ansage === key ? null : key });
  };

  return (
    <div style={styles.formBox}>
      <h3 style={styles.formTitle}>Spiel eintragen</h3>

      <div style={styles.spielwertPreview}>
        <span style={styles.spielwertLabel}>Spielwert</span>
        <span style={styles.spielwertAmount}>{liveSpielwert.toFixed(2)} €</span>
        <span style={styles.spielwertSub}>pro Spieler</span>
      </div>

      {bock > 1 && (
        <div style={styles.bockFormHint}>🔥 Bockrunde ×{bock} aktiv</div>
      )}

      <label style={styles.label}>Spielart</label>
      <div style={styles.chipRow}>
        {["Normal", "Solo"].map((t) => (
          <button
            key={t}
            style={{ ...styles.chip, ...(form.type === t ? styles.chipActive : {}) }}
            onClick={() => setForm({ type: t })}
          >{t}</button>
        ))}
      </div>

      <label style={styles.label}>Ansager (Spieler)</label>
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
          <label style={styles.label}>Partner (Spieler)</label>
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

      <label style={styles.label}>Ergebnis (Spieler)</label>
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

      <label style={styles.label}>Ansagen</label>
      <div style={styles.modRow}>
        <label style={styles.checkLabel}>
          <input
            type="checkbox"
            checked={form.kontra}
            onChange={(e) => setForm({ kontra: e.target.checked })}
          />
          <span style={styles.checkText}>Kontra</span>
        </label>
      </div>
      <div style={styles.chipRow}>
        {ANSAGEN.map(({ key, label }) => (
          <button
            key={key}
            style={{ ...styles.chip, ...(form.ansage === key ? styles.chipActive : {}) }}
            onClick={() => toggleAnsage(key)}
          >{label}</button>
        ))}
      </div>

      <SonderpunkteSection
        label="Sonderpunkte Spieler"
        value={form.re_sonderpunkte}
        fuchsMax={2 - (form.kontra_sonderpunkte.fuchs ?? 0)}
        karlchenDisabled={form.kontra_sonderpunkte.karlchen === 1}
        onChange={(v) => setForm({ re_sonderpunkte: v })}
      />

      <SonderpunkteSection
        label="Sonderpunkte Gegenspieler"
        value={form.kontra_sonderpunkte}
        fuchsMax={2 - (form.re_sonderpunkte.fuchs ?? 0)}
        karlchenDisabled={form.re_sonderpunkte.karlchen === 1}
        onChange={(v) => setForm({ kontra_sonderpunkte: v })}
      />

      <button style={styles.btnConfirm} onClick={onSubmit}>
        {submitLabel ?? `✓ Spiel eintragen — Spielwert ${liveSpielwert.toFixed(2)} €`}
      </button>
    </div>
  );
}
