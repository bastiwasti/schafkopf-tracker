import styles from "../../components/styles.js";

export const GAME_TYPES = [
  { name: "Grand", multiplier: 24 },
  { name: "Kreuz", multiplier: 12 },
  { name: "Pik", multiplier: 11 },
  { name: "Herz", multiplier: 10 },
  { name: "Null", multiplier: 23 },
  { name: "Kontra", multiplier: 1 },
];

export const CARD_VALUES = {
  grand: 24,
  kreuz: 12,
  pik: 11,
  herz: 10,
  null: 23,
};

export function getTrumpfCount(gameType, laufende) {
  if (gameType !== "grand") return laufende;
  return laufende + 4;
}

export function calculateBasePoints(gameType, laufende) {
  let baseValue = CARD_VALUES[gameType];
  
  if (gameType === "grand") {
    const trumpfCount = getTrumpfCount(gameType, laufende);
    baseValue += trumpfCount;
  } else if (gameType !== "null") {
    baseValue += laufende;
  }
  
  return baseValue;
}

export function getSchneiderMultiplier(schneider, schwarz) {
  if (schwarz) return 3;
  if (schneider) return 2;
  return 1;
}

export function calculateGameValue(gameType, laufende, schneider, schwarz, bock = 1) {
  const baseValue = calculateBasePoints(gameType, laufende);
  const schneiderMultiplier = getSchneiderMultiplier(schneider, schwarz);
  const bockMultiplier = Math.pow(2, bock - 1);
  return baseValue * schneiderMultiplier * bockMultiplier;
}

export function calculateKontraGameValue(gameType, laufende, schneider, schwarz, kontraMultiplier, bock = 1) {
  const baseValue = calculateBasePoints(gameType, laufende);
  const schneiderMultiplier = getSchneiderMultiplier(schneider, schwarz);
  const bockMultiplier = Math.pow(2, bock - 1);
  return baseValue * schneiderMultiplier * kontraMultiplier * bockMultiplier;
}

export function calculatePlayerPoints(game, players) {
  const { game_type, declarer, partner, contra, won, points, kontra_multiplier } = game;
  const pointsPerPlayer = {};

  players.forEach(player => {
    if (player === declarer) {
      if (won) {
        pointsPerPlayer[player] = points;
      } else {
        pointsPerPlayer[player] = -points;
      }
    } else if (player === partner) {
      if (won) {
        pointsPerPlayer[player] = points;
      } else {
        pointsPerPlayer[player] = -points;
      }
    } else if (player === contra) {
      if (game_type === "kontra" && won) {
        pointsPerPlayer[player] = points * 2;
      } else {
        pointsPerPlayer[player] = -points;
      }
    } else {
      pointsPerPlayer[player] = 0;
    }
  });

  return pointsPerPlayer;
}

import { calcBalances as sharedCalcBalances } from "../shared/balanceCalculator.js";

export function calcBalances(games, players) {
  return sharedCalcBalances(games, players, (game) => calculatePlayerPoints(game, players));
}

export function calcSpielwert(form) {
  const { game_type, laufende, schneider, schwarz, kontra_multiplier, bock, stake } = form;
  
  let points;
  if (game_type === "kontra") {
    points = calculateKontraGameValue(
      "grand",
      laufende,
      schneider,
      schwarz,
      kontra_multiplier,
      bock
    );
  } else {
    const gameTypeKey = game_type.toLowerCase();
    points = calculateGameValue(
      gameTypeKey,
      laufende,
      schneider,
      schwarz,
      bock
    );
  }
  
  return points * stake;
}

export function resolveGame(form) {
  const { game_type, declarer, partner, contra, won, schneider, schwarz, laufende, kontra_multiplier, bock, stake } = form;
  
  let points;
  if (game_type === "kontra") {
    points = calculateKontraGameValue(
      "grand",
      laufende,
      schneider,
      schwarz,
      kontra_multiplier,
      bock
    );
  } else {
    const gameTypeKey = game_type.toLowerCase();
    points = calculateGameValue(
      gameTypeKey,
      laufende,
      schneider,
      schwarz,
      bock
    );
  }
  
  return {
    id: crypto.randomUUID(),
    game_type,
    declarer,
    partner: partner ?? null,
    contra: contra ?? null,
    won,
    schneider,
    schwarz,
    laufende,
    kontra_multiplier: kontra_multiplier ?? 1,
    bock,
    points,
  };
}

export default styles;
