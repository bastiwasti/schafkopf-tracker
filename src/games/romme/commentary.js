import { PERSONALITIES, pickRandom, fill } from '../shared/commentary.js';
import { PLAYER_PERSONALITIES, PLAYER_REACTIONS } from '../shared/playerPersonalities.js';

const COMMENTATOR_TEMPLATES = {
  dramatic: {
    first_round: [
      "DAS ist der Start einer EPISCHEN Romme-Session!",
      "Die erste Runde beginnt - {winner} zieht an!",
      "Wir LIVE bei Romme - ERSTE RUNDE!",
    ],
    perfect_round: [
      "PERFEKTE RUNDE! {winner} macht 0 Punkte - die anderen kampfen um die Platze! Minimale Schaden!",
      "SAUBERER SIEG! {winner} bleibt bei 0, während die anderen {loser_scores} kassieren! Das nennt man souveran!",
      "BLITZSAUBER! {winner} gewinnt ohne Minuspunkte - die Verlierer nehmen {loser_scores} Punkte auf!",
    ],
    dominant_lead: [
      "DOMINANZ! {leader} fuhrt mit {leader_gap} Punkten Vorsprung auf {second}! Die anderen konnen nicht mithalten!",
      "KLARE SACHE! {leader} baut den Vorsprung auf {second} aus - {leader_gap} Punkte! Das wird schwer einzuholen!",
      "UNAUFHALTSAM! {leader} dominiert das Spiel - {leader_gap} Punkte vor {second}!",
    ],
    close_game: [
      "ES BRENNT! {leader} fuhrt mit {gap} Punkten vor {second} - das Rennen ist komplett offen!",
      "KNAPPER GEHT'S KAUM! {gap} Punkte trennen {leader} und {second} - jede Runde konnte das Spiel entscheiden!",
      "HOCHSPANNUNG! {leader} vor {second} mit {gap} Punkten - wer gewinnt am Ende?",
    ],
    worst_player: [
      "EINBRUCH! {worst_player} hat {worst_score} Minuspunkte - das Maximum in dieser Session!",
      "KATASTROPHE! {worst_player} sammelt Minuspunkte wie ein Schwarzes Loch - {worst_score} Gesamtpunkte!",
      "KRITISCH! {worst_player} mit {worst_score} Punkten im Minus - kann der Abend noch gerettet werden?",
    ],
    negative_run: [
      "SERIE! {player} hat {streak_count} Runden in Folge Minuspunkte - insgesamt {total} Punkte! Das ist harter Tobak!",
      "TRAGIK! {player} in einer Negativserie - {streak_count} Runden hintereinander, {total} Punkte Gesamtschaden!",
      "KRISIS! {player} mit {streak_count} Runden am Stuck im Minus - {total} Punkte! Irgendwann muss sich das drehen!",
    ],
    comeback: [
      "COMEBACK! {player} war letzter und ist jetzt ganz vorne! {gap} Punkte aufgeholt - unglaublich!",
      "DIESES RETURN! {player} aus dem Keller an die Spitze - {gap} Punkte Unterschied! Drama pur!",
      "FANTASTISCHE AUFHOLJAGD! {player} erobert Platz 1 von ganz unten - {gap} Punkte zuruck!",
    ],
    leader_change: [
      "TABELLENFUHRERWECHSEL! {new_leader} uberholt den {old_leader}! Das Rennen ist neu!",
      "NEUE NUMMER 1! {new_leader} entthront den {old_leader}! Die Spannung steigt!",
      "DURCHBRUCH! {new_leader} ist jetzt ganz oben - {old_leader} muss passen! Was fur ein Duell!",
    ],
    mixed: [
      "Spannende Runde! {winner} gewinnt!",
      "Weiter geht's! {winner} nimmt diese!",
    ],
  },

  tagesschau: {
    first_round: [
      "Die erste Runde hat begonnen. {winner} gewinnt diese.",
      "Die Romme-Session offnet mit einem Sieg fur {winner}.",
      "Startschuss: {winner} gewinnt die erste Runde.",
    ],
    perfect_round: [
      "Eine perfekte Runde. {winner} bleibt bei 0 Punkten, die Gegner erhalten {loser_scores} Minuspunkte.",
      "Ausgezeichnet: {winner} gewinnt ohne Minuspunkte. Die anderen Spieler erhalten {loser_scores}.",
      "Souveran: {winner} mit 0 Punkten, die Gegner mit {loser_scores} Punkten.",
    ],
    dominant_lead: [
      "{leader} fuhrt souveran mit {leader_gap} Punkten Vorsprung auf {second}.",
      "Klarer Vorsprung fur {leader}: {leader_gap} Punkte vor {second}.",
      "Dominanz durch {leader}. Der Abstand auf {second} betragt {leader_gap} Punkte.",
    ],
    close_game: [
      "Das Rennen ist offen. {leader} fuhrt mit {gap} Punkten vor {second}.",
      "Knapper Vorsprung fur {leader} vor {second}: {gap} Punkte.",
      "Spannende Situation: {gap} Punkte trennen {leader} und {second}.",
    ],
    worst_player: [
      "{worst_player} hat {worst_score} Minuspunkte. Die Position ist kritisch.",
      "Schwere Zeiten fur {worst_player}: {worst_score} Punkte im Minus.",
      "Negatives Ergebnis fur {worst_player}: {worst_score} Minuspunkte.",
    ],
    negative_run: [
      "{player} zeigt eine negative Serie: {streak_count} Runden mit {total} Minuspunkten.",
      "Schwache Phase fur {player}: {streak_count} Runden in Folge mit insgesamt {total} Punkten im Minus.",
      "Anhaltende Schwierigkeiten fur {player}: {streak_count} Runden, {total} Minuspunkte.",
    ],
    comeback: [
      "{player} erobert die Fuhrung. Aufholjagd mit {gap} Punkten.",
      "Bemerkenswerte Entwicklung: {player} steigt auf Platz 1 auf. {gap} Punkte zuruckgelegt.",
      "Wende: {player} nimmt die Fuhrung ein. Aufholjagd um {gap} Punkte.",
    ],
    leader_change: [
      "{new_leader} uberholt den {old_leader} und ubernimmt die Fuhrung.",
      "Tabellenfuhrungswechsel: {new_leader} ist jetzt vorne, vor {old_leader}.",
      "Neue Fuhrung: {new_leader} verdrangt {old_leader} auf Platz 2.",
    ],
    mixed: [
      "{winner} gewinnt diese Runde.",
      "Sieg fur {winner}.",
    ],
  },

  bavarian: {
    first_round: [
      "Ois klar, erst'moi los! {winner} nimmt de erschde Runde!",
      "Dann fangen ma o: {winner} gewinnt!",
      "Na freilich, da schaug ma moi - {winner} zieht an!",
    ],
    perfect_round: [
      "Des is a Leistung! {winner} mit 0 Pünkte - de andern schaug'n ned so guad aus mit {loser_scores}!",
      "Bass scho! {winner} mit 0 Pünkte, de andern kassiern {loser_scores} - des is a feine Sach!",
      "Sauber! {winner} bleibt ohne Minuspunkte, de andern kriag'n {loser_scores} - des is a feine Arbeit!",
    ],
    dominant_lead: [
      "Oach gott, {leader} is aas aas fiahrend! {leader_gap} Pünkte vor {second} - des wird schwer!",
      "Des is a Klasse! {leader} baut an Vorsprung auf {second} aus - {leader_gap} Pünkte!",
      "Na bitte, {leader} lauft davo! {leader_gap} Pünkte vor {second} - des is a Kraftleistung!",
    ],
    close_game: [
      "Jo mei, des geht kna! {leader} fiahrt mit {gap} Pünkte vor {second} - des is a spannende Sach!",
      "Na schau, {gap} Pünkte Trennung zwischn {leader} und {second} - koana woas ob's no guad geht!",
      "Oach gott, des is a spannende Sach! {leader} vor {second} mit {gap} Pünkte - koana woas wann's vorbei is!",
    ],
    worst_player: [
      "Oach gott, des schaut ned guad aus! {worst_player} hod scho {worst_score} Pünkte im Keller - des is furchtbar!",
      "Sapperment! {worst_player} mit {worst_score} Minuspunkten - i glaub da schaugt jemand schlimms aus!",
      "Na schau, {worst_player} is im Talfalzone! {worst_score} Pünkte - kann no was wern?",
    ],
    negative_run: [
      "Jo mei, des lauft ned guad! {player} hod scho {streak_count} Runden hintenan Minuspunkte - {total} Pünkte g'samt!",
      "Herrgott, {player} rutscht ab! {streak_count} Runden mit Minuspunkten - {total} Pünkte! I woast des aufhoid?",
      "Na schau, {player} is in da Talfalzone! {streak_count} Runden ohne Erfolg - {total} Pünkte im Minus!",
    ],
    comeback: [
      "Des is a Wahnsinn! {player} war letzta und is jetzt vorne! {gap} Pünke aufghoht - des is a Romme-Wunda!",
      "Jo freilich, {player} kompts zruck! Voim letztn auf eas - {gap} Pünke Differenz! Des is a echte Aufholjagd!",
      "Na bitte, des gibt's doch ned eas! {player} holt sich auf eas - {gap} Pünke Rückstand! Des is a echte Aufholjagd!",
    ],
    leader_change: [
      "Umschwung! {new_leader} uberholt den {old_leader}! Des war uberfallig!",
      "Na bitte! {old_leader} war voan, jetzt is {new_leader}! Des Spiel draht si!",
      "Durchbruch! {new_leader} schnappt sich d'Führung vom {old_leader}! Des is a Kraftleistung!",
    ],
    mixed: [
      "Jo mei, {winner} hod gewonnen!",
      "Freilich, {winner} - des war a guade Runde!",
      "Des is schon wunderschon - {winner} gewinnt!",
    ],
  },

  fan: {
    first_round: [
      "YEAH! ERSTE RUNDE! {winner} GEWINNT!",
      "SUPER! {winner} nimmt die erste Runde!",
      "WOW! Startschuss gefallen! {winner}!",
    ],
    perfect_round: [
      "JAAAA! PERFECT ROUND! {winner} mit 0 Punkten! The others take {loser_scores}! AMAZING!",
      "OH MY GOD! {winner} macht BLANK! 0 points while the others {loser_scores} kassieren! PERFECT!",
      "ZERO POINTS FOR {winner}! The others take {loser_scores} - THIS IS PURE GOLD! INCREDIBLE!",
    ],
    dominant_lead: [
      "DOMINATION! {leader} leads with {leader_gap} points ahead of {second}! Nobody can stop him!",
      "UNSTOPPABLE! {leader} is UNTOUCHABLE! {leader_gap} points ahead of {second}! Game OVER vibes!",
      "POWER PLAY! {leader} baut the Vorsprung out - {leader_gap} points to {second}! INSANE!",
    ],
    close_game: [
      "OH MEIN GOTT SO CLOSE! {gap} points between {leader} and {second}! This is HEART-STOPPING!",
      "TIE GAME VIBES! {leader} with {leader_gap} - {second} lurking right behind! WHO WILL WIN?! I CAN'T TAKE IT!",
      "INCREDIBLE TENSION! {gap} points separate {leader} and {second}! This could go ANY way! DRAMA!",
    ],
    worst_player: [
      "OH NOOO! {worst_player} has {worst_score} MINUS POINTS! That's CRUSHING! Can they come back?!",
      "DISASTER! {worst_player} is at {worst_score} points in red! This is TERRIBLE! The basement!",
      "I CAN'T BELIEVE IT! {worst_player} with {worst_score} minus points! That's the worst score ever!",
    ],
    negative_run: [
      "NOOOO! {player} has {streak_count} rounds of MINUS POINTS! {total} total! This is PAINFUL!",
      "MELTDOWN! {player} is in a FREEFALL! {streak_count} bad rounds - {total} total points! Stop the bleeding!",
      "Aaaargh! {player} with {streak_count} negative rounds in a row! {total} total! HEARTBREAKING!",
    ],
    comeback: [
      "YES YES YES! COMEBACK! {player} was LAST and is now FIRST! {gap} points recovered! INCREDIBLE!",
      "UNBELIEVABLE! {player} climbs from LAST to FIRST! {gap} points back! WHAT A JOURNEY!",
      "I LOVE THIS GAME! {player} from the basement to penthouse! {gap} points! AMAZING COMEBACK!",
    ],
    leader_change: [
      "YES YES YES! NEW LEADER! {new_leader} overtakes {old_leader}! The race is ON! EXCITING!",
      "OH MY GOD LEADER CHANGE! {new_leader} is NOW FIRST! {old_leader} drops to second! DRAMA!",
      "PROMOTION TIME! {new_leader} takes the lead from {old_leader}! The standings are SHAKING! AMAZING!",
    ],
    mixed: [
      "YEAH! {winner} gewinnt!",
      "SUPER! {winner}!",
      "COOL! {winner} siegt!",
    ],
  },
};

