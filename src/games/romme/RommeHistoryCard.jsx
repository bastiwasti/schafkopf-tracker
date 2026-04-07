import SharedHistoryCard from "../shared/HistoryCard.jsx";

export default function RommeHistoryCard({ game, players, onEdit, onArchive }) {
  const { winner, scores, seq } = game;

  const changes = {};
  players.forEach(player => {
    if (player === winner) {
      changes[player] = 0;
    } else {
      const score = scores[player] ?? 0;
      changes[player] = -score;
    }
  });

  return (
    <SharedHistoryCard
      seq={seq}
      typeLabel="Runde"
      valueBadge=""
      won={null}
      mainPlayer={`Gewinner: ${winner}`}
      badges={[]}
      changes={changes}
      formatChange={(v) => v < 0 ? v.toString() : v > 0 ? `+${v}` : "0"}
      onEdit={onEdit ? () => onEdit(game) : null}
      onArchive={onArchive ? () => onArchive(game.id) : null}
    />
  );
}
