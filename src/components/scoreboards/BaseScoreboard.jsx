import { useState } from "react";
import styles from "../../styles.js";

export default function BaseScoreboard({ players, balances, history, registeredPlayers = [], children }) {
  const avatarMap = Object.fromEntries(registeredPlayers.map((p) => [p.name, p.avatar]));

  const maxScore = Math.max(...Object.values(balances));
  const leader = maxScore > 0
    ? players.reduce((a, b) => (balances[a] >= balances[b] ? a : b))
    : null;

  return (
    <div style={styles.scoreboard}>
      {children({
        players,
        balances,
        history,
        avatarMap,
        leader,
      })}
    </div>
  );
}
