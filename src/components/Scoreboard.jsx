import styles from "./styles.js";
import PlayerTooltip from "./PlayerTooltip.jsx";

export default function Scoreboard({ players, balances, history, registeredPlayers = [], formatBalance, wonCounts, lowestWins }) {
  const _formatBalance = formatBalance ?? ((v) => `${v >= 0 ? "+" : ""}${v}`);
  const avatarMap = Object.fromEntries(registeredPlayers.map((p) => [p.name, p.avatar]));
  const useCustomFormat = !!formatBalance;

  const leader = players.length > 0
    ? (lowestWins
        ? players.reduce((a, b) => (balances[a] >= balances[b] ? a : b))
        : players.reduce((a, b) => (balances[a] >= balances[b] ? a : b)))
    : null;

  return (
    <div style={styles.scoreboard}>
      {players.map((p) => {
        const val = balances[p] ?? 0;
        const isLeader = p === leader;
        const avatar = avatarMap[p] ?? "❓";

        // Romme (lowestWins): Leader = grün, alle anderen = rot
        // Andere Spiele: negativ = rot, positiv = grün, null = grau
        let balanceColor;
        if (lowestWins) {
          balanceColor = isLeader ? "#2d6a4f" : "#9d0208";
        } else {
          balanceColor = val < 0 ? "#9d0208" : val > 0 ? "#2d6a4f" : "#555";
        }

        return (
          <div key={p} style={{ ...styles.playerCard, ...(isLeader ? styles.leaderCard : {}) }}>
            {isLeader && <div style={styles.crownBadge}>👑</div>}
            <PlayerTooltip player={{ name: p, avatar }} registeredPlayers={registeredPlayers} />
            <div style={styles.playerName}>{p}</div>
            <div style={{
              ...styles.playerBalance,
              color: balanceColor,
            }}>
              {useCustomFormat ? _formatBalance(val) : `${_formatBalance(val)} Punkte`}
            </div>
            <div style={styles.playerGames}>
              {wonCounts ? `${wonCounts[p] ?? 0} gewonnene Spiele` : `${history.filter((g) => (g.player ? g.player === p : g.winner === p)).length} Spiele`}
            </div>
          </div>
        );
      })}
    </div>
  );
}
