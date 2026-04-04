export const ROUND_SCENARIOS = [
  "all_correct",
  "all_wrong",
  "single_winner",
  "single_loser",
  "close_game_decision",
  "game_decided",
  "dramatic_zero",
  "dramatic_max",
  "comeback_likely",
  "comeback_unlikely",
  "all_zero",
  "all_max",
  "tie_situation",
  "score_overtake",
  "score_collapse",
];

export function analyzeRoundScenario(round, players, totalRounds, prevScores) {
  const { predictions, tricks, scores, round_number } = round;
  const playersArray = Array.isArray(players) ? players : [];
  
  const correctCount = playersArray.filter(p => predictions[p] === tricks[p]).length;
  const isLastRound = round_number >= totalRounds;
  const sortedScores = [...playersArray].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));
  const topScore = scores[sortedScores[0]] ?? 0;
  const bottomScore = scores[sortedScores[sortedScores.length - 1]] ?? 0;
  const scoreSpread = topScore - bottomScore;
 
  const correctPlayerCount = playersArray.filter(p => {
    const pred = predictions[p] ?? 0;
    const trick = tricks[p] ?? 0;
    return pred === trick;
  }).length;
 
  const zeroPredictions = playersArray.filter(p => (predictions[p] ?? 0) === 0).length;
  const allZeroPredictions = zeroPredictions === playersArray.length;
 
  const maxTricks = round_number;
  const maxPredictions = playersArray.filter(p => (predictions[p] ?? 0) === maxTricks).length;
  const allMaxPredictions = maxPredictions === playersArray.length;
 
  const zeroTricks = playersArray.filter(p => (tricks[p] ?? 0) === 0).length;
  const allZeroTricks = zeroTricks === playersArray.length;
 
  const maxTricksActual = playersArray.filter(p => (tricks[p] ?? 0) === maxTricks).length;
  const allMaxTricks = maxTricksActual === playersArray.length;
 
  let previousLeader = null;
  let newLeader = sortedScores[0];
  if (prevScores) {
    const sortedPrev = [...playersArray].sort((a, b) => (prevScores[b] ?? 0) - (prevScores[a] ?? 0));
    previousLeader = sortedPrev[0];
  }
  
  const leaderChanged = previousLeader && previousLeader !== newLeader;
  
  if (correctCount === playersArray.length) return "all_correct";
  if (correctCount === 0) return "all_wrong";
  if (correctPlayerCount === 1) return "single_winner";
  if (correctPlayerCount === playersArray.length - 1) return "single_loser";

  if (isLastRound && scoreSpread < 50) return "close_game_decision";
  if (isLastRound && scoreSpread > 100) return "game_decided";

  const zeroSuccess = playersArray.filter(p => {
    const pred = predictions[p] ?? 0;
    const trick = tricks[p] ?? 0;
    return pred === 0 && trick === 0;
  }).length;

  if (zeroSuccess >= playersArray.length - 1 && isLastRound) return "dramatic_zero";

  const maxSuccess = playersArray.filter(p => {
    const pred = predictions[p] ?? 0;
    const trick = tricks[p] ?? 0;
    return pred === maxTricks && trick === maxTricks;
  }).length;

  if (maxSuccess >= playersArray.length - 1 && isLastRound) return "dramatic_max";

  if (!isLastRound && scoreSpread < 50) return "comeback_likely";
  if (!isLastRound && scoreSpread > 80 && round_number < totalRounds - 3) return "comeback_unlikely";

 
  if (allZeroPredictions) return "all_zero";
  if (allMaxPredictions) return "all_max";

  if (isLastRound && topScore === bottomScore) return "tie_situation";

  if (leaderChanged) {
    const previousWasLeader = sortedScores.indexOf(previousLeader);
    const newWasLeader = sortedScores.indexOf(newLeader);
    if (previousWasLeader > newWasLeader) return "score_overtake";
  }

  const bottomPlayer = sortedScores[sortedScores.length - 1];
  if (prevScores) {
    const prevBottom = [...playersArray].sort((a, b) => (prevScores[b] ?? 0) - (prevScores[a] ?? 0))[sortedScores.length - 1];
    if (prevBottom !== bottomPlayer && prevScores[bottomPlayer] < scores[bottomPlayer]) {
      return "score_collapse";
    }
  }

  return "mixed";
}
