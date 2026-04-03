import styles from "../../components/styles.js";

export default function HistoryCard({ game: g, players, onEdit, onArchive }) {
  return (
    <div style={styles.historyCard}>
      <div style={styles.historyHeader}>
        <span style={styles.historyRound}>#{g.seq}</span>
        <span style={styles.historyType}>{g.type}</span>
        <span style={styles.spielwertBadge}>{(g.spielwert || 0).toFixed(2)} €</span>
        {g.bock > 1 && <span style={styles.bockBadge}>Bock ×{g.bock}</span>}
        {g.klopfer && g.klopfer.length > 0 && (
          <span style={styles.klopfBadge}>👊 ×{Math.pow(2, g.klopfer.length)}</span>
        )}
        <span style={{ ...styles.historyResult, background: g.won ? "#2d6a4f" : "#9d0208" }}>
          {g.won ? "Gewonnen" : "Verloren"}
        </span>
      </div>
      <div style={styles.historyDetail}>
        <strong>{g.player}</strong>
        {g.partner && <span> mit {g.partner}</span>}
        {g.schneider && <span style={styles.badge}>Schneider</span>}
        {g.schwarz && <span style={styles.badge}>Schwarz</span>}
        {g.laufende > 0 && <span style={styles.badge}>{g.laufende} Laufende</span>}
      </div>
      <div style={styles.historyChanges}>
        {players.map((p) => (
          <span key={p} style={{
            ...styles.changeItem,
            color: g.changes[p] > 0 ? "#2d6a4f" : g.changes[p] < 0 ? "#9d0208" : "#888",
          }}>
            {p}: {g.changes[p] >= 0 ? "+" : ""}{(g.changes[p] || 0).toFixed(2)}€
          </span>
        ))}
      </div>
      {(onEdit || onArchive) && (
        <div style={styles.historyActions}>
          {onEdit && (
            <button style={styles.btnEdit} onClick={() => onEdit(g)}>✏️ Bearbeiten</button>
          )}
          {onArchive && (
            <button style={styles.btnArchiveGame} onClick={() => onArchive(g.id)}>📦 Archivieren</button>
          )}
        </div>
      )}
    </div>
  );
}
