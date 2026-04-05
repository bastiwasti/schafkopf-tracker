import styles from "../../components/styles.js";

/**
 * Wiederverwendbare Spielkarte für die History-Liste.
 *
 * @param {number} seq - Laufende Nummer des Spiels (#1, #2, ...)
 * @param {string} typeLabel - Spieltyp-Text (z.B. "Sauspiel", "Grand")
 * @param {string} valueBadge - Wert-Badge-Text (z.B. "0.50 €", "+42 Punkte")
 * @param {Array}  extraBadges - Zusätzliche Badges: [{ label, badgeStyle }]
 * @param {boolean} won - Gewonnen/Verloren für Farbkodierung
 * @param {string} mainPlayer - Hauptspieler-Name
 * @param {string|null} subPlayer - Zusatztext nach dem Spieler (z.B. "mit Seppl"), optional
 * @param {string[]} badges - Modifier-Badges (z.B. ["Schneider", "3 Laufende"])
 * @param {object} changes - Per-Spieler Punktveränderungen: { spielerName: wert }
 * @param {function} formatChange - Formatter: (value) => string (z.B. "+0.50€")
 * @param {function|null} onEdit - Edit-Handler, null = kein Edit-Button
 * @param {function|null} onArchive - Archiv-Handler, null = kein Archiv-Button
 */
export default function HistoryCard({
  seq,
  typeLabel,
  valueBadge,
  extraBadges = [],
  won,
  mainPlayer,
  subPlayer = null,
  badges = [],
  changes = {},
  formatChange = (v) => `${v >= 0 ? "+" : ""}${v}`,
  onEdit,
  onArchive,
}) {
  return (
    <div style={styles.historyCard}>
      <div style={styles.historyHeader}>
        <span style={styles.historyRound}>#{seq}</span>
        <span style={styles.historyType}>{typeLabel}</span>
        {valueBadge && <span style={styles.spielwertBadge}>{valueBadge}</span>}
        {extraBadges.map(({ label, badgeStyle }, i) => (
          <span key={i} style={badgeStyle}>{label}</span>
        ))}
        <span style={{ ...styles.historyResult, background: won ? "#2d6a4f" : "#9d0208" }}>
          {won ? "Gewonnen" : "Verloren"}
        </span>
      </div>

      <div style={styles.historyDetail}>
        <strong>{mainPlayer}</strong>
        {subPlayer && <span> {subPlayer}</span>}
        {badges.map((label, i) => (
          <span key={i} style={styles.badge}>{label}</span>
        ))}
      </div>

      {Object.keys(changes).length > 0 && (
        <div style={styles.historyChanges}>
          {Object.entries(changes).map(([player, value]) => (
            <span key={player} style={{
              ...styles.changeItem,
              color: value > 0 ? "#2d6a4f" : value < 0 ? "#9d0208" : "#888",
            }}>
              {player}: {formatChange(value)}
            </span>
          ))}
        </div>
      )}

      {(onEdit || onArchive) && (
        <div style={styles.historyActions}>
          {onEdit && (
            <button style={styles.btnEdit} onClick={() => onEdit()}>✏️ Bearbeiten</button>
          )}
          {onArchive && (
            <button style={styles.btnArchiveGame} onClick={() => onArchive()}>📦 Archivieren</button>
          )}
        </div>
      )}
    </div>
  );
}
