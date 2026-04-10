export const GAME_SCENARIOS = [
  "routine_win",
  "routine_loss",
  "close_win",
  "close_loss",
  "dramatic_win",
  "dramatic_loss",
  "bock_good_luck",
  "bock_bad_luck",
  "high_solo_win",
  "against_solo_win",
  "klopfer_luck",
  "klopfer_bad_luck",
  "streak_end_win",
  "leader_gain",
  "leader_loss",
];

export function analyzeGameScenario(game, players, balances) {
  const isSolo = game.type !== "Sauspiel";
  const isTout = game.type.includes("Tout");
  const isWenz = game.type === "Wenz";
  const isSchwarz = game.schwarz;
  const hasKlopfer = game.klopfer?.length > 0;
  const bock = game.bock ?? 1;
  const spielwert = game.spielwert ?? 0;
  
  const winMargin = game.changes[game.player] ?? 0;
  const isWinner = winMargin > 0;
  const absWinMargin = Math.abs(winMargin);
  
  const playerBalance = balances[game.player] ?? 0;
  const otherBalances = players.filter(p => p !== game.player).map(p => balances[p] ?? 0);
  const maxOtherBalance = Math.max(...otherBalances);
  const isLeader = playerBalance >= maxOtherBalance && playerBalance > 0;
  const isCloseToLeader = maxOtherBalance > 0 && Math.abs(playerBalance - maxOtherBalance) < 0.50;
  
  const isClose = absWinMargin < 0.30;
  
  if (isTout && isSchwarz && !isWinner) return "dramatic_loss";
  if (isTout && isSchwarz && isWinner) return "dramatic_win";
  if ((isTout || (isWenz && isSchwarz)) && !isWinner) return "dramatic_loss";
  if ((isTout || (isWenz && isSchwarz)) && isWinner) return "dramatic_win";
  
  if (isSolo && spielwert >= 0.60 && isWinner) return "high_solo_win";
  
  if (isSolo && !isWinner) return "against_solo_win";
  
  if (hasKlopfer && isWinner) return "klopfer_luck";
  if (hasKlopfer && !isWinner) return "klopfer_bad_luck";
  
  if (bock > 1 && isWinner) return "bock_good_luck";
  if (bock > 1 && !isWinner) return "bock_bad_luck";
  
  if (isLeader && isWinner) return "leader_gain";
  if (isLeader && !isWinner) return "leader_loss";
  
  if (isCloseToLeader && isWinner) return "leader_gain";
  if (isCloseToLeader && !isWinner) return "leader_loss";
  
  if (isWinner && isClose) return "close_win";
  if (!isWinner && isClose) return "close_loss";
  
  if (isWinner) return "streak_end_win";
  
  return "routine_loss";
}
