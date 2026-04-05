import styles from "../../components/styles.js";

export default function WattenScoreboard({ team1_players, team2_players, avatarMap = {}, team1_score, team2_score, targetScore, isGespannt, team1Bommel = 0, team2Bommel = 0 }) {
  const team1Percentage = Math.min(100, (team1_score / targetScore) * 100);
  const team2Percentage = Math.min(100, (team2_score / targetScore) * 100);

  return (
    <div style={{ ...styles.scoreboard, justifyContent: "center", alignItems: "stretch" }}>
      <div style={{ flex: 1, textAlign: "center", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 16, fontWeight: "bold", color: "#2c1810", marginBottom: 4 }}>
          {team1_players.map(p => `${avatarMap[p] || "🃏"} ${p}`).join(" + ")}{team1Bommel > 0 && <span style={{ color: "#9d0208", marginLeft: 4 }}>🔴{team1Bommel}</span>}{isGespannt && <span style={{ color: "#8b6914", marginLeft: 4 }}>🧱</span>}
        </div>
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <span style={styles.scoreboardTeamScore}>{team1_score} / {targetScore}</span>
        </div>
        <div style={{ marginTop: "auto", height: 8, background: "#e8dcc5", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${team1Percentage}%`,
            background: team1_score >= targetScore ? "#2d6a4f" : (isGespannt ? "#8b6914" : "#2c1810"),
            transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      <div style={{ ...styles.scoreboardDivider, alignSelf: "center" }} />

      <div style={{ flex: 1, textAlign: "center", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 16, fontWeight: "bold", color: "#2c1810", marginBottom: 4 }}>
          {team2_players.map(p => `${avatarMap[p] || "🃏"} ${p}`).join(" + ")}{team2Bommel > 0 && <span style={{ color: "#9d0208", marginLeft: 4 }}>🔴{team2Bommel}</span>}{isGespannt && <span style={{ color: "#8b6914", marginLeft: 4 }}>🧱</span>}
        </div>
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <span style={styles.scoreboardTeamScore}>{team2_score} / {targetScore}</span>
        </div>
        <div style={{ marginTop: "auto", height: 8, background: "#e8dcc5", borderRadius: 4, overflow: "hidden" }}>
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
