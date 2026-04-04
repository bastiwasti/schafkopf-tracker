import styles from "../../components/styles.js";
import { calculatePlayerPoints } from "./logic.js";

export default function GameCard({ game, players, onEdit, onArchive }) {
  const { game_type, declarer, partner, contra, won, schneider, schwarz, laufende, points, kontra_multiplier } = game;

  const pointsPerPlayer = calculatePlayerPoints(game, players);

  const getGameTypeLabel = () => {
    if (game_type === "kontra") return `Kontra (×${kontra_multiplier})`;
    return game_type;
  };

  const getBoni = () => {
    const boni = [];
    if (schneider) boni.push("Schneider");
    if (schwarz) boni.push("Schwarz");
    if (laufende > 0) boni.push(`${laufende} Laufende`);
    return boni;
  };

  const boni = getBoni();

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.cardTitle}>#{game.seq} — {getGameTypeLabel()}</span>
        <span style={{ ...styles.cardPoints, color: won ? "#2d6a4f" : "#9d0208" }}>
          {won ? "+" : "-"}{points} Punkte
        </span>
      </div>

      <div style={styles.cardBody}>
        <div style={styles.cardRow}>
          <span style={styles.cardLabel}>Alleinspieler:</span>
          <span style={styles.cardValue}>{declarer}</span>
        </div>
        {partner && (
          <div style={styles.cardRow}>
            <span style={styles.cardLabel}>Partner:</span>
            <span style={styles.cardValue}>{partner}</span>
          </div>
        )}
        {contra && game_type === "kontra" && (
          <div style={styles.cardRow}>
            <span style={styles.cardLabel}>Kontra:</span>
            <span style={styles.cardValue}>{contra}</span>
          </div>
        )}
        {boni.length > 0 && (
          <div style={styles.cardRow}>
            <span style={styles.cardLabel}>Boni:</span>
            <span style={styles.cardValue}>{boni.join(", ")}</span>
          </div>
        )}
        <div style={styles.cardRow}>
          <span style={styles.cardLabel}>Ergebnis:</span>
          <span style={{ ...styles.cardValue, fontWeight: won ? "bold" : "normal", color: won ? "#2d6a4f" : "#9d0208" }}>
            {won ? "Gewonnen" : "Verloren"}
          </span>
        </div>
      </div>

      <div style={styles.cardFooter}>
        {Object.entries(pointsPerPlayer).map(([player, p]) => (
          <div key={player} style={styles.playerPoints}>
            <span style={styles.playerName}>{player}:</span>
            <span style={{ ...styles.playerAmount, color: p > 0 ? "#2d6a4f" : p < 0 ? "#9d0208" : "#555" }}>
              {p > 0 ? "+" : ""}{p}
            </span>
          </div>
        ))}
      </div>

      <div style={styles.cardActions}>
        {onEdit && (
          <button style={styles.btnSmall} onClick={() => onEdit(game)}>✏️ Bearbeiten</button>
        )}
        {onArchive && (
          <button style={styles.btnSmall} onClick={() => onArchive(game.id)}>📦 Archivieren</button>
        )}
      </div>
    </div>
  );
}
