export const ROUND_SCENARIOS = [
  'final_round',
  'brave_success',
  'brave_failure',
  'all_correct',
  'all_wrong',
  'overtake',
  'comeback',
  'leader_extends',
  'single_hero',
  'single_disaster',
  'safe_players',
  'close_game',
  'mixed',
];

/**
 * Determine the most narrative-worthy scenario for a round.
 * Priority order: final_round > brave_success > brave_failure > all_correct >
 * all_wrong > overtake > comeback > leader_extends > single_hero >
 * single_disaster > safe_players > close_game > mixed
 *
 * @param {object} round            - wizard round (round_number, predictions, tricks, scores)
 * @param {Array}  players          - ordered player names
 * @param {number} totalRounds      - max rounds for this session
 * @param {object} prevTotalScores  - total scores BEFORE this round  { name: points }
 * @param {object} totalScores      - total scores AFTER  this round  { name: points }
 */
export function analyzeRoundScenario(round, players, totalRounds, prevTotalScores, totalScores) {
  const { predictions = {}, tricks = {}, scores: roundScores = {}, round_number } = round;
  const pl = Array.isArray(players) ? players : [];

  // --- basic prediction correctness ---
  const correctCount = pl.filter(p => (predictions[p] ?? 0) === (tricks[p] ?? 0)).length;

  // --- brave prediction: ≥ 70 % of available tricks, only meaningful from round 3 ---
  const maxTricks = round_number;
  const highThreshold = maxTricks * 0.7;
  let braveSuccessPlayer = null;
  let braveFailPlayer = null;
  if (maxTricks >= 3) {
    for (const p of pl) {
      const pred = predictions[p] ?? 0;
      if (pred >= highThreshold) {
        if (pred === (tricks[p] ?? 0)) {
          braveSuccessPlayer = braveSuccessPlayer ?? p;
        } else {
          braveFailPlayer = braveFailPlayer ?? p;
        }
      }
    }
  }

  // --- total-score ranking change ---
  let overtaker = null;
  let leaderGap = 0;

  if (totalScores && prevTotalScores) {
    const newRank = [...pl].sort((a, b) => (totalScores[b] ?? 0) - (totalScores[a] ?? 0));
    const prevRank = [...pl].sort((a, b) => (prevTotalScores[b] ?? 0) - (prevTotalScores[a] ?? 0));

    if (newRank.length >= 2) {
      leaderGap = (totalScores[newRank[0]] ?? 0) - (totalScores[newRank[1]] ?? 0);
    }

    // Find the first player who improved their ranking position
    for (const p of newRank) {
      const prevPos = prevRank.indexOf(p);
      const newPos = newRank.indexOf(p);
      if (prevPos > newPos && newPos === 0) {
        // Someone took over the lead
        overtaker = p;
        break;
      }
    }
  }

  const isLateGame = round_number >= totalRounds * 0.7;

  // --- round-score analysis ---
  const sortedByRound = [...pl].sort((a, b) => (roundScores[b] ?? 0) - (roundScores[a] ?? 0));
  const topRoundScore = roundScores[sortedByRound[0]] ?? 0;
  const bottomRoundScore = roundScores[sortedByRound[sortedByRound.length - 1]] ?? 0;
  const roundScoreSpread = topRoundScore - bottomRoundScore;

  // Comeback: player currently last/second-to-last had the best round score
  let isComeback = false;
  if (totalScores && pl.length >= 3) {
    const totalRank = [...pl].sort((a, b) => (totalScores[b] ?? 0) - (totalScores[a] ?? 0));
    const lowPlacers = totalRank.slice(-2);
    isComeback = lowPlacers.includes(sortedByRound[0]);
  }

  // --- priority decisions ---

  // 1. Final round
  if (round_number >= totalRounds) return 'final_round';

  // 2. Brave success
  if (braveSuccessPlayer) return 'brave_success';

  // 3. Brave failure
  if (braveFailPlayer) return 'brave_failure';

  // 4. All correct
  if (correctCount === pl.length) return 'all_correct';

  // 5. All wrong
  if (correctCount === 0) return 'all_wrong';

  // 6. Overtake (someone grabbed the lead)
  if (overtaker) return 'overtake';

  // 7. Comeback (bottom player has best round)
  if (isComeback) return 'comeback';

  // 8. Leader extends gap (late game, comfortable lead)
  if (leaderGap > 30 && isLateGame) return 'leader_extends';

  // 9. Single hero (one player far ahead of others this round)
  if (roundScoreSpread > 30 && topRoundScore > 0) {
    const heroCount = pl.filter(p => (roundScores[p] ?? 0) === topRoundScore).length;
    if (heroCount === 1) return 'single_hero';
  }

  // 10. Single disaster (one player far behind others this round)
  if (roundScoreSpread > 30 && bottomRoundScore < 0) {
    const disasterCount = pl.filter(p => (roundScores[p] ?? 0) === bottomRoundScore).length;
    if (disasterCount === 1) return 'single_disaster';
  }

  // 11. Safe players (≥2 predicted 0)
  const zeroPredCount = pl.filter(p => (predictions[p] ?? 0) === 0).length;
  if (zeroPredCount >= 2) return 'safe_players';

  // 12. Close game (total gap < 20 points)
  if (leaderGap < 20 && totalScores) return 'close_game';

  // 13. Fallback
  return 'mixed';
}
