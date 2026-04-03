import styles from "./styles.js";

const AVATARS = [
  // Bayerisch / Karten
  "🃏", "🎴", "🍺", "🥨", "🏔️", "🦅", "⚡", "🌲",
  // Tiere
  "🐻", "🦊", "🐺", "🐗", "🦌", "🐔", "🦆", "🐴", "🐄", "🐑",
  // Personen
  "👨‍🌾", "👩‍🌾", "🧙", "🧝", "🤴", "👸", "🧔", "🧕",
  // Symbole / Fun
  "⭐", "🌙", "☀️", "🍀", "💎", "🔥", "❄️", "🎯", "🎲", "🏆",
];

export default function AvatarPicker({ value, onChange, onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div style={styles.avatarPickerOverlay} onClick={handleBackdropClick}>
      <div style={styles.avatarPickerCard}>
        <div style={styles.avatarPickerHeader}>
          <span style={styles.avatarPickerTitle}>Avatar wählen</span>
          <button
            style={{ ...styles.playerManagerBtn, fontSize: 18, padding: "4px 10px" }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div style={styles.avatarGrid}>
          {AVATARS.map((emoji) => (
            <button
              key={emoji}
              style={{
                ...styles.avatarBtn,
                ...(value === emoji ? styles.avatarBtnActive : {}),
              }}
              onClick={() => { onChange(emoji); onClose(); }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