const SCENARIOS_BY_PERSONALITY = {
  dramatic: COMMENTATOR_TEMPLATES.dramatic,
  tagesschau: COMMENTATOR_TEMPLATES.tagesschau,
  bavarian: COMMENTATOR_TEMPLATES.bavarian,
  fan: COMMENTATOR_TEMPLATES.fan,
};

function getRommeScenario(round, balances, history, prevBalances) {
  const { winner } = round;
  const players = Object.keys(balances);

  if (history.length === 0) {
    return { type: "first_round", winner };
  }

  const loserScores = Object.entries(balances)
    .filter(([player, score]) => player !== winner && score > 0)
    .map(([, score]) => score);

  if (balances[winner] === 0 && loserScores.length > 0 && loserScores.every(s => s <= 10)) {
    return { type: "perfect_round", winner, loser_scores: loserScores.join(" / ") };
  }

  const sortedByBalance = [...players].sort((a, b) => balances[a] - balances[b]);
  const leader = sortedByBalance[0];
  const second = sortedByBalance[1];
  const leaderGap = second ? balances[second] - balances[leader] : 0;

  if (leaderGap >= 50) {
    return { type: "dominant_lead", leader, second, leader_gap: leaderGap };
  }

  if (leaderGap > 0 && leaderGap <= 15) {
    return { type: "close_game", leader, second, gap: leaderGap };
  }

  const worstPlayer = sortedByBalance[sortedByBalance.length - 1];
  const worstScore = balances[worstPlayer];

  if (worstScore >= 50) {
    return { type: "worst_player", worst_player: worstPlayer, worst_score: worstScore };
  }

  // Szenario 6: Negative Serie (3+ Runden in Folge Minuspunkte)
  let worstStreak = { player: null, streak_count: 0, total: 0 };
  
  players.forEach(player => {
    let streak = 0;
    let total = 0;
    
    history.slice(-5).forEach(r => {
      if (r.winner !== player && r.scores[player] > 0) {
        streak++;
        total += r.scores[player];
      } else {
        streak = 0;
      }
    });
    
    if (streak > worstStreak.streak_count && streak >= 3) {
      worstStreak = { player, streak_count: streak, total };
    }
  });
  
  if (worstStreak.player) {
    return { type: "negative_run", player: worstStreak.player, streak_count: worstStreak.streak_count, total: worstStreak.total };
  }

  if (prevBalances) {
    const prevSorted = [...players].sort((a, b) => prevBalances[a] - prevBalances[b]);
    const prevLast = prevSorted[prevSorted.length - 1];
    const prevLeader = prevSorted[0];
    
    // Comeback: Last player in previous round is now leader
    if (prevLast === leader && leader !== prevLeader) {
      const gap = balances[prevLast] - prevBalances[prevLast];
      return { type: "comeback", player: leader, gap };
    }

    if (leader !== prevLeader) {
      const newLeaderBal = balances[leader];
      const oldLeaderBal = balances[prevLeader];
      const gap = newLeaderBal - oldLeaderBal;

      if (gap > 0) {
        return { type: "leader_change", new_leader: leader, old_leader: prevLeader, gap };
      }
    }
  }

  return { type: "mixed", winner };
}

