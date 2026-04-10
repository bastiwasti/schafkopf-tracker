import styles from "../components/styles.js";

export default function GameCard({ game, _players, onEdit, onArchive }) {
  const { game_type, contra, won, schneider, schwarz, laufende, kontra_multiplier, points, seq } = game;

  const getGameTypeLabel = () => {
    if (game_type === "null") return "Null-Spiel";
    if (game_type === "farbe") return "Farbspiel";
    if (game_type === "grand") return "Grand";
    if (game_type === "kontra") return "Kontra-Spiel";
    return game_type;
  };

  const getDetails = () => {
    const details = [];

    if (won) details.push("Gewonnen");
    if (schneider) details.push("Schneider");
    if (schwarz) details.push("Schwarz");
    if (laufende > 0) details.push(`${laufende} Laufende`);
    if (game_type === "kontra" && contra) details.push(`Kontra: ${contra}`);
    if (game_type === "kontra" && won) details.push("Doppelte Punkte");

    if (kontra_multiplier > 1) {
      const multiplierText = kontra_multiplier === 2 ? "×2 (gewinnt doch)" : kontra_multiplier === 3 ? "×3 (RE)" : "";
      details.push(multiplierText);
    }

    if (points > 0) {
      details.push(`+${points} Punkte`);
    } else {
      details.push(`-${Math.abs(points)} Punkte`);
    }

    return details.join(" · ");
  };

  const getGameTypeColor = () => {
    if (won) return "#2d6a4f";  // Grün für Gewinner
    if (game_type === "kontra") return "#b45309";  // Braun für Kontra
    return "#555";  // Grau für Verlierer
  };

  const getKontraLabel = () => {
    if (contra) return `Kontra: ${contra}`;
    return null;
  };

  return (
    <div style={{
      ...styles.historyCard,
      ...(won ? { background: "#d4edda" } : {}),
      ...(won ? { borderColor: "#4caf50" } : { borderColor: "#d9d9d9" }),
      ...(won ? { borderWidth: "2px solid" } : {}),
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "12px",
      }}>
        <div>
          <div style={{ fontSize: 11, color: "#8b6914", marginBottom: 4 }}>
            #{seq}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: "bold", marginBottom: 4, color: getGameTypeColor() }}>
              {getGameTypeLabel()} {getKontraLabel()}
            </div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>
              {getDetails()}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8", alignItems: "center" }}>
            <button
              style={{
                ...styles.btnSecondary,
                padding: "4px 8px",
                fontSize: 10,
              }}
              onClick={() => onEdit(game)}
            >
              ✎
            </button>
            {onArchive && (
              <button
                style={{
                  ...styles.btnSecondary,
                  padding: "4px 8px",
                  fontSize: 10,
                  color: "#9d0208",
                  borderColor: "#9d0208",
                  cursor: "pointer",
                }}
                onClick={() => onArchive(game.id)}
              >
                📦
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
