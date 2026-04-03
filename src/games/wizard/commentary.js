import { PERSONALITIES as _PERSONALITIES } from '../schafkopf/commentary.js';

export { PERSONALITIES } from '../schafkopf/commentary.js';

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

// ---------------------------------------------------------------------------
// COMMENTATOR TEMPLATES
// ---------------------------------------------------------------------------

const COMMENTATOR_TEMPLATES = {
  dramatic: {
    allCorrect: [
      "UNGLAUBLICH! Runde {roundNum} — und ALLE SPIELER lagen EXAKT RICHTIG! {correctCount} von {totalPlayers} perfekte Vorhersagen! Das ist kein Zufall — das ist KÖNNEN! {topPlayer} führt mit {topScore} Punkten!",
      "WAS FÜR EINE RUNDE! Runde {roundNum} mit VOLLSTÄNDIGER PUNKTEAUSBEUTE für alle! {topPlayer} an der Spitze mit {topScore} Punkten — das ist Wizard auf höchstem Niveau!",
      "PERFEKTE RUNDE! In Runde {roundNum} haben alle Spieler ihre Vorhersage HAARGENAU erfüllt! {topPlayer} mit {topScore} Punkten vorne — der Tisch tobt!",
    ],
    allWrong: [
      "EIN DESASTER! Runde {roundNum} — NIEMAND hat die Vorhersage getroffen! {bigMissPlayer} lag um {bigMissDiff} Stiche daneben! Was ist hier nur los?! {topPlayer} führt mit {topScore} Punkten!",
      "CHAOS AUF DEM TISCH! Runde {roundNum} und kein einziger Spieler lag richtig! Das ist kollektives VERSAGEN auf höchstem Niveau! {topPlayer} rettet sich mit {topScore} Punkten ins Ziel!",
      "UNVORSTELLBAR! In Runde {roundNum} verliert jeder! {bigMissPlayer} mit der schlimmsten Abweichung — {bigMissDiff} Stiche daneben! Eine Katastrophe!",
    ],
    mixed: [
      "Runde {roundNum} ist Geschichte! {correctCount} von {totalPlayers} Spielern lagen richtig! {topPlayer} führt mit {topScore} Punkten — {bottomPlayer} muss aufholen!",
      "Runde {roundNum} — ein gemischtes Bild! {topPlayer} mit starken {topScore} Punkten an der Spitze, während {bottomPlayer} kämpft! {bigMissPlayer} lag um {bigMissDiff} Stiche daneben!",
      "Das Feld sortiert sich in Runde {roundNum}! {correctCount} richtige Vorhersagen — {topPlayer} macht es clever und führt mit {topScore} Punkten!",
    ],
  },

  tagesschau: {
    allCorrect: [
      "Runde {roundNum}: Alle {totalPlayers} Spieler lagen korrekt. {topPlayer} führt mit {topScore} Punkten. Das Ergebnis ist bemerkenswert.",
      "Meldung aus Runde {roundNum}: Vollständige Vorhersagegenauigkeit. {correctCount} von {totalPlayers}. {topPlayer} mit {topScore} Punkten an erster Position.",
      "Runde {roundNum} abgeschlossen. Alle Vorhersagen korrekt. {topPlayer}: {topScore} Punkte. Weiter.",
    ],
    allWrong: [
      "Runde {roundNum}: Keine Vorhersage war korrekt. {bigMissPlayer} lag um {bigMissDiff} Stiche daneben. {topPlayer} führt mit {topScore} Punkten. Die Zahlen sprechen für sich.",
      "Meldung: Runde {roundNum} ohne korrekte Vorhersage. Ergebnis: allgemeine Punktverluste. {topPlayer}: {topScore} Punkte.",
      "In Runde {roundNum} trafen alle Spieler daneben. {bottomPlayer} am stärksten betroffen. {topPlayer} mit {topScore} Punkten an der Spitze.",
    ],
    mixed: [
      "Runde {roundNum}: {correctCount} von {totalPlayers} Vorhersagen korrekt. {topPlayer}: {topScore} Punkte. {bottomPlayer} liegt zurück.",
      "Runde {roundNum} abgeschlossen. {topPlayer} führt mit {topScore} Punkten. {bigMissPlayer} lag um {bigMissDiff} Stiche daneben. Stand aktualisiert.",
      "Zwischenstand nach Runde {roundNum}: {topPlayer} mit {topScore} Punkten vorne. {correctCount} von {totalPlayers} lagen richtig.",
    ],
  },

  bavarian: {
    allCorrect: [
      "Na schau! Runde {roundNum} und alle ham richtig geraten! Des is scho was! Da {topPlayer} mit {topScore} Punkten — schee wars!",
      "Jessas, alle richtig in Runde {roundNum}! {correctCount} Spieler, alle auf Kurs! Da {topPlayer} führt mit {topScore} — des is hoid so!",
      "Jo mei, in Runde {roundNum} hod's jeder gwisst! Alle richtig! Da {topPlayer} mit {topScore} Punkten — Bravoo!",
    ],
    allWrong: [
      "Jo mei. Runde {roundNum} und koa hat's troffen. Da {bigMissPlayer} mit {bigMissDiff} Stich daneben — des war halt nix. Da {topPlayer} führt trotzdem mit {topScore}.",
      "Hm. Des war in Runde {roundNum} ned sonderlich glorreich. Alle falsch. Da {topPlayer} mit {topScore} Punkten — wenigstens wer.",
      "Na schau, Runde {roundNum} — alle danebenglangt. Da {bottomPlayer} schaut a bissl blöd. Da {topPlayer} mit {topScore} Punkten noch vorne.",
    ],
    mixed: [
      "Jo, Runde {roundNum} is durch! {correctCount} von {totalPlayers} ham's gwisst. Da {topPlayer} mit {topScore} Punkten führt — des ko ma scho sagn.",
      "Heast, Runde {roundNum} — so hoid so. Da {topPlayer} macht's guad und führt mit {topScore} Punkten. Da {bigMissPlayer} mit {bigMissDiff} daneben — schad.",
      "Na bitte, Runde {roundNum}! {correctCount} Richtige! Da {topPlayer} mit {topScore} Punkten — schee.",
    ],
  },

  fan: {
    allCorrect: [
      "OH MEIN GOTT! Runde {roundNum} — ALLE RICHTIG! Das ist WAHNSINN! {topPlayer} mit {topScore} Punkten! Ich dreh durch!",
      "JAAAAAA! Runde {roundNum} und alle haben's getroffen! {correctCount} perfekte Vorhersagen! {topPlayer} führt mit {topScore}! Unglaublich!",
      "Ich fasse es NICHT! Alle in Runde {roundNum} exakt richtig! {topPlayer} mit {topScore} Punkten — der ist auf einem anderen Level!",
    ],
    allWrong: [
      "NOOOO! Runde {roundNum} — KEINER lag richtig?! Das kann doch nicht sein! {bigMissPlayer} mit {bigMissDiff} Stichen daneben! Was ist das?!",
      "Aaaargh! Runde {roundNum} und alle falsch! Alle! {bottomPlayer} am schlimmsten! {topPlayer} hält sich noch mit {topScore} — aber wie?!",
      "OH NEIN OH NEIN! In Runde {roundNum} schießt jeder am Ziel vorbei! {topPlayer} führt mit {topScore} aber das ist auch kein Ruhm!",
    ],
    mixed: [
      "WOW! Runde {roundNum} ist durch! {correctCount} von {totalPlayers} lagen richtig! {topPlayer} mit {topScore} Punkten — der macht das!",
      "Runde {roundNum}! {topPlayer} mit {topScore} Punkten — STARK! {bottomPlayer} muss sich was überlegen! {bigMissPlayer} mit {bigMissDiff} Stichen daneben — oje!",
      "YES! {correctCount} richtige Vorhersagen in Runde {roundNum}! {topPlayer} mit {topScore} führt! Das wird spannend!",
    ],
  },
};

