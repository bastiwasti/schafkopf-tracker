export function calculateBalances(history, players) {
  const balances = {};
  players.forEach(p => balances[p] = 0);

  history.forEach(round => {
    if (round.scores) {
      Object.entries(round.scores).forEach(([player, score]) => {
        if (balances[player] !== undefined) {
          balances[player] += score;
        }
      });
    }
  });

  return balances;
}

export function determineWinners(trickCounts) {
  const maxTricks = Math.max(...Object.values(trickCounts));
  return Object.entries(trickCounts)
    .filter(([_, count]) => count === maxTricks)
    .map(([player, _]) => player);
}

export function calculateScores(trickCounts) {
  const scores = {};
  Object.entries(trickCounts).forEach(([player, count]) => {
    scores[player] = count;
  });
  return scores;
}
