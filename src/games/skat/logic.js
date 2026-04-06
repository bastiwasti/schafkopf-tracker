import { calcBalances as sharedCalcBalances } from "../shared/balanceCalculator.js";

// Grundwerte für Farbspiele & Grand
export const CARD_VALUES = {
  grand: 24,
  kreuz: 12,
  pik: 11,
  herz: 10,
  karo: 9,
};

// Null-Varianten: feste Werte
export const NULL_VALUES = {
  "Null": 23,
  "Null Hand": 35,
  "Null Ouvert": 46,
  "Null Ouvert Hand": 59,
};

export const NULL_TYPES = Object.keys(NULL_VALUES);

export const FARB_GRAND_TYPES = ["Karo", "Herz", "Pik", "Kreuz", "Grand"];

export function isNullType(gameType) {
  return NULL_TYPES.includes(gameType);
}

export function isFarbGrandType(gameType) {
  return FARB_GRAND_TYPES.includes(gameType);
}

export function isRamsch(gameType) {
  return gameType === "Ramsch";
}

/**
 * Berechnet den Spielwert (Punkte) eines Skat-Spiels.
 * Für Ramsch nicht relevant (Punkte sind pro Spieler).
 */
export function calcGamePoints({ game_type, spitzen = 1, schneider = false, schwarz = false, re = false, bock = false, hirsch = false }) {
  if (isRamsch(game_type)) return 0;

  const reBoekMult = 1 + (re ? 1 : 0) + (bock ? 1 : 0) + (hirsch ? 1 : 0);

  if (isNullType(game_type)) {
    return NULL_VALUES[game_type] * reBoekMult;
  }

  const baseValue = CARD_VALUES[game_type.toLowerCase()];
  const schneiderBonus = schwarz ? 2 : schneider ? 1 : 0;
  const multiplier = spitzen + 1 + schneiderBonus;
  return baseValue * multiplier * reBoekMult;
}

/**
 * Punkteverteilung pro Spieler.
 * - Normales Spiel: Alleinspieler +points (Sieg) oder -(points×2) (Niederlage), Gegner 0
 * - Ramsch: jeder Spieler verliert seine eigenen Punkte
 */
export function calculatePlayerPoints(game, players) {
  if (isRamsch(game.game_type)) {
    const rp = typeof game.ramsch_points === "string"
      ? JSON.parse(game.ramsch_points)
      : (game.ramsch_points || {});
    const result = {};
    players.forEach(p => { result[p] = -(rp[p] || 0); });
    return result;
  }

  const { declarer, won, points } = game;
  const pointsPerPlayer = {};
  players.forEach(player => {
    if (player === declarer) {
      pointsPerPlayer[player] = won ? points : -(points * 2);
    } else {
      pointsPerPlayer[player] = 0;
    }
  });
  return pointsPerPlayer;
}

export function calcBalances(games, players) {
  return sharedCalcBalances(games, players, (game) => calculatePlayerPoints(game, players));
}

/** Live-Vorschau des Spielwerts für das Formular */
export function calcSpielwert(form) {
  return calcGamePoints(form);
}