export function buildRommeCommentary(round, history, personality = PERSONALITIES.DRAMATIC, prevBalances) {
  try {
    console.log('[buildRommeCommentary] Building commentary for round:', round);

    if (!round || typeof round !== 'object') {
      console.error('[buildRommeCommentary] Invalid round data:', round);
      return { segments: [{ avatar: " ", name: "System", label: "Fehler", text: "Ungultige Rundendaten" }] };
    }

    const { scores } = round;
    const players = Object.keys(scores || {});

    const balances = {};
    players.forEach(p => balances[p] = 0);
    history.forEach(r => {
      const rScores = r.scores || {};
      Object.entries(rScores).forEach(([player, score]) => {
        if (balances[player] !== undefined) {
          balances[player] -= score;
        }
      });
    });

    const scenario = getRommeScenario(round, balances, history, prevBalances);
    console.log('[buildRommeCommentary] Detected scenario:', scenario);

    const templates = SCENARIOS_BY_PERSONALITY[personality] || SCENARIOS_BY_PERSONALITY.dramatic;
    const templateKey = scenario.type;
    const templateList = templates[templateKey] || templates.mixed || [];

    if (templateList.length === 0) {
      console.warn('[buildRommeCommentary] No templates found for scenario:', templateKey);
      return { segments: [{ avatar: " ", name: "Kommentator", label: "Info", text: "Kein Kommentar verfugbar" }] };
    }

    const template = pickRandom(templateList);
    const filledText = fill(template, scenario);

    const segments = [{
      avatar: " ",
      name: PERSONALITIES[personality]?.label || "Kommentator",
      label: PERSONALITIES[personality]?.label || "Kommentator",
      text: filledText,
    }];

    console.log('[buildRommeCommentary] Commentary built:', segments);

    return {
      segments,
      spokenText: filledText,
      scenario: scenario.type,
    };
  } catch (error) {
    console.error('[buildRommeCommentary] Error building commentary:', error);
    return {
      segments: [{
        avatar: " ",
        name: "System",
        label: "Fehler",
        text: "Fehler beim Erstellen des Kommentars: " + error.message,
      }],
      spokenText: "Fehler",
    };
  }
}

export default {
  id: "romme",
  label: "Romme",
  description: "Kartenspiel · 2-6 Spieler · Minuspunkte",
  defaultStake: 0,
  playerCount: { min: 2, max: 6 },
  playerHint: "Wahle 2 bis 6 Spieler. Alle spielen jede Runde mit.",
  SessionComponent: null,
  buildCommentary: buildRommeCommentary,
  getSessionMeta: (s) => `${s.game_count} ${s.game_count === 1 ? "Runde" : "Runden"}`,
};
