export const GAME_TYPES = [
  { name: "Sauspiel",      multiplier: 1 },
  { name: "Solo",          multiplier: 4 },
  { name: "Wenz",          multiplier: 4 },
  { name: "Solo Tout",     multiplier: 8 },
  { name: "Wenz Tout",     multiplier: 8 },
  { name: "Geier",         multiplier: 4 },
  { name: "Geier Tout",    multiplier: 8 },
  { name: "Farbwenz",      multiplier: 4 },
  { name: "Farbwenz Tout", multiplier: 8 },
];

export function getEnabledGameTypes(options = {}) {
  return GAME_TYPES.filter((gt) => {
    if (gt.name.startsWith("Geier"))    return !!options.geier;
    if (gt.name.startsWith("Farbwenz")) return !!options.farbwenz;
    return true;
  });
}

export function calcSpielwert({ type, schneider, schwarz, laufende, bock, klopfer, stake }) {
  const gt = GAME_TYPES.find((g) => g.name === type);
  let mult = gt.multiplier;
  if (schneider) mult += 1;
  if (schwarz) mult += 2;
  mult += laufende;
  const klopfMult = Math.pow(2, klopfer.length);
  return stake * mult * bock * klopfMult;
}

export function resolveGame({ type, player, partner, won, schneider, schwarz, laufende, bock, klopfer, players, stake }) {
  const amount = calcSpielwert({ type, schneider, schwarz, laufende, bock, klopfer, stake });
  const isSolo = type !== "Sauspiel";
  const changes = {};
  players.forEach((p) => (changes[p] = 0));

  if (isSolo) {
    const opponents = players.filter((p) => p !== player);
    if (won) {
      changes[player] = amount * opponents.length;
      opponents.forEach((o) => (changes[o] = -amount));
    } else {
      changes[player] = -amount * opponents.length;
      opponents.forEach((o) => (changes[o] = amount));
    }
  } else {
    const team = [player, partner];
    const opponents = players.filter((p) => !team.includes(p));
    if (won) {
      team.forEach((p) => (changes[p] = amount * opponents.length));
      opponents.forEach((o) => (changes[o] = -amount * team.length));
    } else {
      team.forEach((p) => (changes[p] = -amount * opponents.length));
      opponents.forEach((o) => (changes[o] = amount * team.length));
    }
  }
  return { changes, spielwert: amount };
}

import { calcBalances as sharedCalcBalances } from "../shared/balanceCalculator.js";

export function calcBalances(history, players) {
  return sharedCalcBalances(history, players, (g) => g.changes);
}
