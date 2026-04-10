import SharedHistoryCard from "../shared/HistoryCard.jsx";
import { calculatePlayerPoints, isFarbGrandType, isRamsch } from "./logic.js";

export default function GameCard({ game, players, onEdit, onArchive }) {
  const { game_type, declarer, won, schneider, schwarz, mit_ohne, spitzen, re, bock, hirsch, points } = game;

  const pointsPerPlayer = calculatePlayerPoints(game, players);

  if (isRamsch(game_type)) {
    return (
      <SharedHistoryCard
        seq={game.seq}
        typeLabel="Ramsch"
        valueBadge="120 Punkte"
        won={null}
        mainPlayer={null}
        badges={[]}
        changes={pointsPerPlayer}
        formatChange={(v) => `${v > 0 ? "+" : ""}${v}`}
        onEdit={onEdit ? () => onEdit(game) : null}
        onArchive={onArchive ? () => onArchive(game.id) : null}
      />
    );
  }

  const badges = [
    isFarbGrandType(game_type) && mit_ohne && spitzen && `${mit_ohne} ${spitzen}`,
    isFarbGrandType(game_type) && schneider && "Schneider",
    isFarbGrandType(game_type) && schwarz && "Schwarz",
    re && "Re",
    bock && "Bock",
    hirsch && "Hirsch",
  ].filter(Boolean);

  return (
    <SharedHistoryCard
      seq={game.seq}
      typeLabel={game_type}
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
