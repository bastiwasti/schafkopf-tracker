import styles from "../../components/styles.js";

export default function WattenSessionHistory({ games, roundsByGame, team1_players, team2_players, avatarMap = {}, team1Bommel, team2Bommel, expandedGameId, onToggleGameExpand }) {

  if (games.length === 0) {
    return null;
  }

  return (
    <div style={styles.historySection}>
      <h3 style={styles.historyTitle}>Abgeschlossene Spiele</h3>

      {/* Kompakte Spiele-Liste */}
      <div style={{
        background: "#fdf6e3",
        border: "1px solid #d4c49a",
        borderRadius: 8,
        marginBottom: 16,
      }}>
        <div style={{
          background: "#e8dcc5",
          padding: "8px 12px",
          borderRadius: "8px 8px 0 0",
          fontSize: 12,
          color: "#2c1810",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
        }}>
          <span>Bummerl: {team1Bommel} | {team2Bommel}</span>
        </div>

        {[...games].reverse().map((game) => {
          const isExpanded = expandedGameId === game.id;
          const winnerTeam = game.winner_team === 'team1' ? team1_players : team2_players;
          const loserTeam = game.winner_team === 'team1' ? team2_players : team1_players;

          return (
            <div key={game.id} style={{
              borderBottom: "1px solid #d4c49a",
              padding: "8px 12px",
            }}>
              <div
                onClick={() => onToggleGameExpand(game.id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  background: isExpanded ? "#e8dcc5" : "transparent",
                  padding: "4px 8px",
                  borderRadius: 4,
                  marginBottom: isExpanded ? 8 : 0,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: "bold", color: "#2c1810" }}>
                    Spiel #{game.game_number} · {game.final_score_team1} : {game.final_score_team2}
                  </div>
                  <div style={{ fontSize: 11, color: "#8b6914" }}>
                    Gewinner: {winnerTeam.map(p => `${avatarMap[p] || "🃏"} ${p}`).join(" + ")}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#9d0208", fontWeight: "bold" }}>
                  🔴 {loserTeam.map(p => `${avatarMap[p] || "🃏"} ${p}`).join(" + ")}
                </div>
              </div>

              {/* Expanded Game Details */}
              {isExpanded && (
                <div style={{
                  background: "#e8dcc5",
                  padding: 8,
                  borderRadius: 4,
                  marginTop: 4,
                }}>
                  {roundsByGame[game.id]?.map((round, idx) => (
                    <div key={round.id} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 8px",
                      background: "#fdf6e3",
                      borderRadius: 3,
                      fontSize: 10,
                      marginBottom: 2,
                    }}>
                      <div>
                        <span style={{ fontWeight: "bold" }}>#{idx + 1}</span>
                        <span style={{ marginLeft: 6 }}>
                          {round.winning_team === 'team1' ? team1_players.map(p => `${avatarMap[p] || "🃏"} ${p}`).join(" + ") : team2_players.map(p => `${avatarMap[p] || "🃏"} ${p}`).join(" + ")}
                        </span>
                        {round.is_machine && <span style={{ marginLeft: 4, color: "#8b6914" }}>🤖</span>}
                        {round.is_spannt_played && <span style={{ marginLeft: 4, color: "#8b6914" }}>🎯</span>}
                        {round.is_gegangen && <span style={{ marginLeft: 4, color: "#8b6914" }}>🏃</span>}
                      </div>
                      <div style={{ fontWeight: "bold", color: "#2c1810" }}>
                        +{round.points}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
