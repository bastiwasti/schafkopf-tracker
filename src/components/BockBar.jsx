import styles from "./styles.js";

export default function BockBar({ bock, onBockChange }) {
  return (
    <div style={{ ...styles.bockBar, ...(bock > 1 ? styles.bockBarActive : {}) }}>
      <div style={styles.bockLeft}>
        <span style={styles.bockLabel}>{bock > 1 ? "🔥" : "💤"} BOCK</span>
        <span style={styles.bockValue}>×{bock}</span>
        {bock > 1 && <span style={styles.bockHint}>Alle Beträge ×{bock}!</span>}
      </div>
      <div style={styles.bockButtons}>
        <button style={styles.bockBtn} onClick={() => onBockChange(Math.max(1, bock - 1))}>−</button>
        <button style={{ ...styles.bockBtn, ...styles.bockBtnPlus }} onClick={() => onBockChange(bock + 1)}>+</button>
      </div>
    </div>
  );
}
