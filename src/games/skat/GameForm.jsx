import { calcSpielwert, FARB_GRAND_TYPES, NULL_TYPES, NULL_VALUES, isNullType, isFarbGrandType, isRamsch } from "./logic.js";
import styles from "../../components/styles.js";

const FARB_GRAND_VALUES = { Karo: 9, Herz: 10, Pik: 11, Kreuz: 12, Grand: 24 };

export default function GameForm({ form, onFormChange, players, onSubmit, onCancel, submitLabel }) {
  const livePoints = calcSpielwert(form);
  const isRamschMode = isRamsch(form.game_type);
  const hasExtraPlayers = players.length > 3;

  const setForm = (patch) => onFormChange({ ...form, ...patch });

  const isFarbGrand = isFarbGrandType(form.game_type);

  // Active players: the 3 playing this hand (relevant for 4+ player sessions)
  const activePlayers = form.active_players ?? players;

  const toggleActivePlayer = (p) => {
    const isActive = activePlayers.includes(p);
    const newActive = isActive
      ? activePlayers.filter(x => x !== p)
      : [...activePlayers, p];
    if (newActive.length === 0) return;
    setForm({
      active_players: newActive,
      declarer: newActive.includes(form.declarer) ? form.declarer : newActive[0],
      ramsch_points: Object.fromEntries(newActive.map(x => [x, 0])),
    });
  };

  const activeSelectorValid = !hasExtraPlayers || activePlayers.length === 3;

  const handleGameTypeChange = (gt) => {
    const patch = { game_type: gt };
    if (isNullType(gt)) {
      patch.schneider = false;
      patch.schwarz = false;
    }
    setForm(patch);
  };

  const ramschPoints = form.ramsch_points || Object.fromEntries(activePlayers.map(p => [p, 0]));
  const ramschSum = activePlayers.reduce((s, p) => s + (Number(ramschPoints[p]) || 0), 0);
  const ramschValid = ramschSum === 120;

  const setRamschPoints = (player, value) => {
    const parsed = Math.max(0, Math.min(120, parseInt(value) || 0));
    const updated = { ...ramschPoints, [player]: parsed };
    // Auto-fill the last player if exactly one is still 0 and the others sum to ≤ 120
    const zeros = activePlayers.filter(p => updated[p] === 0);
    if (zeros.length === 1) {
      const sumOthers = activePlayers.reduce((s, p) => s + (updated[p] || 0), 0);
      if (sumOthers <= 120) updated[zeros[0]] = 120 - sumOthers;
    }
    setForm({ ramsch_points: updated });
  };

  return (
    <div style={styles.formBox}>
      <h3 style={styles.formTitle}>Spiel eintragen</h3>

      {/* Wer spielt mit? (nur bei 4+ Spielern in der Session) */}
      {hasExtraPlayers && (
        <>
          <label style={styles.label}>
            Wer spielt mit?
            <span style={{ marginLeft: 8, fontWeight: "normal", color: activeSelectorValid ? "#2d6a4f" : "#9d0208" }}>
              ({activePlayers.length}/3)
            </span>
          </label>
          <div style={styles.chipRow}>
            {players.map((p) => (
              <button
                key={p}
                style={{ ...styles.chip, ...(activePlayers.includes(p) ? styles.chipActive : {}) }}
                onClick={() => toggleActivePlayer(p)}
              >{p}</button>
            ))}
          </div>
        </>
      )}

      {!isRamschMode && (
        <div style={styles.spielwertPreview}>
          <span style={styles.spielwertLabel}>Spielwert</span>
          <span style={styles.spielwertAmount}>{livePoints} Punkte</span>
        </div>
      )}

      {/* Spielart: Farbspiele & Grand */}
      <label style={styles.label}>Spielart</label>
      <div style={styles.chipRow}>
        {FARB_GRAND_TYPES.map((gt) => (
          <button
            key={gt}
            style={{ ...styles.chip, ...(form.game_type === gt ? styles.chipActive : {}) }}
            onClick={() => handleGameTypeChange(gt)}
          >
            {gt}
            <span style={styles.chipMult}>×{FARB_GRAND_VALUES[gt]}</span>
          </button>
        ))}
      </div>

      {/* Null-Varianten */}
      <label style={styles.label}>Null</label>
      <div style={styles.chipRow}>
        {NULL_TYPES.map((gt) => {
          const shortLabel = gt === "Null" ? "Null" : gt.replace("Null ", "");
          return (
            <button
              key={gt}
              style={{ ...styles.chip, ...(form.game_type === gt ? styles.chipActive : {}) }}
              onClick={() => handleGameTypeChange(gt)}
            >
              {shortLabel}
              <span style={styles.chipMult}>{NULL_VALUES[gt]}</span>
            </button>
          );
        })}
      </div>

      {/* Normalspiel-Felder */}
      {!isRamschMode && (
        <>
          {/* Alleinspieler */}
          <label style={styles.label}>Alleinspieler</label>
          <div style={styles.chipRow}>
            {activePlayers.map((p) => (
              <button
                key={p}
                style={{ ...styles.chip, ...(form.declarer === p ? styles.chipActive : {}) }}
                onClick={() => setForm({ declarer: p })}
              >{p}</button>
            ))}
          </div>

          {/* Mit / Ohne (nur Farbspiele & Grand) */}
          {isFarbGrand && (
            <>
              <label style={styles.label}>Spitzen</label>
              <div style={styles.chipRow}>
                <button
                  style={{ ...styles.chip, ...(form.mit_ohne === "mit" ? styles.chipActive : {}) }}
                  onClick={() => setForm({ mit_ohne: "mit" })}
                >Mit</button>
                <button
                  style={{ ...styles.chip, ...(form.mit_ohne === "ohne" ? styles.chipActive : {}) }}
                  onClick={() => setForm({ mit_ohne: "ohne" })}
                >Ohne</button>
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    style={{ ...styles.chip, ...(form.spitzen === n ? styles.chipActive : {}) }}
                    onClick={() => setForm({ spitzen: n })}
                  >{n}</button>
                ))}
              </div>
            </>
          )}

          {/* Ergebnis */}
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

          {/* Schneider / Schwarz (nur Farbspiele & Grand) */}
          {isFarbGrand && (
            <>
              <label style={styles.label}>Aufschläge</label>
              <div style={styles.modRow}>
                <label style={styles.checkLabel}>
                  <input type="checkbox" checked={form.schneider}
                    onChange={(e) => setForm({ schneider: e.target.checked, schwarz: e.target.checked ? form.schwarz : false })} />
                  <span style={styles.checkText}>Schneider (+1)</span>
                </label>
                <label style={styles.checkLabel}>
                  <input type="checkbox" checked={form.schwarz}
                    onChange={(e) => setForm({ schwarz: e.target.checked, schneider: e.target.checked ? true : form.schneider })} />
                  <span style={styles.checkText}>Schwarz (+2)</span>
                </label>
              </div>
            </>
          )}

          {/* Re / Bock / Hirsch */}
          <label style={styles.label}>Aufschläge (×2/×3/×4)</label>
          <div style={styles.modRow}>
            <label style={styles.checkLabel}>
              <input type="checkbox" checked={form.re}
                onChange={(e) => setForm({ re: e.target.checked, bock: e.target.checked ? form.bock : false, hirsch: false })} />
              <span style={styles.checkText}>Re</span>
            </label>
            <label style={{ ...styles.checkLabel, opacity: form.re ? 1 : 0.4 }}>
              <input type="checkbox" checked={form.bock} disabled={!form.re}
                onChange={(e) => setForm({ bock: e.target.checked, hirsch: e.target.checked ? form.hirsch : false })} />
              <span style={styles.checkText}>Bock</span>
            </label>
            <label style={{ ...styles.checkLabel, opacity: form.re && form.bock ? 1 : 0.4 }}>
              <input type="checkbox" checked={form.hirsch} disabled={!form.re || !form.bock}
                onChange={(e) => setForm({ hirsch: e.target.checked })} />
              <span style={styles.checkText}>Hirsch</span>
            </label>
          </div>
        </>
      )}

      {/* Ramsch */}
      <label style={styles.label}>Ramsch</label>
      <div style={styles.chipRow}>
        <button
          style={{ ...styles.chip, ...(isRamschMode ? styles.chipActive : {}) }}
          onClick={() => handleGameTypeChange("Ramsch")}
        >Ramsch</button>
      </div>

      {isRamschMode && (
        <>
          <label style={styles.label}>
            Punkte pro Spieler
            <span style={{ marginLeft: 8, fontWeight: "normal", color: ramschValid ? "#2d6a4f" : "#9d0208" }}>
              ({ramschSum}/120)
            </span>
          </label>
          {activePlayers.map((p) => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ minWidth: 80 }}>{p}</span>
              <input
                type="number"
                min={0}
                max={120}
                value={ramschPoints[p] ?? 0}
                onChange={(e) => setRamschPoints(p, e.target.value)}
                style={{ width: 70, padding: "4px 8px", borderRadius: 6, border: "1px solid #ccc", fontSize: 15 }}
              />
            </div>
          ))}
        </>
      )}

      <button
        style={{ ...styles.btnConfirm, ...((!isRamschMode || ramschValid) && activeSelectorValid ? {} : { opacity: 0.5 }) }}
        onClick={onSubmit}
        disabled={(isRamschMode && !ramschValid) || !activeSelectorValid}
      >
        {submitLabel ?? (isRamschMode ? "✓ Ramsch eintragen" : `✓ Spiel eintragen — ${livePoints} Punkte`)}
      </button>
      {onCancel && (
        <button style={styles.btnSecondary} onClick={onCancel}>Abbrechen</button>
      )}
    </div>
  );
}