// ---------------------------------------------------------------------------
// PLAYER REACTION TEMPLATES
// ---------------------------------------------------------------------------

const PLAYER_REACTIONS = {
  dramatic: {
    won: [
      "Natürlich! Hat jemand etwas anderes erwartet?!",
      "Präzision ist mein zweiter Vorname.",
      "Das war Wissenschaft, keine Glücksache!",
      "Ich hab es gewusst. Ich hab es die ganze Zeit gewusst.",
    ],
    lost: [
      "Das ist ein SKANDAL! Ich verlange eine Neuauszählung!",
      "Sabotage. Eindeutig Sabotage.",
      "Das war... taktisches Danebentippen. Ja.",
      "Beim nächsten Mal wird das anders. Das schwöre ich.",
    ],
  },
  tagesschau: {
    won: [
      "Die Vorhersage war korrekt. Das Ergebnis entspricht der Erwartung.",
      "Richtig gelegen. Weiter.",
      "Ergebnis: positiv.",
    ],
    lost: [
      "Die Vorhersage war fehlerhaft. Wird vermerkt.",
      "Falsch. Wird zur Kenntnis genommen.",
      "Die Abweichung ist dokumentiert.",
    ],
  },
  bavarian: {
    won: [
      "Jo, hob i ma glei dacht!",
      "Freilich! Was sonst!",
      "Des war a gute Runde, muss i sagn.",
      "Heast, des war sauguad!",
    ],
    lost: [
      "Jo mei. Ned mein Tog.",
      "Passiert. Nächste Runde.",
      "Hm. Des war halt nix.",
    ],
  },
  fan: {
    won: [
      "JAAAA! Das ist mein Moment!",
      "Hab ich euch nicht gesagt?! Ich bin so gut!",
      "UNGLAUBLICH! Ich liebe dieses Spiel!",
    ],
    lost: [
      "NOOO! Das war so knapp! Oder auch nicht!",
      "Ich fasse es nicht! Nächste Runde!",
      "Ugh! Das darf nicht wahr sein!",
    ],
  },
};

