import SharedHistoryCard from "../shared/HistoryCard.jsx";
import styles from "../../components/styles.js";

export default function HistoryCard({ game: g, players, onEdit, onArchive }) {
  const extraBadges = [
    g.bock > 1 && { label: `Bock ×${g.bock}`, badgeStyle: styles.bockBadge },
    g.klopfer?.length > 0 && { label: `👊 ×${Math.pow(2, g.klopfer.length)}`, badgeStyle: styles.klopfBadge },
  ].filter(Boolean);

  const badges = [
    g.schneider && "Schneider",
    g.schwarz && "Schwarz",
    g.laufende > 0 && `${g.laufende} Laufende`,
  ].filter(Boolean);

  const changes = {};
  players.forEach((p) => { changes[p] = g.changes[p] ?? 0; });

  return (
    <SharedHistoryCard
      seq={g.seq}
      typeLabel={g.type}
      valueBadge={`${(g.spielwert || 0).toFixed(2)} €`}
      extraBadges={extraBadges}
      won={g.won}
      mainPlayer={g.player}
      subPlayer={g.partner ? `mit ${g.partner}` : null}
      badges={badges}
      changes={changes}
      formatChange={(v) => `${v >= 0 ? "+" : ""}${(v || 0).toFixed(2)}€`}
      onEdit={onEdit ? () => onEdit(g) : null}
      onArchive={onArchive ? () => onArchive(g.id) : null}
    />
  );
}
