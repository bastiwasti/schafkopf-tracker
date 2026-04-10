import SharedHistoryCard from "../shared/HistoryCard.jsx";

export default function KinderkartenHistoryCard({ game, players, onEdit, onArchive }) {
  const { winners, scores, seq } = game;

  const changes = {};
  players.forEach(player => {
    const score = scores[player] ?? 0;
    changes[player] = score;
  });

  const winnerText = Array.isArray(winners) && winners.length > 0
    ? winners.join(" + ")
    : "-";

  return (
    <SharedHistoryCard
      seq={seq}
      typeLabel="Runde"
      valueBadge=""
      won={null}
      mainPlayer={`Gewinner: ${winnerText}`}
      badges={[]}
      changes={changes}
      formatChange={(v) => v > 0 ? `+${v}` : "0"}
      onEdit={onEdit ? () => onEdit(game) : null}
      onArchive={onArchive ? () => onArchive(game.id) : null}
    />
  );
}
