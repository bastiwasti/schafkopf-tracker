/**
 * Generischer Balance-Kalkulator für alle Spiele.
 *
 * @param {Array} history - Spielverlauf (Spiele oder Runden)
 * @param {string[]} players - Liste der Spielernamen
 * @param {function} extractor - Gibt { [spieler]: punkte } für ein Spiel/Runde zurück
 * @returns {object} Gesamtguthaben pro Spieler: { [spieler]: number }
 */
export function calcBalances(history, players, extractor) {
  const balances = {};
  players.forEach((p) => (balances[p] = 0));
  history.forEach((item) => {
    const points = extractor(item);
    Object.entries(points).forEach(([p, pts]) => {
      if (p in balances) balances[p] += pts || 0;
    });
  });
  return balances;
}
