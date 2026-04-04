import styles from "../../components/styles.js";

export default function WattenScoreboard({ team1_players, team2_players, team1_score, team2_score, targetScore, isGespannt }) {
  const team1Percentage = Math.min(100, (team1_score / targetScore) * 100);
  const team2Percentage = Math.min(100, (team2_score / targetScore) * 100);

  return (
    <div style={styles.scoreboard}>
      <div style={styles.scoreboardTeam}>
        <div style={styles.scoreboardTeamHeader}>
          <span style={styles.scoreboardTeamName}>Team 1</span>
          <span style={styles.scoreboardTeamScore}>{team1_score} / {targetScore}</span>
        </div>
        <div style={{ fontSize: 12, color: "#8b6914", marginBottom: 8 }}>
          {team1_players.join(" + ")}
        </div>
        <div style={{
          height: 8,
          background: "#e8dcc5",
          borderRadius: 4,
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${team1Percentage}%`,
            background: team1_score >= targetScore ? "#2d6a4f" : (isGespannt ? "#8b6914" : "#2c1810"),
            transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      <div style={styles.scoreboardDivider} />

      <div style={styles.scoreboardTeam}>
        <div style={styles.scoreboardTeamHeader}>
          <span style={styles.scoreboardTeamName}>Team 2</span>
          <span style={styles.scoreboardTeamScore}>{team2_score} / {targetScore}</span>
        </div>
        <div style={{ fontSize: 12, color: "#8b6914", marginBottom: 8 }}>
          {team2_players.join(" + ")}
        </div>
        <div style={{
          height: 8,
          background: "#e8dcc5",
          borderRadius: 4,
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${team2Percentage}%`,
            background: team2_score >= targetScore ? "#2d6a4f" : (isGespannt ? "#8b6914" : "#2c1810"),
            transition: "width 0.3s ease",
          }} />
        </div>
      </div>
    </div>
  );
}
