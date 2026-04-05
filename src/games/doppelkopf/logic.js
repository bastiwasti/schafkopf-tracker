export const GAME_TYPES = [
  { name: "Normal", isSolo: false },
  { name: "Solo",   isSolo: true  },
];

function ansagePts(ansage) {
  return { keine30: 1, keine60: 2, keine90: 3, schwarz: 4 }[ansage] ?? 0;
}

function countSonder(s) {
  return (s?.fuchs ?? 0) + (s?.doppelkopf ?? 0) + (s?.karlchen ?? 0);
}

export function calcSpielwert({ type, kontra, ansage, bock, stake, soloValue = 3 }) {
  const base = type === "Solo" ? soloValue : stake;
  return (base + (kontra ? stake : 0) + ansagePts(ansage)) * bock;
}

export function resolveGame({ type, player, partner, won, kontra, ansage, re_sonderpunkte, kontra_sonderpunkte, bock, players, stake, soloValue = 3 }) {
  const rate = calcSpielwert({ type, kontra, ansage, bock, stake, soloValue });
  const sonderUnit = stake * bock;
  const net = countSonder(re_sonderpunkte) - countSonder(kontra_sonderpunkte);
  const changes = {};
  players.forEach((p) => (changes[p] = 0));

  const isSolo = type === "Solo";
  const sign = won ? 1 : -1;

  if (isSolo) {
    const opponents = players.filter((p) => p !== player);
    changes[player] = sign * rate * 3 + net * sonderUnit * 3;
    opponents.forEach((o) => { changes[o] = -sign * rate - net * sonderUnit; });
  } else {
    const team = [player, partner];
    const opponents = players.filter((p) => !team.includes(p));
    team.forEach((p) => { changes[p] = sign * rate + net * sonderUnit; });
    opponents.forEach((o) => { changes[o] = -sign * rate - net * sonderUnit; });
  }

  return { changes, spielwert: rate + net * sonderUnit };
}

import { calcBalances as sharedCalcBalances } from "../shared/balanceCalculator.js";

export function calcBalances(history, players) {
  return sharedCalcBalances(history, players, (g) => g.changes);
}
