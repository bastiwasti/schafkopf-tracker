import SharedHistoryCard from "../shared/HistoryCard.jsx";
import { calculatePlayerPoints } from "./logic.js";

export default function GameCard({ game, players, onEdit, onArchive }) {
  const { game_type, declarer, won, schneider, schwarz, laufende, points, kontra_multiplier } = game;

  const typeLabel = game_type === "kontra" ? `Kontra (×${kontra_multiplier})` : game_type;

  const badges = [
    schneider && "Schneider",
    schwarz && "Schwarz",
    laufende > 0 && `${laufende} Laufende`,
  ].filter(Boolean);

  const pointsPerPlayer = calculatePlayerPoints(game, players);

  return (
    <SharedHistoryCard
      seq={game.seq}
      typeLabel={typeLabel}
      valueBadge={`${won ? "+" : "-"}${points} Punkte`}
      won={won}
      mainPlayer={declarer}
      badges={badges}
      changes={pointsPerPlayer}
      formatChange={(v) => `${v > 0 ? "+" : ""}${v}`}
      onEdit={onEdit ? () => onEdit(game) : null}
      onArchive={onArchive ? () => onArchive(game.id) : null}
    />
  );
}