const OPPONENT_REACTIONS = {
  dramatic: {
    won: [
      "Gut gemacht. Mein Vorsprung wächst.",
      "Solide Runde. Wie erwartet.",
    ],
    lost: [
      "Glück gehabt. Das nächste Mal gewinne ich.",
      "Das war Glück. Nur Glück.",
    ],
  },
  tagesschau: {
    won: [
      "Ergebnis notiert. Weiter.",
      "Akzeptabel.",
    ],
    lost: [
      "Verlust verbucht.",
      "Nächste Runde.",
    ],
  },
  bavarian: {
    won: [
      "Jo, schee!",
      "Freilich, des geht scho!",
    ],
    lost: [
      "Na, nächste Moi.",
      "Jo mei, so is des.",
    ],
  },
  fan: {
    won: [
      "Ja! Das war auch meine Runde!",
      "Super! Weiter so!",
    ],
    lost: [
      "Oh komm schon!",
      "Nächste Runde gehört mir!",
    ],
  },
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function analyzeRound(round, players) {
  const { predictions, tricks, scores } = round;

  let correctCount = 0;
  let bigMissPlayer = null;
  let bigMissDiff = 0;

  players.forEach((p) => {
    const pred = predictions[p] ?? 0;
    const actual = tricks[p] ?? 0;
    const diff = Math.abs(pred - actual);
    if (diff === 0) correctCount++;
    if (diff > bigMissDiff) {
      bigMissDiff = diff;
      bigMissPlayer = p;
    }
  });

  const sorted = [...players].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));
  const topPlayer = sorted[0];
  const bottomPlayer = sorted[sorted.length - 1];
  const topScore = scores[topPlayer] ?? 0;

  const allCorrect = correctCount === players.length;
  const allWrong = correctCount === 0;

  return { correctCount, bigMissPlayer, bigMissDiff, topPlayer, bottomPlayer, topScore, allCorrect, allWrong };
}

