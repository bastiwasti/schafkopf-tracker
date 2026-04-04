import styles from "../../components/styles.js";

export default function WattenSessionHistory({ games }) {
  const activeGames = games.filter(g => !g.archived_at);
  
  if (activeGames.length === 0) {
    return (
      <div style={styles.historySection}>
        <h3 style={styles.historyTitle}>Spiele (Bummel)</h3>
        <p style={styles.emptyMsg}>Noch keine Spiele beendet.</p>
      </div>
    );
  }

  const team1Bummel = activeGames.filter(g => g.winner_team === 'team1').length;
  const team2Bummel = activeGames.filter(g => g.winner_team === 'team2').length;

  return (
    <div style={styles.historySection}>
      <h3 style={styles.historyTitle}>Spiele (Bummel)</h3>

      <div style={{
        background: "#e8dcc5",
        padding: "12px 16px",
        borderRadius: 8,
        marginBottom: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontSize: 14, color: "#2c1810", fontWeight: "bold" }}>Bummerl:</span>
        <span style={{ fontSize: 14, color: "#2c1810" }}>
          Team 1: {team1Bummel} | Team 2: {team2Bummel}
        </span>
      </div>

      {[...activeGames].reverse().map((game) => (
        <div key={game.id} style={styles.gameCard}>
          <div style={styles.gameCardLeft}>
            <span style={styles.gameType}>Spiel #{game.game_number}</span>
            <span style={styles.gamePlayer}>
              Gewinner: {game.winner_team === 'team1' ? 'Team 1' : 'Team 2'}
            </span>
          </div>
          <div style={styles.gameCardRight}>
            <span style={styles.gameValue}>
              {game.final_score_team1} : {game.final_score_team2}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
