import { PERSONALITIES, pickRandom, fill } from '../shared/commentary.js';
import { PLAYER_PERSONALITIES, PLAYER_REACTIONS } from '../shared/playerPersonalities.js';
import { analyzeWattenScenario, buildTemplateVars } from './roundScenarios.js';

export { PERSONALITIES };

// ---------------------------------------------------------------------------
// WATTEN KOMMENTATOR-TEMPLATES
//
// Template-Variablen:
//   {winnerTeam}   Gewinner-Team Spielernamen, z.B. "Sigi + Hannes"
//   {loserTeam}    Verlierer-Team Spielernamen
//   {points}       Punkte dieser Runde
//   {team1Name}    Team 1 Spielernamen
//   {team2Name}    Team 2 Spielernamen
//   {team1Score}   Team 1 Punktestand (nach dieser Runde)
//   {team2Score}   Team 2 Punktestand
//   {targetScore}  Zielpunkte des Spiels
//   {team1Bommel}  Bommerl-Zähler Team 1
//   {team2Bommel}  Bommerl-Zähler Team 2
//   {totalBommel}  Gesamtanzahl gespielte Bummel
//   {maxDeficit}   Maximaler Rückstand des Gewinners (Comeback)
//   {winnerTricks} Stiche des Gewinners (wenn eingetragen)
//   {loserTricks}  Stiche des Verlierers
//   {bommelLeader} Team mit mehr Bommerl
//   {bommelTrailer}Team mit weniger Bommerl
//   {bommelDiff}   Bommerl-Differenz
// ---------------------------------------------------------------------------

