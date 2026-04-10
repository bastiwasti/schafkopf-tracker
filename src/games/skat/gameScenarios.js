import { isNullType } from "./logic.js";

export function analyzeGameScenario(game, players, balances) {
  const isRamsch = game.game_type === "Ramsch";
  const isNull = isNullType(game.game_type);
  const isGrand = game.game_type === "Grand";
  const isNullOuvert = game.game_type === "Null Ouvert" || game.game_type === "Null Ouvert Hand";
  const hasReBoHi = game.re || game.bock || game.hirsch;
  const isWinner = !!game.won;
  const declarer = game.declarer;

  if (isRamsch) return "routine_loss";

  if (hasReBoHi && isWinner) return "bock_good_luck";
  if (hasReBoHi && !isWinner) return "bock_bad_luck";

  if (isNullOuvert && isWinner) return "high_solo_win";
  if (isNull && isWinner) return "dramatic_win";
  if (isNull && !isWinner) return "dramatic_loss";
  if (isGrand && isWinner) return "dramatic_win";
  if (isGrand && !isWinner) return "dramatic_loss";

  // Leader detection (point-based)
  const declarerBalance = balances[declarer] ?? 0;
  const otherBalances = players.filter(p => p !== declarer).map(p => balances[p] ?? 0);
  const maxOtherBalance = otherBalances.length > 0 ? Math.max(...otherBalances) : 0;
  const isLeader = declarerBalance >= maxOtherBalance && declarerBalance > 0;
  const isCloseToLeader = maxOtherBalance > 0 && Math.abs(declarerBalance - maxOtherBalance) < 20;

  if ((isLeader || isCloseToLeader) && isWinner) return "leader_gain";
  if ((isLeader || isCloseToLeader) && !isWinner) return "leader_loss";

  if (isWinner) return "routine_win";
  return "routine_loss";
}
