// Rundenanzahl basierend auf Spielerzahl
export function getRoundCount(playerCount) {
  const counts = {
    3: 20,  // 1-20 Karten
    4: 15,  // 1-15 Karten
    5: 12,  // 1-12 Karten
    6: 10,  // 1-10 Karten
  };
  return counts[playerCount] || 15;
}

// Punkte für einen Spieler pro Runde berechnen
export function calculatePlayerScore(prediction, tricks) {
  const diff = prediction - tricks;
  
  if (diff === 0) {
    // Korrekte Vorhersage: 20 + 10 * Stichanzahl
    return 20 + (tricks * 10);
  } else {
    // Falsche Vorhersage: -10 * Abweichung
    return -(Math.abs(diff) * 10);
  }
}

// Alle Spieler-Scores für eine Runde berechnen
export function resolveRound({ predictions, tricks, players }) {
  const scores = {};
  
  players.forEach(p => {
    scores[p] = calculatePlayerScore(
      predictions[p] ?? 0,
      tricks[p] ?? 0
    );
  });
  
  return scores;
}

// Gesamtpunktzahl über alle Runden berechnen
export function calcBalances(rounds, players) {
  const balances = {};
  players.forEach(p => balances[p] = 0);
  
  rounds.forEach(r => {
    players.forEach(p => {
      balances[p] += r.scores[p] || 0;
    });
  });
  
  return balances;
}

// Vorhersage-Range für aktuelle Runde
export function getPredictionRange(currentRound) {
  return {
    min: 0,
    max: currentRound,
  };
}

// Formular-Default-Values erstellen
export function makeDefaultRound(players) {
  const predictions = {};
  const tricks = {};
  
  players.forEach(p => {
    predictions[p] = 0;
    tricks[p] = 0;
  });
  
  return { predictions, tricks };
}