const COMMENTATOR_TEMPLATES = {

  // ══════════════════════════════════════════════════════════════════════════
  // DRAMATIC 🎙️
  // ══════════════════════════════════════════════════════════════════════════
  dramatic: {

    game_won_zu_null: [
      "ZU NULL!! {winnerTeam} gewinnt das Spiel ohne einen einzigen Gegenpunkt! {loserTeam} schaut in die Röhre — {team1Score}:{team2Score}! Bommerl-Stand: {team1Bommel}:{team2Bommel}! VERNICHTEND!",
      "BLANKER TRIUMPH! {winnerTeam} schenkt {loserTeam} keinen einzigen Punkt! Das Spiel geht ZU NULL! Was für eine Klatsche! Bommerl: {team1Bommel} zu {team2Bommel}!",
      "GNADENLOS! {loserTeam} steht mit null Punkten da — {winnerTeam} triumphiert absolut! Endstand {team1Score}:{team2Score}! Bommerl Nummer {totalBommel} des Abends!",
    ],

    game_won_comeback: [
      "DAS COMEBACK DES JAHRHUNDERTS! {winnerTeam} lag {maxDeficit} Punkte hinten — und holt sich trotzdem das Spiel! Was für eine Nervenstärke! Bommerl-Stand: {team1Bommel}:{team2Bommel}!",
      "UNGLAUBLICH! {winnerTeam} war {maxDeficit} Punkte zurück! Man dachte alles wäre verloren — aber NEIN! Das Spiel geht an {winnerTeam}! Bommerl: {team1Bommel} zu {team2Bommel}!",
      "WIE AUS DEM NICHTS! Bei einem Rückstand von {maxDeficit} Punkten dreht {winnerTeam} das Spiel! {loserTeam} kann es kaum fassen! Bommerl jetzt {team1Bommel} zu {team2Bommel}!",
    ],

    game_won_gespannt_duel: [
      "DAS GESPANNT-DUELL IST ENTSCHIEDEN! Beide Teams standen kurz vor dem Ziel — {winnerTeam} macht den Sack zu! Endstand {team1Score}:{team2Score}! Bommerl {team1Bommel}:{team2Bommel}!",
      "DAS ZITTERN HAT EIN ENDE! Beide Teams waren gespannt — {winnerTeam} holt sich den letzten Punkt! Was für ein Herzschlag-Finale! Bommerl-Stand: {team1Bommel} zu {team2Bommel}!",
      "NERVENKRIEG IM GESPANNT-MODUS! Wer holt das letzte 🧱? {winnerTeam}! {loserTeam} verliert das Duell der gespannten Teams! Bommerl: {team1Bommel}:{team2Bommel}!",
    ],

    game_won_dominant: [
      "VOLLSTÄNDIGE DOMINANZ! {winnerTeam} gewinnt das Spiel — {loserTeam} kam nie in Gespannt-Gefahr! Endstand {team1Score}:{team2Score}! Bommerl-Stand: {team1Bommel}:{team2Bommel}!",
      "KEINE CHANCE! {loserTeam} hatte nie Gespannt — {winnerTeam} dominiert nach Belieben! Endstand {team1Score}:{team2Score}! Bommerl: {team1Bommel} zu {team2Bommel}!",
      "SOUVERÄNER SIEG! {winnerTeam} lässt {loserTeam} nie gespannt werden! Das Spiel endet {team1Score}:{team2Score}! Bommerl-Zähler: {team1Bommel}:{team2Bommel}!",
    ],

    bommerl_first: [
      "ERSTES BLUT! Das erste Spiel dieses Abends ist entschieden! {winnerTeam} jubelt, {loserTeam} kassiert den ersten Bommerl! Ab jetzt wird's ernst!",
      "DAS ERÖFFNUNGSSPIEL IST ENTSCHIEDEN! {winnerTeam} macht den Auftakt! {loserTeam} trägt den ersten Bommerl davon. Der Abend hat gerade erst begonnen!",
      "SPIEL EINS GEHT AN {winnerTeam}! {loserTeam} sammelt den ersten Bommerl des Abends! Wer wird am Ende die Nase vorn haben?",
    ],

    bommerl_lead: [
      "BOMMERL-FÜHRUNG! {bommelLeader} hat jetzt {bommelDiff} Bommerl mehr! Stand: {team1Bommel}:{team2Bommel}! Der Druck auf {bommelTrailer} steigt gewaltig!",
      "DER VORSPRUNG WÄCHST! {bommelLeader} mit {team1Bommel}:{team2Bommel} im Bommerl-Stand! {bommelTrailer} muss jetzt liefern — oder der Abend ist verloren!",
      "EMPFINDLICHE SCHIEFLAGE! {bommelLeader} führt {team1Bommel}:{team2Bommel} bei den Bommerln! Kann {bommelTrailer} den Rückstand noch aufholen?",
    ],

    bommerl_even: [
      "AUSGEGLICHEN! Nach diesem Spiel steht es {team1Bommel}:{team2Bommel} bei den Bommerln! Beide Teams gleichauf — alles ist wieder offen!",
      "GLEICHSTAND! {team1Bommel} zu {team2Bommel} — keiner hat die Nase vorn! Was für ein spannender Abend! Der nächste Bommerl entscheidet alles!",
      "LEVEL! Die Bommerl stehen {team1Bommel}:{team2Bommel}! Wer bricht als Nächstes aus? Der Abend ist noch lange nicht vorbei!",
    ],

    maschine: [
      "DIE MASCHINE LÄUFT! {winnerTeam} holt sich alle drei kritischen Karten und räumt komplett ab! +{points} Punkte! Stand: {team1Score}:{team2Score}!",
      "MASCHINE! {winnerTeam} hat alle drei kritischen Karten in der Hand — das ist perfektes Watten! +{points} Punkte! Stand {team1Score} zu {team2Score}!",
      "WAS FÜR EIN BLATT! {winnerTeam} fährt die Maschine — alle kritischen Karten gewonnen! +{points} Punkte! Spielstand: {team1Score}:{team2Score}!",
    ],

    gegangen: [
      "AUFGEGEBEN! {loserTeam} geht — +{points} Punkte für {winnerTeam}! Manchmal ist Zurückziehen die klügste Wahl. Stand: {team1Score}:{team2Score}!",
      "STRATEGISCHER RÜCKZUG! {loserTeam} ist gegangen — {winnerTeam} nimmt die {points} Punkte dankend an! Stand {team1Score} zu {team2Score}!",
      "ER IST GEGANGEN! {loserTeam} gibt sich geschlagen — {winnerTeam} freut sich über +{points} Punkte! Spielstand: {team1Score}:{team2Score}!",
    ],

    spannt_geht: [
      "GESPANNT GEHT! Das gespannte Team nimmt lieber die sicheren 2 Punkte — {winnerTeam} kassiert! Stand: {team1Score}:{team2Score}!",
      "KLUGE ENTSCHEIDUNG oder Angst? Das gespannte Team sagt 'Spannt geht' — {winnerTeam} nimmt 2 Punkte! Stand {team1Score}:{team2Score}!",
      "DAS RISIKO WIRD NICHT EINGEGANGEN! Im Gespannt-Modus entscheidet sich das Team für die sicheren 2 Punkte — {winnerTeam} freut sich! Stand: {team1Score}:{team2Score}!",
    ],

    gespannt_round: [
      "GESPANNT-MODUS! Jede Runde zählt jetzt 3 Punkte — da schwitzt man! {winnerTeam} holt sich die 3 Punkte! Stand: {team1Score}:{team2Score} — Ziel: {targetScore}!",
      "DAS ZIEL IST IN SICHT! Im Gespannt-Modus gewinnt {winnerTeam} +3! Spannung pur! Stand {team1Score} zu {team2Score} — noch {targetScore} im Fokus!",
      "ALLE AUGEN AUF DAS ZIEL! {winnerTeam} macht +3 Punkte im Gespannt! Wann fällt die Entscheidung? Stand: {team1Score}:{team2Score}!",
    ],

    round_5_points: [
      "MAXIMUM! {winnerTeam} holt sich 5 PUNKTE aus dieser Runde! Das Höchste was möglich ist! Stand: {team1Score}:{team2Score}!",
      "FÜNF PUNKTE! Das ist das Maximum! {winnerTeam} räumt komplett ab! Stand jetzt {team1Score} zu {team2Score}!",
      "ALLES ODER NICHTS — UND ALLES! {winnerTeam} macht 5 Punkte in einer Runde! Maximaler Schaden für {loserTeam}! Stand: {team1Score}:{team2Score}!",
    ],

    stiche_dominant: [
      "VOLLE KONTROLLE! {winnerTeam} holt {winnerTricks} von 5 möglichen Stichen — das ist Überlegenheit pur! +{points} Punkte! Stand: {team1Score}:{team2Score}!",
      "STICH-DOMINANZ! {winnerTricks} zu {loserTricks} Stiche — {winnerTeam} lässt nichts übrig! +{points} Punkte! Stand {team1Score}:{team2Score}!",
      "{winnerTricks} STICHE für {winnerTeam}! Fast alles weggeräumt — {loserTeam} hatte kaum eine Chance! +{points} Punkte. Stand: {team1Score}:{team2Score}!",
    ],

    stiche_close: [
      "KNAPPER KAMPF UM DIE STICHE! {winnerTricks} zu {loserTricks} — eng umkämpft, aber {winnerTeam} hat die Nase vorn! +{points} Punkte. Stand: {team1Score}:{team2Score}!",
      "GLEICHWERTIGE RUNDE! Stiche {winnerTricks}:{loserTricks} — {winnerTeam} setzt sich knapp durch! +{points} Punkte! Stand {team1Score} zu {team2Score}!",
      "KEIN GESCHENK HEUTE! {winnerTeam} erkämpft sich {winnerTricks} gegen {loserTricks} Stiche! +{points} Punkte. Stand: {team1Score}:{team2Score}!",
    ],

    close_game: [
      "ES BRENNT! Stand {team1Score}:{team2Score} — diese Partie könnte noch zu jeder Seite kippen! Was für ein Spiel!",
      "KNAPPER GEHT'S KAUM! {team1Score} zu {team2Score} — {winnerTeam} zieht kurz davon, aber {loserTeam} ist noch dran! Kein Aufatmen hier!",
      "HOCHSPANNUNG! {team1Score}:{team2Score} — die Luft ist zum Schneiden! Jede Runde könnte das Spiel entscheiden!",
    ],

    dominant_lead: [
      "KLARE VERHÄLTNISSE! {team1Score}:{team2Score} — {winnerTeam} läuft davon! Kann {loserTeam} das noch drehen?",
      "DOMINANZ! Der Spielstand {team1Score}:{team2Score} spricht eine klare Sprache — {winnerTeam} hat das Heft in der Hand!",
      "HOHE SEE für {loserTeam}! {team1Score} zu {team2Score} — {winnerTeam} ist klar im Vorteil! Noch ist nicht alles verloren — aber es wird schwer!",
    ],

    mixed: [
      "{winnerTeam} holt sich +{points} Punkte. Stand: {team1Score}:{team2Score}. Das Spiel läuft!",
      "Runde an {winnerTeam} — +{points} Punkte! Stand {team1Score}:{team2Score}. Weiter geht's!",
      "+{points} Punkte für {winnerTeam}! Spielstand: {team1Score} zu {team2Score}. Nichts Besonderes — aber es zählt!",
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TAGESSCHAU 📺
  // ══════════════════════════════════════════════════════════════════════════
  tagesschau: {

    game_won_zu_null: [
      "{winnerTeam} gewinnt das Spiel. {loserTeam} verbleibt bei null Punkten. Endstand: {team1Score} zu {team2Score}. Bommerl-Stand: {team1Bommel} zu {team2Bommel}.",
      "Das Spiel endet mit {team1Score}:{team2Score}. {loserTeam} erzielte keinen einzigen Punkt. Bommerl-Stand beträgt nun {team1Bommel} zu {team2Bommel}.",
      "Es ist festzuhalten: {winnerTeam} gewinnt das Spiel zu null. {loserTeam} ohne Punktgewinn. Neuer Bommerl-Stand: {team1Bommel}:{team2Bommel}.",
    ],

    game_won_comeback: [
      "Trotz eines zwischenzeitlichen Rückstands von {maxDeficit} Punkten gewinnt {winnerTeam} das Spiel. Endstand {team1Score}:{team2Score}. Bommerl-Stand: {team1Bommel}:{team2Bommel}.",
      "{winnerTeam} lag im Spielverlauf {maxDeficit} Punkte zurück. Dennoch setzt sich {winnerTeam} am Ende durch. Bommerl: {team1Bommel} zu {team2Bommel}.",
      "Die Entwicklung des Spiels war bemerkenswert. {winnerTeam} überwindet einen Rückstand von {maxDeficit} Punkten. Endstand: {team1Score}:{team2Score}. Stand: {team1Bommel}:{team2Bommel}.",
    ],

    game_won_gespannt_duel: [
      "Beide Teams befanden sich im Gespannt-Zustand. {winnerTeam} gewinnt das Spiel. Endstand: {team1Score}:{team2Score}. Bommerl-Stand: {team1Bommel}:{team2Bommel}.",
      "Das Gespannt-Duell ist entschieden. {winnerTeam} setzt sich durch. Stand: {team1Score}:{team2Score}. Bommerl: {team1Bommel} zu {team2Bommel}.",
      "In der Endphase befanden sich beide Teams in Gespannt-Position. Den Sieg sichert sich {winnerTeam}. Bommerl-Stand aktuell: {team1Bommel}:{team2Bommel}.",
    ],

    game_won_dominant: [
      "{winnerTeam} gewinnt das Spiel. {loserTeam} erreichte den Gespannt-Bereich nicht. Endstand: {team1Score}:{team2Score}. Bommerl-Stand: {team1Bommel}:{team2Bommel}.",
      "Das Spiel endet mit {team1Score} zu {team2Score}. {loserTeam} blieb stets unterhalb des Gespannt-Schwellenwertes. Bommerl: {team1Bommel}:{team2Bommel}.",
      "{winnerTeam} siegt. {loserTeam} wurde zu keinem Zeitpunkt gespannt. Aktueller Bommerl-Stand: {team1Bommel} zu {team2Bommel}.",
    ],

    bommerl_first: [
      "Das erste Spiel des Abends ist beendet. {winnerTeam} gewinnt, {loserTeam} erhält den ersten Bommerl. Stand: {team1Bommel}:{team2Bommel}.",
      "{winnerTeam} gewinnt das Eröffnungsspiel. {loserTeam} verbucht den ersten Bommerl des Abends. Bommerl-Stand: {team1Bommel}:{team2Bommel}.",
      "Spiel eins ist abgeschlossen. Ergebnis: {winnerTeam} siegt. {loserTeam} trägt den ersten Bommerl. Aktueller Stand: {team1Bommel}:{team2Bommel}.",
    ],

    bommerl_lead: [
      "{bommelLeader} führt im Bommerl-Stand mit {team1Bommel}:{team2Bommel}. {bommelTrailer} liegt {bommelDiff} Bommerl zurück.",
      "Der Bommerl-Stand beträgt {team1Bommel} zu {team2Bommel}. {bommelLeader} baut den Vorsprung aus.",
      "Stand der Bommerl: {team1Bommel}:{team2Bommel}. {bommelLeader} hat {bommelDiff} Bommerl Vorsprung gegenüber {bommelTrailer}.",
    ],

    bommerl_even: [
      "Der Bommerl-Stand ist ausgeglichen: {team1Bommel} zu {team2Bommel}. Beide Teams stehen gleichauf.",
      "Nach diesem Spiel beträgt der Bommerl-Stand {team1Bommel}:{team2Bommel}. Gleichstand hergestellt.",
      "Es ist Parität erreicht. Bommerl-Stand: {team1Bommel} zu {team2Bommel}. Beide Mannschaften auf Augenhöhe.",
    ],

    maschine: [
      "{winnerTeam} erspielt alle drei kritischen Karten — eine sogenannte Maschine. +{points} Punkte. Spielstand: {team1Score}:{team2Score}.",
      "Maschine für {winnerTeam}: alle kritischen Karten gewonnen. Ergebnis: +{points} Punkte. Stand {team1Score}:{team2Score}.",
      "Es ist eine Maschine zu verzeichnen. {winnerTeam} hält alle drei kritischen Karten. Punkte: +{points}. Stand: {team1Score}:{team2Score}.",
    ],

    gegangen: [
      "{loserTeam} geht. {winnerTeam} erhält +{points} Punkte. Spielstand: {team1Score}:{team2Score}.",
      "Rückzug durch {loserTeam}. {winnerTeam} verbucht +{points} Punkte. Stand: {team1Score} zu {team2Score}.",
      "{loserTeam} zieht sich zurück. Punkte an {winnerTeam}: +{points}. Aktueller Stand: {team1Score}:{team2Score}.",
    ],

    spannt_geht: [
      "Gespannt geht: Das gespannte Team entscheidet sich für die sichere Option. {winnerTeam} erhält 2 Punkte. Stand: {team1Score}:{team2Score}.",
      "Im Gespannt-Modus fällt die Entscheidung auf 'Geht'. {winnerTeam} +2 Punkte. Spielstand: {team1Score}:{team2Score}.",
      "Das gespannte Team wählt den sicheren Rückzug. {winnerTeam} nimmt die 2 Punkte. Stand: {team1Score}:{team2Score}.",
    ],

    gespannt_round: [
      "Gespannt-Modus: Jede Runde ist 3 Punkte wert. {winnerTeam} gewinnt diese Runde. Stand: {team1Score}:{team2Score}.",
      "Es gilt der Gespannt-Zustand. {winnerTeam} +3 Punkte. Spielstand: {team1Score} zu {team2Score}. Ziel: {targetScore}.",
      "Beide Teams befinden sich im Gespannt-Bereich. {winnerTeam} gewinnt und nähert sich dem Ziel. Stand: {team1Score}:{team2Score}.",
    ],

    round_5_points: [
      "{winnerTeam} gewinnt die Runde mit dem maximal möglichen Punktgewinn von 5 Punkten. Stand: {team1Score}:{team2Score}.",
      "Maximalpunktzahl erzielt: {winnerTeam} holt 5 Punkte. Spielstand: {team1Score} zu {team2Score}.",
      "5 Punkte — das Maximum — gehen an {winnerTeam}. Aktueller Stand: {team1Score}:{team2Score}.",
    ],

    stiche_dominant: [
      "{winnerTeam} gewinnt {winnerTricks} von 5 Stichen. {loserTeam} erzielt {loserTricks} Stiche. Punkte: +{points}. Stand: {team1Score}:{team2Score}.",
      "Stich-Verteilung: {winnerTricks} zu {loserTricks}. {winnerTeam} setzt sich durch. +{points} Punkte. Stand: {team1Score}:{team2Score}.",
      "{winnerTricks} Stiche für {winnerTeam}, {loserTricks} für {loserTeam}. Ergebnis: +{points} Punkte. Spielstand: {team1Score}:{team2Score}.",
    ],

    stiche_close: [
      "Stiche: {winnerTricks} zu {loserTricks}. {winnerTeam} gewinnt knapp. +{points} Punkte. Stand: {team1Score}:{team2Score}.",
      "Knappe Stich-Verteilung: {winnerTricks}:{loserTricks}. {winnerTeam} setzt sich durch. Stand: {team1Score}:{team2Score}.",
      "Die Stiche verteilen sich {winnerTricks} zu {loserTricks}. {winnerTeam} +{points} Punkte. Stand: {team1Score}:{team2Score}.",
    ],

    close_game: [
      "Der Spielstand beträgt {team1Score} zu {team2Score}. Die Differenz ist gering. Das Spiel bleibt offen.",
      "Aktueller Spielstand: {team1Score}:{team2Score}. Geringer Abstand zwischen den Teams.",
      "Stand: {team1Score} zu {team2Score}. Beide Teams liegen nah beieinander.",
    ],

    dominant_lead: [
      "Stand {team1Score}:{team2Score}. {winnerTeam} hat einen deutlichen Vorsprung aufgebaut.",
      "Aktueller Stand: {team1Score} zu {team2Score}. {winnerTeam} führt mit deutlichem Abstand.",
      "Spielstand: {team1Score}:{team2Score}. {loserTeam} liegt erheblich zurück.",
    ],

    mixed: [
      "{winnerTeam} gewinnt die Runde. +{points} Punkte. Stand: {team1Score}:{team2Score}.",
      "Runde an {winnerTeam}. +{points} Punkte. Spielstand: {team1Score}:{team2Score}.",
      "+{points} Punkte für {winnerTeam}. Stand: {team1Score} zu {team2Score}.",
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // BAVARIAN 🍺
  // ══════════════════════════════════════════════════════════════════════════
  bavarian: {

    game_won_zu_null: [
      "Jessas na! {winnerTeam} haut {loserTeam} auf null Punkte! Des nennt ma a saubere Oarbeit! Bommerl-Stand is jetzt {team1Bommel} zu {team2Bommel}!",
      "Des war nix für {loserTeam} — glatt zu null! {winnerTeam} lacht si eins! Bommerl: {team1Bommel}:{team2Bommel}. I mog des!",
      "Zu null! Mei, des war brutal! {loserTeam} hot kan einzigen Punkt griagt — {winnerTeam} triumphiert! Bommerl-Stand: {team1Bommel} zu {team2Bommel}, Leid'n!",
    ],

    game_won_comeback: [
      "Heast des! {winnerTeam} war {maxDeficit} Punkte hinten — und holt's no! Des is a Watten-Wunder! Bommerl: {team1Bommel}:{team2Bommel}!",
      "Jo mei, des gibt's doch ned! {maxDeficit} Punkte Rückstand — und {winnerTeam} dreht's um! Des muass ma erstmal verdauern! Bommerl: {team1Bommel} zu {team2Bommel}!",
      "So a Wahnsinn! {winnerTeam} war {maxDeficit} Punkte hintig und holt des Spiel no! {loserTeam} schaut blöd drein! Bommerl: {team1Bommel}:{team2Bommel}!",
    ],

    game_won_gespannt_duel: [
      "Des war's! Beide san gespannt gween — und {winnerTeam} macht's! Herzklopfa bis zuletzt! Bommerl-Stand: {team1Bommel}:{team2Bommel}!",
      "A Duell der gespannten Mannschaften! {winnerTeam} gewinnt — {loserTeam} is hinig! Bommerl: {team1Bommel} zu {team2Bommel}!",
      "Gespannt gegen gespannt — des Herz in da Hosn! {winnerTeam} nimmt's Spiel! Bommerl: {team1Bommel}:{team2Bommel}. Packend, sog i!",
    ],

    game_won_dominant: [
      "Da war nix los beim {loserTeam}! {winnerTeam} dominiert und {loserTeam} kommt ned amoi gespannt! {team1Score}:{team2Score} — a klare Sach! Bommerl: {team1Bommel}:{team2Bommel}.",
      "Najo, des war klar von Anfang! {loserTeam} net amoi gespannt — {winnerTeam} macht kurzen Prozess! Bommerl-Stand: {team1Bommel} zu {team2Bommel}.",
      "So schnell kann's gehen! {winnerTeam} lässt {loserTeam} gar ned ins Gespannt kommen! {team1Score}:{team2Score}. Bommerl: {team1Bommel}:{team2Bommel}!",
    ],

    bommerl_first: [
      "Des erscht Spiel is g'spielt! {winnerTeam} gewinnt, {loserTeam} kriagt den ersten Bommerl! Des geht erst los jetzt!",
      "Erster Bommerl des Abends! {loserTeam} hats erwischt! {winnerTeam} führt 1:0. Des Spiel hat grad erst angfangt!",
      "So! Ersten Spielstand ham ma! {winnerTeam} gewinnt, {loserTeam} kriagt den ersten Bommerl. Stand: {team1Bommel} zu {team2Bommel}!",
    ],

    bommerl_lead: [
      "Oj oj oj! {bommelLeader} hat jetzt {bommelDiff} Bommerl mehr! Stand: {team1Bommel}:{team2Bommel}! {bommelTrailer} muss aufpassen!",
      "Des schaut ned gut aus für {bommelTrailer}! {bommelLeader} führt {team1Bommel}:{team2Bommel}! I glab der Abend wird lang für die eine Seite!",
      "Bommerl-Führung für {bommelLeader}! {team1Bommel}:{team2Bommel} — {bommelDiff} Stück Vorsprung! {bommelTrailer} braucht jetzt a Wende!",
    ],

    bommerl_even: [
      "Wieder Gleichstand! {team1Bommel} zu {team2Bommel} Bommerl — kaner is vorn! Des Spiel is völlig offen!",
      "Ausgeglichen! {team1Bommel}:{team2Bommel} bei de Bommerl! I waaß no ned wers am End packts!",
      "Jo so schaut's aus! {team1Bommel} zu {team2Bommel} — Gleichstand bei de Bommerl! Des wird a langer Abend!",
    ],

    maschine: [
      "Da Maschine! {winnerTeam} holt alle drei kritischen Karten! Des nennt ma a perfekte Runde! +{points} Punkte! Stand: {team1Score}:{team2Score}!",
      "Heast, a Maschine! Des gibt's ka zweites Mal so schnell! {winnerTeam} macht alles richtig! +{points} Punkte, Stand {team1Score}:{team2Score}!",
      "Maschine, Leid'n! {winnerTeam} hat alle drei griegt — des is ned alltäglich! +{points} Punkte! Stand: {team1Score}:{team2Score}!",
    ],

    gegangen: [
      "Gegangen! {loserTeam} gibt auf — {winnerTeam} kriagt +{points} Punkte! Stand: {team1Score}:{team2Score}!",
      "Na ja, {loserTeam} is gegangen. Des war vielleicht g'scheit. {winnerTeam} nimmt die {points} Punkte! Stand {team1Score}:{team2Score}.",
      "{loserTeam} geht — nix dabei, manchmal is des klüger! +{points} für {winnerTeam}. Stand: {team1Score}:{team2Score}!",
    ],

    spannt_geht: [
      "Gespannt geht! Des gespannte Team nimmt die sicheren 2 Punkte — lieber ned riskieren! {winnerTeam} freut sich! Stand: {team1Score}:{team2Score}.",
      "2 Punkte nehmen statt riskieren — Gespannt geht! Nix falsch gmacht. {winnerTeam} kriagt's. Stand {team1Score}:{team2Score}.",
      "Des gespannte Team macht's g'scheit — Gespannt geht! {winnerTeam} nimmt die 2 Punkte. Stand: {team1Score}:{team2Score}.",
    ],

    gespannt_round: [
      "Gespannt! Jetzt zählt jede Runde 3 Punkte — da schwitzt ma! {winnerTeam} macht +3! Stand: {team1Score}:{team2Score}!",
      "Im Gespannt is des a ernste Sach! {winnerTeam} holt die 3 Punkte! Stand {team1Score} zu {team2Score}. Ziel: {targetScore}!",
      "Jetzt wird's spannend — im Gespannt! {winnerTeam} +3 Punkte! Stand: {team1Score}:{team2Score}. Gleich is's entschieden!",
    ],

    round_5_points: [
      "Fünf Punkte! Des Maximum! {winnerTeam} räumt richtig ab! Stand: {team1Score}:{team2Score}. Des war sauber!",
      "Fünfe! Mehr geht ned! {winnerTeam} holt das volle Programm! Stand {team1Score}:{team2Score}!",
      "Mei, fünf Punkte auf amal! {winnerTeam} macht des Maximum! {loserTeam} schaut nach Hause! Stand: {team1Score}:{team2Score}!",
    ],

    stiche_dominant: [
      "{winnerTeam} holt {winnerTricks} von 5 Stichen — des is Dominanz! +{points} Punkte! Stand: {team1Score}:{team2Score}!",
      "Heast, {winnerTricks} zu {loserTricks} Stich! {winnerTeam} lässt nix übrig! +{points} Punkte. Stand {team1Score}:{team2Score}.",
      "{winnerTricks} Stiche für {winnerTeam}! Des war a starke Runde! +{points} Punkte. Stand: {team1Score}:{team2Score}!",
    ],

    stiche_close: [
      "Eng zug'angen! {winnerTricks} zu {loserTricks} Stiche — {winnerTeam} holt's knapp! +{points} Punkte. Stand: {team1Score}:{team2Score}.",
      "Knappes Ding bei die Stiche — {winnerTricks}:{loserTricks}! {winnerTeam} kriagt +{points}. Stand {team1Score}:{team2Score}.",
      "Beinahe gleichauf bei de Stiche — {winnerTricks} zu {loserTricks}! {winnerTeam} macht's! +{points} Punkte. Stand: {team1Score}:{team2Score}!",
    ],

    close_game: [
      "Mei, des is eng! {team1Score} zu {team2Score} — des Spiel is völlig offen! Jede Runde zählt!",
      "Heast, wie eng des is! {team1Score}:{team2Score} — da muss ma aufpassen! No nix entschieden!",
      "Knapp, knapp, knapp! Stand {team1Score} zu {team2Score} — des wird spannend bis zum Schluss!",
    ],

    dominant_lead: [
      "{team1Score} zu {team2Score} — {winnerTeam} rennt davon! Kann {loserTeam} des no drehen? I zweifel!",
      "Naja, {loserTeam} steckt im Schlamassl! Stand {team1Score}:{team2Score} — da braucht's a Wende!",
      "{winnerTeam} führt mit {team1Score}:{team2Score} — des schaut ned gut aus für {loserTeam}. Aufgeben gilt's ned!",
    ],

    mixed: [
      "{winnerTeam} macht +{points} Punkte. Stand: {team1Score}:{team2Score}. Weiter geht's!",
      "So, +{points} für {winnerTeam}. Stand {team1Score}:{team2Score}. Des Spiel läuft!",
      "{points} Punkte für {winnerTeam}! Stand: {team1Score}:{team2Score}. Schau ma mal!",
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // FAN 🤩
  // ══════════════════════════════════════════════════════════════════════════
  fan: {

    game_won_zu_null: [
      "OH MEIN GOTT ZU NULLLLL!!! {winnerTeam} vernichtet {loserTeam} komplett! Kein EINZIGER Punkt für {loserTeam}!!! Bommerl-Stand: {team1Bommel}:{team2Bommel} — KRASS!!",
      "ICH GLAUBS NICHT!! Zu null!! {loserTeam} hat nix geholt — NULLKOMMANIX!! {winnerTeam} ist der WAHNSINN! Bommerl: {team1Bommel}:{team2Bommel}!!",
      "ZU NULLLL!!! Das ist das BESTE was passieren kann!! {winnerTeam} macht {loserTeam} platt! Bommerl: {team1Bommel} zu {team2Bommel} — ich dreh durch!!",
    ],

    game_won_comeback: [
      "OH MEIN GOTT COMEBACKKK!!! {winnerTeam} lag {maxDeficit} PUNKTE hinten und GEWINNT TROTZDEM!! Ich dachte schon alles ist verloren!! Bommerl: {team1Bommel}:{team2Bommel}!!",
      "ICH KANN'S NICHT GLAUBEN!! {maxDeficit} Punkte Rückstand und sie GEWINNEN!! {winnerTeam} ich liebe euch!! Stand: {team1Bommel} zu {team2Bommel}!!",
      "DAS COMEBACK!! {winnerTeam} war {maxDeficit} Punkte hinten und dreht das KOMPLETT UM!! Absoluter Wahnsinn!! Bommerl: {team1Bommel}:{team2Bommel}!!",
    ],

    game_won_gespannt_duel: [
      "BEIDE GESPANNT UND DANN DAS!! {winnerTeam} gewinnt das Nervenduell!! {loserTeam} so nah dran — aber NEIN!! Bommerl: {team1Bommel}:{team2Bommel}!!",
      "HERZRASEN!!! Beide Teams gespannt — und {winnerTeam} macht den Punkt!! Unfassbar!! Stand: {team1Bommel}:{team2Bommel}!!",
      "DAS GESPANNT-FINALE!! {winnerTeam} ist stärker!! {loserTeam} so knapp gescheitert!! Bommerl: {team1Bommel} zu {team2Bommel} — haaaach!!",
    ],

    game_won_dominant: [
      "TOTAL DOMINIERT!! {loserTeam} kam nie ins Gespannt — {winnerTeam} macht das locker weg!! {team1Score}:{team2Score}! Bommerl: {team1Bommel}:{team2Bommel}!!",
      "{winnerTeam} macht {loserTeam} platt — nicht mal gespannt!! Das war voll die einseitige Sache!! Bommerl: {team1Bommel} zu {team2Bommel}!! Crazy!!",
      "KEINE CHANCE für {loserTeam}! {winnerTeam} gewinnt ohne dass der Gegner ins Gespannt kommt!! {team1Score}:{team2Score}! Bommerl: {team1Bommel}:{team2Bommel}!!",
    ],

    bommerl_first: [
      "ERSTES SPIEL VORBEI!!! {winnerTeam} gewinnt!! {loserTeam} kriegt den ersten Bommerl des Abends!! Und jetzt geht's RICHTIG los!!",
      "BOOM erster Bommerl!! {loserTeam} erwischt's zuerst!! {winnerTeam} jubelt!! Stand: {team1Bommel}:{team2Bommel} — los gehts!!",
      "Das Eröffnungsspiel ist entschieden!! {winnerTeam} rockt, {loserTeam} sammelt den ersten Bommerl! Ich bin so aufgeregt!!",
    ],

    bommerl_lead: [
      "OHHHH {bommelLeader} führt bei den Bommerln {team1Bommel}:{team2Bommel}!! {bommelDiff} VORNE!! {bommelTrailer} muss jetzt richtig liefern!!",
      "BOMMERL-LEAD für {bommelLeader}!! {team1Bommel} zu {team2Bommel}!! Ich glaub {bommelTrailer} schwitzt schon!!",
      "{bommelLeader} läuft davon!! {team1Bommel}:{team2Bommel} Bommerl — {bommelDiff} Stück Vorsprung!! {bommelTrailer} aufwachen!!",
    ],

    bommerl_even: [
      "GLEICHSTAND!! {team1Bommel} zu {team2Bommel} Bommerl — alles offen wieder!! Das ist SO spannend!!",
      "WIEDER LEVEL!! {team1Bommel}:{team2Bommel} — kein Team hat die Nase vorn!! Ich liebe dieses Spiel!!",
      "AUSGEGLICHEN!! {team1Bommel} zu {team2Bommel} Bommerl!! Beide gleich — das entscheidet sich noch!!",
    ],

    maschine: [
      "MASCHIIIINE!!!! {winnerTeam} holt ALLE DREI KRITISCHEN!! Das ist LEGENDARY!! +{points} Punkte!! Stand: {team1Score}:{team2Score}!!",
      "OH WOW MASCHINE!! {winnerTeam} macht's perfekt!! Alle drei Karten — WAHNSINN!! +{points}!! Stand {team1Score}:{team2Score}!!",
      "ICH DREH DURCH — MASCHINE!! {winnerTeam} alles richtig gemacht!! +{points} Punkte! Stand: {team1Score}:{team2Score}!! YESSSS!!",
    ],

    gegangen: [
      "Gegangen!! {loserTeam} zieht sich zurück!! {winnerTeam} kriegt +{points}!! Stand: {team1Score}:{team2Score}. Manchmal ist das halt klüger!",
      "Okay {loserTeam} geht!! Macht Sinn oder nicht — {winnerTeam} nimmt {points} Punkte mit!! Stand {team1Score}:{team2Score}!",
      "Oh {loserTeam} ist gegangen!! {winnerTeam} dankend angenommen — +{points} Punkte!! Stand: {team1Score}:{team2Score}!",
    ],

    spannt_geht: [
      "GESPANNT GEHT!! Lieber sicher als riskant!! {winnerTeam} kriegt die 2 Punkte!! Stand: {team1Score}:{team2Score}!",
      "Okay okay Gespannt geht — 2 sichere Punkte für {winnerTeam}!! Das gespannte Team wills nicht riskieren!! Stand {team1Score}:{team2Score}!",
      "Gespannt geht!! Das macht Sinn — {winnerTeam} +2 Punkte!! Stand: {team1Score}:{team2Score}. Strategisch!!",
    ],

    gespannt_round: [
      "GESPANNT GESPANNT GESPANNT!! Alles 3 Punkte jetzt!! {winnerTeam} macht +3!! Stand: {team1Score}:{team2Score}!! Es wird eng!!",
      "AHHH Gespannt-Modus!! Jede Runde 3 Punkte!! {winnerTeam} +3!! Stand {team1Score}:{team2Score} — Ziel {targetScore}!!",
      "Gespannt!! Das Herz schlägt schneller!! {winnerTeam} holt +3 Punkte!! Stand: {team1Score}:{team2Score}!! So aufregend!!",
    ],

    round_5_points: [
      "FÜNFFÜNFFÜNF!! Das Maximum!! {winnerTeam} holt sich ALLE FÜNF!! Stand: {team1Score}:{team2Score}!! KRASS!!",
      "OH MY FÜNF PUNKTE!! {winnerTeam} macht das VOLLE PROGRAMM!! Stand {team1Score}:{team2Score}!! Ich flippe aus!!",
      "5 PUNKTE AUF EINMAL!! Mehr geht nicht!! {winnerTeam} alles abgeräumt!! Stand: {team1Score}:{team2Score}!! LEGEND!!",
    ],

    stiche_dominant: [
      "{winnerTricks} zu {loserTricks} Stiche!!! {winnerTeam} dominiert KOMPLETT!! +{points} Punkte!! Stand: {team1Score}:{team2Score}!!",
      "OH WOW {winnerTricks} Stiche für {winnerTeam}!! {loserTeam} kriegt nur {loserTricks}!! +{points}!! Stand {team1Score}:{team2Score}!!",
      "DOMINANT!! {winnerTricks} zu {loserTricks} Stiche!! {winnerTeam} lässt nix übrig!! +{points} Punkte. Stand: {team1Score}:{team2Score}!!",
    ],

    stiche_close: [
      "{winnerTricks} zu {loserTricks} Stiche — so knapp!! {winnerTeam} setzt sich durch!! +{points} Punkte. Stand: {team1Score}:{team2Score}!",
      "Knappes Stiche-Ding!! {winnerTricks}:{loserTricks}!! {winnerTeam} macht's!! +{points} Punkte. Stand {team1Score}:{team2Score}!",
      "Hauchdunn!! {winnerTricks} zu {loserTricks} Stiche — {winnerTeam} gewinnt knapp!! +{points}. Stand: {team1Score}:{team2Score}!",
    ],

    close_game: [
      "OH MEIN GOTT wie eng!! {team1Score} zu {team2Score}!! Das könnte noch jeder gewinnen!! Ich halte das kaum aus!!",
      "SO ENG!! {team1Score}:{team2Score}!! Das ist mega spannend!! Jede einzelne Runde könnte das entscheiden!!",
      "WAHNSINNIGE SPANNUNG!! {team1Score} zu {team2Score}!! Alles offen!! So aufregend!!",
    ],

    dominant_lead: [
      "{team1Score} zu {team2Score}!! {winnerTeam} läuft komplett davon!! Kann {loserTeam} das noch drehen?? Ich zweifle!!",
      "OHHH {loserTeam} in Schwierigkeiten!! {team1Score}:{team2Score}!! {winnerTeam} so weit vorne!! Krass!!",
      "Starke Führung für {winnerTeam}!! {team1Score} zu {team2Score}!! {loserTeam} braucht jetzt Wunder-Watten!!",
    ],

    mixed: [
      "+{points} für {winnerTeam}!! Stand: {team1Score}:{team2Score}. Weiter gehts!!",
      "{winnerTeam} holt sich +{points}!! Stand {team1Score}:{team2Score}. Nächste Runde!!",
      "Okay, +{points} für {winnerTeam}. Stand: {team1Score}:{team2Score}. Das Spiel läuft weiter!!",
    ],
  },
};

// ---------------------------------------------------------------------------
// Mapping: Watten-Szenario → Spieler-Reaktions-Szenarien (aus shared)
// ---------------------------------------------------------------------------
const WINNER_REACTION_MAP = {
  game_won_zu_null:       'dramatic_win',
  game_won_comeback:      'comeback',
  game_won_gespannt_duel: 'close_win',
  game_won_dominant:      'routine_win',
  bommerl_first:          'routine_win',
  bommerl_lead:           'leader_extends',
  bommerl_even:           'close_game',
  maschine:               'single_hero',
  gegangen:               'routine_win',
  spannt_geht:            'close_win',
  gespannt_round:         'close_game',
  round_5_points:         'single_hero',
  stiche_dominant:        'single_hero',
  stiche_close:           'close_game',
  close_game:             'close_game',
  dominant_lead:          'leader_extends',
  mixed:                  'mixed',
};

const LOSER_REACTION_MAP = {
  game_won_zu_null:       'dramatic_loss',
  game_won_comeback:      'single_disaster',
  game_won_gespannt_duel: 'close_loss',
  game_won_dominant:      'routine_loss',
  bommerl_first:          'routine_loss',
  bommerl_lead:           'comeback',
  bommerl_even:           'close_game',
  maschine:               'single_disaster',
  gegangen:               'routine_loss',
  spannt_geht:            'close_loss',
  gespannt_round:         'close_game',
  round_5_points:         'single_disaster',
  stiche_dominant:        null,
  stiche_close:           'close_game',
  close_game:             'close_game',
  dominant_lead:          'comeback',
  mixed:                  null,
};

/**
 * Reaktions-Wahrscheinlichkeit basierend auf Szenario.
 */
function reactionChance(scenario) {
  const highChance = ['game_won_zu_null', 'game_won_comeback', 'maschine', 'round_5_points'];
  const midChance  = ['game_won_gespannt_duel', 'game_won_dominant', 'bommerl_lead', 'bommerl_first', 'gegangen'];
  if (highChance.includes(scenario)) return 0.85;
  if (midChance.includes(scenario))  return 0.65;
  return 0.40;
}

/**
 * Sucht eine Spieler-Reaktion aus dem PLAYER_REACTIONS Pool.
 */
function getPlayerReaction(playerName, scenarioKey, regMap) {
  if (!playerName || !scenarioKey) return null;
  const reg      = regMap[playerName];
  const charType = reg?.character_type ?? 'optimist';
  const pool =
    PLAYER_REACTIONS[charType]?.[scenarioKey]
    ?? PLAYER_REACTIONS['optimist']?.[scenarioKey]
    ?? PLAYER_REACTIONS[charType]?.['mixed']
    ?? PLAYER_REACTIONS['optimist']?.['mixed'];
  if (!pool || pool.length === 0) return null;
  return {
    avatar: reg?.avatar ?? '🃏',
    name:   playerName,
    label:  PLAYER_PERSONALITIES[charType]?.label ?? '',
    text:   pickRandom(pool),
  };
}

// ---------------------------------------------------------------------------
// HAUPTFUNKTION
// ---------------------------------------------------------------------------
/**
 * Baut das Kommentator-Overlay für eine Watten-Runde.
 *
 * @param {object} data - Runden- und Spielstandsdaten (aus WattenSession)
 * @param {Array}  regPlayers - Registrierte Spieler [{name, avatar, character_type, voice}]
 * @param {string} personality - 'dramatic'|'tagesschau'|'bavarian'|'fan'
 * @returns {{ segments: Array, spokenText: string }}
 */
export function buildWattenCommentary(data, regPlayers = [], personality = 'dramatic') {
  try {
    const pers      = PERSONALITIES[personality] ?? PERSONALITIES.dramatic;
    const scenario  = analyzeWattenScenario(data);
    const vars      = buildTemplateVars(data);
    const templates = COMMENTATOR_TEMPLATES[personality]?.[scenario]
                   ?? COMMENTATOR_TEMPLATES.dramatic[scenario]
                   ?? COMMENTATOR_TEMPLATES.dramatic.mixed;

    const regMap = {};
    regPlayers.forEach(p => { regMap[p.name] = p; });

    const segments = [
      {
        avatar: pers.icon,
        name:   'Kommentator',
        label:  pers.label,
        text:   fill(pickRandom(templates), vars),
      },
    ];

    const chance        = reactionChance(scenario);
    const winnerTeamArr = data.round.winning_team === 'team1'
      ? (data.team1_players || [])
      : (data.team2_players || []);
    const loserTeamArr  = data.round.winning_team === 'team1'
      ? (data.team2_players || [])
      : (data.team1_players || []);

    // Sieger-Reaktion
    if (Math.random() < chance && winnerTeamArr.length > 0) {
      const player   = pickRandom(winnerTeamArr);
      const reaction = getPlayerReaction(player, WINNER_REACTION_MAP[scenario], regMap);
      if (reaction) segments.push(reaction);
    }

    // Verlierer-Reaktion (60% der Sieger-Chance, nur wenn Loser-Mapping existiert)
    const loserScenario = LOSER_REACTION_MAP[scenario];
    if (loserScenario && Math.random() < chance * 0.6 && loserTeamArr.length > 0) {
      const player   = pickRandom(loserTeamArr);
      const reaction = getPlayerReaction(player, loserScenario, regMap);
      if (reaction) segments.push(reaction);
    }

    const spokenText = segments.map(s => s.text).join(' — ');
    return { segments, spokenText };

  } catch (error) {
    return {
      segments: [{
        avatar: '⚠️',
        name:   'System',
        label:  'Fehler',
        text:   'Fehler beim Erstellen des Kommentars: ' + error.message,
      }],
      spokenText: 'Fehler',
    };
  }
}
