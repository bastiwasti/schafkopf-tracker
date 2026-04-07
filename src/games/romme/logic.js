function calculateBalances(rounds, players) {
  const balances = {};
  players.forEach(p => balances[p] = 0);

  rounds.forEach(round => {
    const scores = round.scores || {};
    Object.entries(scores).forEach(([player, score]) => {
      if (balances[player] !== undefined) {
        balances[player] += -score;
      }
    });
  });

  return balances;
}

export { calculateBalances };
