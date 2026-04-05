import SharedHistoryCard from "../shared/HistoryCard.jsx";
import styles from "../../components/styles.js";

const ANSAGE_LABELS = { keine90: "Keine 90", keine60: "Keine 60", keine30: "Keine 30", schwarz: "Schwarz" };

export default function HistoryCard({ game: g, players, onEdit, onArchive }) {
  const extraBadges = [
    g.bock > 1 && { label: `Bock ×${g.bock}`, badgeStyle: styles.bockBadge },
  ].filter(Boolean);

  const badges = [
    g.kontra && "Kontra",
    g.ansage && ANSAGE_LABELS[g.ansage],
    g.re_sonderpunkte?.fuchs > 0 && `Sp: ${g.re_sonderpunkte.fuchs}× Fuchs`,
    g.re_sonderpunkte?.doppelkopf > 0 && `Sp: ${g.re_sonderpunkte.doppelkopf}× DK`,
    g.re_sonderpunkte?.karlchen > 0 && "Sp: Karlchen",
    g.kontra_sonderpunkte?.fuchs > 0 && `Ge: ${g.kontra_sonderpunkte.fuchs}× Fuchs`,
    g.kontra_sonderpunkte?.doppelkopf > 0 && `Ge: ${g.kontra_sonderpunkte.doppelkopf}× DK`,
    g.kontra_sonderpunkte?.karlchen > 0 && "Ge: Karlchen",
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
      subPlayer={g.type === "Normal" && g.partner ? `mit ${g.partner}` : null}
      badges={badges}
      changes={changes}
      formatChange={(v) => `${v >= 0 ? "+" : ""}${(v || 0).toFixed(2)}€`}
      onEdit={onEdit ? () => onEdit(g) : null}
      onArchive={onArchive ? () => onArchive(g.id) : null}
    />
  );
}
