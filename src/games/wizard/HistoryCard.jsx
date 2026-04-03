import styles from "../../components/styles.js";

export default function HistoryCard({ round, players, onEdit, onArchive, avatarMap = {} }) {
  return (
    <div style={styles.historyCard}>
      <div style={styles.historyCardHeader}>
        <div style={styles.historyRound}># {round.round_number}</div>
        <div style={{
          ...styles.historyResult,
          background: round.scores[players[0]] > 0 ? "#2d6a4f" : "#9d0208",
        }}>
          {round.scores[players[0]] > 0 ? "+" : ""}{round.scores[players[0]]}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        {players.map((p, idx) => {
          const pred = round.predictions[p] ?? 0;
          const act = round.tricks[p] ?? 0;
          const score = round.scores[p] ?? 0;
          const isCorrect = pred === act;
          const avatar = avatarMap[p] || "🃏";

          return (
            <div key={p} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 0",
              borderBottom: idx < players.length - 1 ? "1px solid #e8dcc4" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{avatar}</span>
                <span style={{ fontWeight: 500 }}>{p}</span>
              </div>

              <div style={{ display: "flex", gap: 24, fontSize: 14 }}>
                <span>Vor: {pred}</span>
                <span>Tat: {act}</span>
                <span style={{
                  fontWeight: "bold",
                  color: isCorrect ? "#2d6a4f" : "#9d0208",
                }}>
                  {score >= 0 ? "+" : ""}{score}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          style={{
            ...styles.btnSecondary,
            padding: "8px 12px",
            fontSize: 13,
          }}
          onClick={() => onEdit(round)}
        >
          ✏️ Bearbeiten
        </button>
        <button
          style={{
            ...styles.btnSecondary,
            padding: "8px 12px",
            fontSize: 13,
            color: "#9d0208",
          }}
          onClick={() => onArchive(round.id)}
        >
          📦 Archivieren
        </button>
      </div>
    </div>
  );
}