function getTotalRounds(playerCount) {
  const counts = { 3: 20, 4: 15, 5: 12, 6: 10 };
  return counts[playerCount] || 15;
}

export function reactionChance(round, players, totalRounds) {
  const { bigMissDiff, allCorrect, allWrong } = analyzeRound(round, players);
  const scores = Object.values(round.scores ?? {});
  const scoreSpread = scores.length >= 2 ? Math.max(...scores) - Math.min(...scores) : 0;
  const isLastRound = round.round_number >= totalRounds;

  let p = 0.35;
  if (allCorrect) p += 0.30;
  if (allWrong) p += 0.35;
  if (bigMissDiff >= 3) p += 0.25;
  if (scoreSpread >= 50) p += 0.20;
  if (isLastRound) p += 0.25;
  return Math.min(p, 0.95);
}

/**
 * Build the full commentary for one Wizard round.
 * Returns { segments: [{avatar, name, label, text}], spokenText }
 *
 * @param {object} round        - wizard round from the API (round_number, predictions, tricks, scores)
 * @param {Array}  regPlayers   - registered players array (for avatar/character_type lookup)
 * @param {string} personality  - commentator personality key
 */
export function buildWizardCommentary(round, regPlayers = [], personality = "dramatic") {
  const pers = _PERSONALITIES[personality] ?? _PERSONALITIES.dramatic;
  const regMap = Object.fromEntries((regPlayers ?? []).map((p) => [p.name, p]));
  const players = Object.keys(round.predictions ?? {});
  const totalRounds = getTotalRounds(players.length);

  const { correctCount, bigMissPlayer, bigMissDiff, topPlayer, bottomPlayer, topScore, allCorrect, allWrong } =
    analyzeRound(round, players);

  const scenario = allCorrect ? "allCorrect" : allWrong ? "allWrong" : "mixed";
  const templates = (COMMENTATOR_TEMPLATES[personality] ?? COMMENTATOR_TEMPLATES.dramatic)[scenario];

  const vars = {
    roundNum: round.round_number,
    topPlayer,
    topScore,
    bottomPlayer,
    correctCount,
    totalPlayers: players.length,
    bigMissPlayer: bigMissPlayer ?? "",
    bigMissDiff,
  };

  const segments = [
    {
      avatar: pers.icon,
      name: "Kommentator",
      label: pers.label,
      text: fill(pickRandom(templates), vars),
    },
  ];

  const chance = reactionChance(round, players, totalRounds);

  // Best scorer reaction
  if (Math.random() < chance) {
    const reg = regMap[topPlayer];
    const charType = reg?.character_type ?? "dramatic";
    const topPlayerCorrect = (round.scores?.[topPlayer] ?? 0) >= 0;
    const pool = (PLAYER_REACTIONS[charType] ?? PLAYER_REACTIONS.dramatic)[topPlayerCorrect ? "won" : "lost"];
    segments.push({
      avatar: reg?.avatar ?? "🃏",
      name: topPlayer,
      label: _PERSONALITIES[charType]?.label ?? "",
      text: pickRandom(pool),
    });
  }

  // Worst scorer reaction (slightly lower chance)
  if (bottomPlayer !== topPlayer && Math.random() < chance * 0.75) {
    const reg = regMap[bottomPlayer];
    const charType = reg?.character_type ?? "dramatic";
    const bottomPlayerCorrect = (round.scores?.[bottomPlayer] ?? 0) >= 0;
    const pool = (OPPONENT_REACTIONS[charType] ?? OPPONENT_REACTIONS.dramatic)[bottomPlayerCorrect ? "won" : "lost"];
    segments.push({
      avatar: reg?.avatar ?? "🃏",
      name: bottomPlayer,
      label: "",
      text: pickRandom(pool),
    });
  }

  const spokenText = segments.map((s) => s.text).join(" — ");
  return { segments, spokenText };
}
