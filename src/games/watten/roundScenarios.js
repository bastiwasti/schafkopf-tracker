// ---------------------------------------------------------------------------
// WATTEN — SZENARIO-ERKENNUNG
// ---------------------------------------------------------------------------
// analyzeWattenScenario(data) → scenario string (17 mögliche Szenarien)
// calcMaxDeficit(rounds, winnerTeam) → max Rückstand des Gewinnerteams
// buildTemplateVars(data) → Template-Variablen Objekt
// ---------------------------------------------------------------------------

/**
 * Berechnet den maximalen Rückstand des Gewinnerteams im Spielverlauf.
 * Dient zur Erkennung von Comeback-Siegen.
 * @param {Array} rounds - Alle Runden des aktuellen Spiels (inkl. aktuelle Runde)
 * @param {string} winnerTeam - 'team1' oder 'team2'
 * @returns {number} Maximaler Rückstand in Punkten
 */
export function calcMaxDeficit(rounds, winnerTeam) {
  let t1 = 0, t2 = 0;
  let maxDeficit = 0;
  for (const r of rounds) {
    if (r.winning_team === 'team1') t1 += (r.points || 2);
    else t2 += (r.points || 2);
    const deficit = winnerTeam === 'team1' ? (t2 - t1) : (t1 - t2);
    if (deficit > maxDeficit) maxDeficit = deficit;
  }
  return maxDeficit;
}

/**
 * Baut das Template-Variablen-Objekt für den Kommentator.
 */
export function buildTemplateVars(data) {
  const {
    round, team1_score, team2_score,
    targetScore, team1_players, team2_players,
    team1Bommel, team2Bommel, activeGameRounds,
  } = data;

  const team1Name = (team1_players || []).join(" + ");
  const team2Name = (team2_players || []).join(" + ");
  const winnerName = round.winning_team === 'team1' ? team1Name : team2Name;
  const loserName  = round.winning_team === 'team1' ? team2Name : team1Name;
  const hasTricks  = (round.tricks_team1 + round.tricks_team2) > 0;
  const winnerTricks = round.winning_team === 'team1' ? round.tricks_team1 : round.tricks_team2;
  const loserTricks  = round.winning_team === 'team1' ? round.tricks_team2 : round.tricks_team1;
  const totalBommel  = team1Bommel + team2Bommel;
  const bommelLeader  = team1Bommel >= team2Bommel ? team1Name : team2Name;
  const bommelTrailer = team1Bommel >= team2Bommel ? team2Name : team1Name;
  const bommelDiff    = Math.abs(team1Bommel - team2Bommel);
  const maxDeficit    = calcMaxDeficit(activeGameRounds || [], round.winning_team);

  return {
    winnerTeam: winnerName,
    loserTeam:  loserName,
    points:     round.points || 2,
    team1Name,
    team2Name,
    team1Score: team1_score,
    team2Score: team2_score,
    targetScore: targetScore || 15,
    team1Bommel,
    team2Bommel,
    totalBommel,
    maxDeficit,
    winnerTricks,
    loserTricks,
    bommelLeader,
    bommelTrailer,
    bommelDiff,
    hasTricks,
  };
}

/**
 * Erkennt das relevanteste Szenario für diese Runde.
 * Prioritätsreihenfolge: Spielende > Modifier > Spielverlauf > Fallback
 */
export function analyzeWattenScenario(data) {
  const {
    round,
    team1_score, team2_score,
    targetScore,
    team1Bommel, team2Bommel,
    gameJustCompleted,
    activeGameRounds,
  } = data;

  const target     = targetScore || 15;
  const hasTricks  = (round.tricks_team1 + round.tricks_team2) > 0;
  const totalBommel = team1Bommel + team2Bommel;

  // ── Spielende-Szenarien (höchste Priorität) ─────────────────────────────
  if (gameJustCompleted) {
    const winnerTeam  = round.winning_team;
    const winnerScore = winnerTeam === 'team1' ? team1_score : team2_score;
    const loserScore  = winnerTeam === 'team1' ? team2_score : team1_score;
    const maxDef      = calcMaxDeficit(activeGameRounds || [], winnerTeam);

    if (loserScore === 0)       return 'game_won_zu_null';
    if (maxDef >= 6)            return 'game_won_comeback';
    if (loserScore >= target - 2) return 'game_won_gespannt_duel';

    // Bommerl-Szenarien haben Vorrang vor dem generischen Dominant-Sieg
    if (totalBommel === 1)      return 'bommerl_first';
    const bDiff = Math.abs(team1Bommel - team2Bommel);
    if (bDiff >= 2)             return 'bommerl_lead';
    if (team1Bommel === team2Bommel && team1Bommel >= 1) return 'bommerl_even';

    return 'game_won_dominant';
  }

  // ── Modifier-Szenarien ───────────────────────────────────────────────────
  if (round.is_machine)       return 'maschine';
  if (round.is_gegangen)      return 'gegangen';
  if (round.is_spannt_played) return 'spannt_geht';

  // ── Laufendes Spiel ──────────────────────────────────────────────────────
  const wasGespannt = (data.team1_score_before >= target - 2) || (data.team2_score_before >= target - 2);
  if (wasGespannt)                      return 'gespannt_round';
  if (round.points === 5)               return 'round_5_points';

  if (hasTricks) {
    const maxTricks = Math.max(round.tricks_team1, round.tricks_team2);
    if (maxTricks >= 4)                 return 'stiche_dominant';
    if (round.tricks_team1 > 0 && round.tricks_team2 > 0) return 'stiche_close';
  }

  const diff     = Math.abs(team1_score - team2_score);
  const maxScore = Math.max(team1_score, team2_score);
  if (diff <= 2 && maxScore >= 4)       return 'close_game';
  if (diff >= 6)                        return 'dominant_lead';

  return 'mixed';
}
