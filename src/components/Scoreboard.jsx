import styles from "./styles.js";

export default function Scoreboard({ players, balances, history, registeredPlayers = [] }) {
  const avatarMap = Object.fromEntries(registeredPlayers.map((p) => [p.name, p.avatar]));

  const leader = players.length > 0
    ? players.reduce((a, b) => (balances[a] >= balances[b] ? a : b))
    : null;

  return (
    <div style={styles.scoreboard}>
      {players.map((p) => {
        const val = balances[p] ?? 0;
        const isLeader = p === leader && val > 0;
        const avatar = avatarMap[p] ?? "❓";
        return (
          <div key={p} style={{ ...styles.playerCard, ...(isLeader ? styles.leaderCard : {}) }}>
            {isLeader && <div style={styles.crownBadge}>👑</div>}
            <div style={styles.playerCardAvatar}>{avatar}</div>
            <div style={styles.playerName}>{p}</div>
            <div style={{
              ...styles.playerBalance,
              color: val > 0 ? "#2d6a4f" : val < 0 ? "#9d0208" : "#555",
            }}>
              {val >= 0 ? "+" : ""}{val.toFixed(2)} €
            </div>
            <div style={styles.playerGames}>
              {history.filter((g) => g.player === p).length} Spiele
            </div>
          </div>
        );
      })}
    </div>
  );
}
