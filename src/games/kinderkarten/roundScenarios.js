export const KINDERKARTEN_SCENARIOS = [
  'first_round',
  'perfect_round',
  'dominant_lead',
  'close_game',
  'worst_player',
  'negative_run',
  'comeback',
  'leader_change',
  'tie_game',
  'mixed',
];

/**
 * Determine most narrative-worthy scenario for a kinderkarten round.
 * Priority order: first_round > perfect_round > tie_game > worst_player > negative_run >
 * comeback > leader_change > dominant_lead > close_game > mixed
 *
 * @param {object} round            - kinderkarten round (seq, winners, trick_counts, scores)
 * @param {Array}  players          - ordered player names
 * @param {Array}  history          - all previous rounds
 * @param {object} balances         - total scores AFTER this round  { name: score }
 * @param {object} prevBalances     - total scores BEFORE this round  { name: score }
 */
export function analyzeKinderkartenScenario(round, players, history, balances, prevBalances) {
  const { winners = [], trick_counts = {}, scores = {} } = round;
  const pl = Array.isArray(players) ? players : [];
  const hist = Array.isArray(history) ? history : [];
  const trickValues = Object.values(trick_counts);
  const maxTricks = trickValues.length > 0 ? Math.max(...trickValues) : 0;
  const minTricks = trickValues.length > 0 ? Math.min(...trickValues) : 0;
  const cardCount = round.card_count || 5;

  // --- First round: HIGHEST PRIORITY - only for very first round ---
  if (hist.length === 0) return 'first_round';

  // --- Perfect round: Winner has ALL tricks (everyone else has 0) ---
  if (maxTricks === cardCount && minTricks === 0 && winners.length === 1) {
    return 'perfect_round';
  }

  // --- Tie game: Multiple winners (same max tricks) ---
  if (winners.length >= 2) {
    return 'tie_game';
  }

  // --- Worst player: Someone has 0 tricks ---
  const zeroTrickPlayers = pl.filter(p => (trick_counts[p] || 0) === 0);
  if (zeroTrickPlayers.length === 1) {
    return 'worst_player';
  }

  // --- Negative run: 3+ rounds with 0 tricks ---
  let worstStreak = { player: null, streak_count: 0, total_zero: 0 };

  pl.forEach(player => {
    let streak = 0;
    let totalZero = 0;

    hist.slice(-6).forEach(r => {
      if (r && r.trick_counts && (r.trick_counts[player] || 0) === 0) {
        streak++;
        totalZero++;
      } else {
        streak = 0;
      }
    });

    if (streak > worstStreak.streak_count && streak >= 3) {
      worstStreak = { player, streak_count: streak, total_zero: totalZero };
    }
  });

  if (worstStreak.player) {
    return 'negative_run';
  }

  // --- Leader change ---
  if (prevBalances && balances) {
    const sortedByBalance = [...pl].sort((a, b) => (balances[b] || 0) - (balances[a] || 0));
    const prevSorted = [...pl].sort((a, b) => (prevBalances[b] || 0) - (prevBalances[a] || 0));

    const leader = sortedByBalance[0];
    const prevLeader = prevSorted[0];

    if (leader && prevLeader && leader !== prevLeader) {
      return 'leader_change';
    }

    // --- Comeback: Last place → first place ---
    const prevLast = prevSorted[prevSorted.length - 1];
    if (leader && prevLast && leader === prevLast && leader !== prevLeader) {
      return 'comeback';
    }
  }

  // --- Dominant lead: Clear gap between 1st and 2nd ---
  if (balances && pl.length >= 2) {
    const sortedByBalance = [...pl].sort((a, b) => (balances[b] || 0) - (balances[a] || 0));
    const leader = sortedByBalance[0];
    const second = sortedByBalance[1];
    const leaderGap = (balances[leader] || 0) - (balances[second] || 0);

    if (leaderGap >= 8) return 'dominant_lead';

    // --- Close game: Tight race ---
    if (leaderGap > 0 && leaderGap <= 3) return 'close_game';
  }

  // --- Fallback ---
  return 'mixed';
}

export function buildTemplateVars(round, players, history, balances) {
  const { winners = [], trick_counts = {}, scores = {} } = round;
  const pl = Array.isArray(players) ? players : [];
  const hist = Array.isArray(history) ? history : [];

  const trickValues = Object.values(trick_counts);
  const maxTricks = trickValues.length > 0 ? Math.max(...trickValues) : 0;
  const minTricks = trickValues.length > 0 ? Math.min(...trickValues) : 0;
  const cardCount = round.card_count || 5;

  const winner = winners.length > 0 ? winners[0] : null;

  const sortedByBalance = balances ? [...pl].sort((a, b) => (balances[b] || 0) - (balances[a] || 0)) : [];
  const leader = sortedByBalance.length > 0 ? sortedByBalance[0] : null;
  const second = sortedByBalance.length > 1 ? sortedByBalance[1] : null;
  const last = sortedByBalance.length > 1 ? sortedByBalance[sortedByBalance.length - 1] : null;

  const leaderGap = leader && second ? (balances[leader] || 0) - (balances[second] || 0) : 0;

  const zeroTrickPlayers = pl.filter(p => (trick_counts[p] || 0) === 0);
  const worstPlayer = zeroTrickPlayers.length === 1 ? zeroTrickPlayers[0] : null;

  // Find negative streak
  let worstStreak = { player: null, streak_count: 0, total_zero: 0 };

  pl.forEach(player => {
    let streak = 0;
    let totalZero = 0;

    hist.slice(-6).forEach(r => {
      if (r && r.trick_counts && (r.trick_counts[player] || 0) === 0) {
        streak++;
        totalZero++;
      } else {
        streak = 0;
      }
    });

    if (streak > worstStreak.streak_count && streak >= 3) {
      worstStreak = { player, streak_count: streak, total_zero: totalZero };
    }
  });

  return {
    winner,
    winners: winners.join(' & '),
    round_number: round.seq,
    card_count: cardCount,
    max_tricks: maxTricks,
    min_tricks: minTricks,
    leader,
    second,
    last,
    leader_gap: leaderGap,
    worst_player: worstPlayer,
    streak_player: worstStreak.player,
    streak_count: worstStreak.streak_count,
    streak_total_zero: worstStreak.total_zero,
    total_rounds: hist.length + 1,
    trick_counts: Object.entries(trick_counts)
      .map(([player, count]) => `${player}: ${count}`)
      .join(', '),
  };
}
