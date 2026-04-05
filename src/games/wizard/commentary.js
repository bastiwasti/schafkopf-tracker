import { PERSONALITIES, pickRandom, fill } from '../shared/commentary.js';
import { PLAYER_PERSONALITIES, PLAYER_REACTIONS } from '../shared/playerPersonalities.js';
import { analyzeRoundScenario } from './roundScenarios.js';

export { PERSONALITIES };

// ---------------------------------------------------------------------------
// COMMENTATOR TEMPLATES
//
// Each template uses TWO narrative layers:
//   Layer 1 — what happened this round (prediction / tricks / round score)
//   Layer 2 — what it means for the total standing
//
// Variables:
//   {roundNum}        current round number
//   {totalRounds}     total rounds in this game
//   {correctCount}    players who predicted correctly
//   {playerCount}     total players
//   {bravePlayer}     player who made the brave prediction
//   {bravePredict}    their prediction number
//   {topRoundPlayer}  best scorer this round
//   {topRoundScore}   their round points
//   {leader}          total score leader after this round
//   {leaderTotal}     leader's total points
//   {leaderGap}       gap between 1st and 2nd in total
//   {overtaker}       player who took over the lead
//   {overtaken}       player who was overtaken
//   {second}          player in 2nd place (total)
//   {secondTotal}     2nd place total points
// ---------------------------------------------------------------------------

const COMMENTATOR_TEMPLATES = {
  dramatic: {
    final_round: [
      "DAS FINALE! Runde {roundNum} von {roundNum} — die LETZTE CHANCE! {topRoundPlayer} macht {topRoundScore} Punkte in dieser Runde! Am Ende steht {leader} an der Spitze mit {leaderTotal} Punkten. Was für ein Spiel!",
      "ES IST VORBEI! Die letzte Runde ist gespielt! {topRoundPlayer} brilliert mit {topRoundScore} Punkten! Im Gesamtstand gewinnt {leader} mit {leaderTotal} Punkten — mit {leaderGap} Punkten Vorsprung auf {second}!",
      "RUNDE {roundNum} — DAS ENDE! {correctCount} von {playerCount} lagen in der letzten Runde richtig! {leader} triumphiert mit {leaderTotal} Gesamtpunkten! Legendär!",
    ],
    brave_success: [
      "WAHNSINN! {bravePlayer} hat {bravePredict} Stiche angesagt — und EXAKT {bravePredict} gemacht! Das ist Mut, der belohnt wird! Im Gesamtstand führt {leader} jetzt mit {leaderTotal} Punkten, {leaderGap} vor {second}!",
      "UNGLAUBLICH! {bravePlayer} sagt {bravePredict} Stiche an in Runde {roundNum} — und trifft HAARGENAU! Der Gesamtstand: {leader} vorne mit {leaderTotal} Punkten. Das Risiko hat sich gelohnt!",
      "DAS IST KALIBER! {bravePlayer} mit der mutigen Ansage von {bravePredict} Stichen — und alles richtig gemacht! {leader} führt die Gesamtwertung mit {leaderTotal} Punkten an!",
    ],
    brave_failure: [
      "OH NEIN! {bravePlayer} hat {bravePredict} Stiche angesagt — und DANEBENGEGRIFFEN! Zu risikofreudig in Runde {roundNum}! Im Gesamtstand liegt {leader} weiterhin vorne mit {leaderTotal} Punkten, Abstand {leaderGap}!",
      "DRAMA! {bravePlayer} wollte {bravePredict} Stiche — das war zu hoch gegriffen! Runde {roundNum} endet mit einer bösen Überraschung! {leader} bleibt mit {leaderTotal} Punkten an der Spitze!",
      "ABSTURZ! {bravePlayer} hat mutig {bravePredict} angesagt — und verliert! In der Gesamtwertung führt {leader} mit {leaderTotal} Punkten, während {bravePlayer} Federn lässt!",
    ],
    all_correct: [
      "UNGLAUBLICH! Runde {roundNum} — ALLE {playerCount} SPIELER lagen EXAKT RICHTIG! Das ist kollektives Können! Im Gesamtstand führt {leader} mit {leaderTotal} Punkten, {leaderGap} vor {second}!",
      "WAS FÜR EINE RUNDE! Alle {correctCount} Vorhersagen getroffen in Runde {roundNum}! Der Tisch tobt! {leader} führt die Gesamtwertung mit {leaderTotal} Punkten an!",
      "PERFEKTION! In Runde {roundNum} trifft JEDER seine Ansage! Das sieht man selten! Im Gesamtstand hat {leader} nun {leaderTotal} Punkte — Abstand {leaderGap} auf {second}!",
    ],
    all_wrong: [
      "EIN DESASTER! Runde {roundNum} — NIEMAND liegt richtig! Kollektives Versagen! Im Gesamtstand zittert {leader} mit {leaderTotal} Punkten — nur {leaderGap} vor {second}!",
      "CHAOS! Null Treffer in Runde {roundNum}! Was ist hier los?! {leader} behauptet sich trotzdem mit {leaderTotal} Gesamtpunkten — aber der Abstand auf {second} schmilzt!",
      "UNVORSTELLBAR! Alle daneben in Runde {roundNum}! Punkte für alle verloren! {leader} führt mit {leaderTotal} Punkten — doch nach dieser Katastrophe ist alles offen!",
    ],
    overtake: [
      "TABELLENFÜHRERWECHSEL! Runde {roundNum} — {overtaker} ÜBERHOLT {overtaken} und übernimmt die Führung! {overtaker} hat jetzt {leaderTotal} Gesamtpunkte, {leaderGap} Punkte vor {second}! Dramatik pur!",
      "POWER MOVE! In Runde {roundNum} zieht {overtaker} an {overtaken} vorbei! Neue Führung mit {leaderTotal} Punkten! Das Spiel dreht sich!",
      "DAS WENDE DES SPIELS! {overtaker} schnappt sich die Führung von {overtaken} in Runde {roundNum}! {leaderTotal} Gesamtpunkte, Abstand {leaderGap} — was für ein Aufstieg!",
    ],
    comeback: [
      "DAS COMEBACK DES ABENDS! Der Letzte macht die BESTE Runde {roundNum}! {topRoundPlayer} holt {topRoundScore} Punkte und schlägt alle! Im Gesamtstand ist noch alles möglich — {leader} führt mit {leaderTotal}, aber der Abstand auf {second} beträgt nur {leaderGap}!",
      "UNGLAUBLICH! Von unten nach oben! Runde {roundNum} gehört {topRoundPlayer} mit {topRoundScore} Punkten! Im Gesamtstand führt {leader} mit {leaderTotal} — aber Vorsicht, das Feld ist eng!",
      "DAS NENNT MAN COMEBACK! {topRoundPlayer} aus der Abstiegszone macht die stärkste Runde {roundNum}! {leaderTotal} Punkte führt {leader} — aber dieser Abend ist noch nicht vorbei!",
    ],
    leader_extends: [
      "MACHT DEN SACK ZU! Runde {roundNum} und {leader} BAUT DEN VORSPRUNG AUS! {leaderTotal} Gesamtpunkte, {leaderGap} vor {second}! Das sieht nach einem klaren Sieg aus!",
      "DOMINANZ! {leader} in Runde {roundNum} wieder stark! Gesamtstand: {leaderTotal} Punkte, Abstand {leaderGap}! Die anderen können nur noch hoffen!",
      "UNAUFHALTSAM! {leader} in Runde {roundNum} mit {topRoundScore} Rundenrunde! Der Gesamtvorsprung wächst auf {leaderGap} Punkte! Das Spiel ist beinahe entschieden!",
    ],
    single_hero: [
      "EIN HELD! Runde {roundNum} — {topRoundPlayer} macht {topRoundScore} Punkte und hängt alle ab! Im Gesamtstand führt {leader} mit {leaderTotal} Punkten, {leaderGap} vor {second}!",
      "NUR EINER STRAHLT! {topRoundPlayer} mit {topRoundScore} Punkten in Runde {roundNum} — alle anderen weit dahinter! {leader} ist Gesamtführender mit {leaderTotal} Punkten!",
      "SOLOSHOW! In Runde {roundNum} überragt {topRoundPlayer} mit {topRoundScore} Punkten! Gesamtstand: {leader} führt mit {leaderTotal} — {leaderGap} vor {second}!",
    ],
    single_disaster: [
      "EINER FÄLLT AB! Runde {roundNum} — {topRoundPlayer} holt {topRoundScore} Punkte, aber einer reißt alle runter! Im Gesamtstand führt {leader} mit {leaderTotal} Punkten, Abstand {leaderGap}!",
      "DISASTER! Eine Runde {roundNum}, ein Verlierer — und der verliert richtig! {leader} führt im Gesamtstand mit {leaderTotal} Punkten. Das Leid trifft nur einen!",
      "TOTALEINBRUCH bei einem Spieler in Runde {roundNum}! {topRoundPlayer} macht {topRoundScore} Punkte — und einer geht leer aus! {leader} bleibt mit {leaderTotal} Punkten vorne!",
    ],
    safe_players: [
      "AUF NUMMER SICHER! Mehrere Spieler sagen 0 an in Runde {roundNum} — kein Risiko, kein Gewinn! {leader} führt die Gesamtwertung mit {leaderTotal} Punkten, Abstand {leaderGap} auf {second}!",
      "KONSERVATIV! Die Nullansager dominieren Runde {roundNum}! Aber im Gesamtstand tickt die Uhr: {leader} mit {leaderTotal} Punkten — wer will den Angriff wagen?",
      "NULLRUNDE! Viele sagen 0 in Runde {roundNum} — und spielen auf Sicherheit! Gesamtstand: {leader} mit {leaderTotal} Punkten, {leaderGap} vor {second}. Aber das Risiko muss irgendwann kommen!",
    ],
    close_game: [
      "WAHNSINNIGE SPANNUNG! Runde {roundNum} und der Gesamtabstand zwischen {leader} und {second} beträgt nur {leaderGap} Punkte! {leader} mit {leaderTotal} — das wird noch eine heiße Schlussphase!",
      "ALLES OFFEN! Nach Runde {roundNum} — {leader} führt mit {leaderTotal} Punkten, nur {leaderGap} vor {second}! Das Spiel ist komplett offen!",
      "ENG WIE NOCH NIE! Runde {roundNum}: {leader} vorne mit {leaderTotal}, aber {second} lauert mit nur {leaderGap} Punkten Rückstand! Die nächsten Runden werden entscheidend!",
    ],
    mixed: [
      "Runde {roundNum} ist Geschichte! {correctCount} von {playerCount} lagen richtig. Im Gesamtstand führt {leader} mit {leaderTotal} Punkten, {leaderGap} vor {second}!",
      "Runde {roundNum} — ein gemischtes Bild! {topRoundPlayer} macht {topRoundScore} Punkte diese Runde. Gesamtstand: {leader} mit {leaderTotal} Punkten führt!",
      "Das Feld sortiert sich in Runde {roundNum}! {leader} hält die Gesamtführung mit {leaderTotal} Punkten, Abstand {leaderGap} auf {second}. Das Spiel läuft!",
    ],
  },

  tagesschau: {
    final_round: [
      "Runde {roundNum} von {totalRounds}, die letzte: {correctCount} von {playerCount} Vorhersagen korrekt. Abschlusspunktestand: {leader} gewinnt mit {leaderTotal} Punkten, {leaderGap} Punkte vor {second}.",
      "Das Spiel ist beendet. Letzte Runde abgeschlossen. Sieger: {leader} mit {leaderTotal} Gesamtpunkten. {second} folgt mit {leaderGap} Punkten Rückstand.",
      "Finale Meldung aus Runde {roundNum}: {topRoundPlayer} beste Rundenleistung mit {topRoundScore} Punkten. Gesamtergebnis: {leader} vorne mit {leaderTotal} Punkten.",
    ],
    brave_success: [
      "Runde {roundNum}: {bravePlayer} sagte {bravePredict} Stiche an — Vorhersage korrekt. Mutige Ansage erfüllt. Gesamtstand: {leader} führt mit {leaderTotal} Punkten, {leaderGap} vor {second}.",
      "Meldung: Runde {roundNum}. {bravePlayer} mit hoher Ansage von {bravePredict} — erfolgreich. Gesamtwertung: {leader} mit {leaderTotal} Punkten an der Spitze.",
      "Runde {roundNum}: Risikoansage von {bravePlayer} ({bravePredict} Stiche) aufgegangen. Gesamtstand: {leader} mit {leaderTotal} Punkten führt mit {leaderGap} Punkten Abstand.",
    ],
    brave_failure: [
      "Runde {roundNum}: {bravePlayer} sagte {bravePredict} Stiche an — Vorhersage nicht erfüllt. Punktverlust. Gesamtstand: {leader} führt mit {leaderTotal} Punkten, {leaderGap} vor {second}.",
      "Meldung: Runde {roundNum}. {bravePlayer} scheitert mit Ansage {bravePredict}. Gesamtwertung bleibt: {leader} mit {leaderTotal} Punkten an der Führung.",
      "Runde {roundNum}: Hohe Ansage von {bravePlayer} ({bravePredict}) nicht eingelöst. Gesamtstand: {leader} mit {leaderTotal} Punkten. {bravePlayer} verliert Boden.",
    ],
    all_correct: [
      "Runde {roundNum}: Alle {playerCount} Spieler lagen korrekt. Ungewöhnliches Ergebnis. Gesamtstand: {leader} mit {leaderTotal} Punkten, {leaderGap} vor {second}.",
      "Meldung aus Runde {roundNum}: Vollständige Vorhersagegenauigkeit. {correctCount} von {playerCount}. Gesamtwertung: {leader} mit {leaderTotal} Punkten führt.",
      "Runde {roundNum} abgeschlossen. Alle Vorhersagen korrekt. Gesamtstand: {leader} {leaderTotal} Punkte, {second} {leaderGap} Punkte zurück.",
    ],
    all_wrong: [
      "Runde {roundNum}: Keine Vorhersage korrekt. Allgemeiner Punktverlust. Gesamtstand: {leader} führt dennoch mit {leaderTotal} Punkten, {leaderGap} vor {second}.",
      "Meldung: Runde {roundNum} ohne korrekte Vorhersage. Gesamtwertung: {leader} mit {leaderTotal} Punkten. Abstand auf {second}: {leaderGap} Punkte.",
      "In Runde {roundNum} trafen alle Spieler daneben. Gesamtstand: {leader} vorne mit {leaderTotal} Punkten — Abstand {leaderGap} bleibt überschaubar.",
    ],
    overtake: [
      "Runde {roundNum}: Führungswechsel. {overtaker} übernimmt Platz eins von {overtaken}. Gesamtstand: {overtaker} mit {leaderTotal} Punkten, {leaderGap} Punkte Vorsprung vor {second}.",
      "Meldung: Runde {roundNum}. {overtaker} zieht an {overtaken} vorbei. Neue Gesamtführung: {leaderTotal} Punkte. {second} folgt mit {leaderGap} Punkten Rückstand.",
      "Runde {roundNum}: Tabellenveränderung. {overtaker} ist neuer Führender mit {leaderTotal} Punkten. {overtaken} auf Platz zwei.",
    ],
    comeback: [
      "Runde {roundNum}: {topRoundPlayer} erzielt beste Rundenleistung mit {topRoundScore} Punkten — trotz schlechtem Gesamtstand. Gesamtführung: {leader} mit {leaderTotal} Punkten, Abstand {leaderGap}.",
      "Meldung: Runde {roundNum}. Aufholjagd. {topRoundPlayer} mit starken {topRoundScore} Rundenrunde. Gesamtstand: {leader} mit {leaderTotal} Punkten. Abstand schmilzt.",
      "Runde {roundNum}: Platzierter Hintertreffer macht stärkste Runde. {topRoundPlayer}: {topRoundScore} Punkte. Gesamtführung: {leader} mit {leaderTotal}.",
    ],
    leader_extends: [
      "Runde {roundNum}: {leader} baut Führung aus. Gesamtstand: {leaderTotal} Punkte, {leaderGap} Punkte vor {second}. Tendenz: zunehmend entschieden.",
      "Meldung: Runde {roundNum}. {leader} erneut stark. Gesamtwertung: {leaderTotal} Punkte. Vorsprung auf {second}: {leaderGap}. Entscheidung in Sicht.",
      "Runde {roundNum}: Führender {leader} festigt Position. {leaderTotal} Gesamtpunkte, {leaderGap} Punkte Abstand. Aufholjagd der Konkurrenz erschwert.",
    ],
    single_hero: [
      "Runde {roundNum}: {topRoundPlayer} mit bester Rundenwertung: {topRoundScore} Punkte. Gesamtstand: {leader} führt mit {leaderTotal} Punkten, {leaderGap} vor {second}.",
      "Meldung: Runde {roundNum}. {topRoundPlayer}: {topRoundScore} Punkte — deutlich beste Rundenleistung. Gesamtwertung: {leader} mit {leaderTotal} Punkten an der Spitze.",
      "Runde {roundNum}: Einzelleistung von {topRoundPlayer}: {topRoundScore} Punkte. Alle anderen dahinter. Gesamtstand: {leader} mit {leaderTotal} Punkten.",
    ],
    single_disaster: [
      "Runde {roundNum}: Ein Spieler mit deutlichem Einbruch. {topRoundPlayer} führt mit {topRoundScore} Punkten diese Runde. Gesamtstand: {leader} mit {leaderTotal} Punkten, {leaderGap} vor {second}.",
      "Meldung: Runde {roundNum}. Erhebliche Punktdifferenz dieser Runde. Gesamtführung: {leader} mit {leaderTotal} Punkten. Ein Spieler verliert stark.",
      "Runde {roundNum}: Stärkste Rundenleistung {topRoundPlayer} mit {topRoundScore}. Schwächste weit dahinter. Gesamtstand: {leader} {leaderTotal} Punkte.",
    ],
    safe_players: [
      "Runde {roundNum}: Mehrere Spieler mit Nullansage. Konservative Strategie. Gesamtstand: {leader} führt mit {leaderTotal} Punkten, {leaderGap} vor {second}.",
      "Meldung: Runde {roundNum}. Zwei oder mehr Nullvorhersagen. Gesamtwertung: {leader} mit {leaderTotal} Punkten. Risikovermeidung dominiert.",
      "Runde {roundNum}: Mehrere Spieler gehen auf Null. Gesamtstand: {leader} mit {leaderTotal} Punkten, {second} {leaderGap} Punkte zurück.",
    ],
    close_game: [
      "Runde {roundNum}: Enges Gesamtbild. {leader} führt mit {leaderTotal} Punkten, nur {leaderGap} Punkte vor {second}. Entscheidung noch offen.",
      "Meldung: Runde {roundNum}. Gesamtabstand zwischen {leader} und {second}: {leaderGap} Punkte. Stand bleibt unklar. Weitere Runden entscheiden.",
      "Runde {roundNum}: {leader} mit {leaderTotal} Punkten vorne. {second} folgt mit {leaderGap} Punkten Rückstand. Ausgang weiterhin ungewiss.",
    ],
    mixed: [
      "Runde {roundNum}: {correctCount} von {playerCount} Vorhersagen korrekt. Gesamtstand: {leader} mit {leaderTotal} Punkten, {leaderGap} vor {second}.",
      "Zwischenstand nach Runde {roundNum}: {leader} führt mit {leaderTotal} Punkten. {topRoundPlayer} beste Rundenleistung mit {topRoundScore} Punkten.",
      "Runde {roundNum} abgeschlossen. Gesamtführung: {leader} mit {leaderTotal} Punkten. {leaderGap} Punkte Abstand auf {second}. Weiter.",
    ],
  },

  bavarian: {
    final_round: [
      "DES WAR'S! Runde {roundNum} — die letzte! {topRoundPlayer} macht {topRoundScore} Runde! Am End gewinnt {leader} mit {leaderTotal} Punkten! {leaderGap} Punkte vor {second} — Bravoo!",
      "Letzte Runde, letzte Chance! {correctCount} von {playerCount} lagen noch richtig! Da {leader} gewinnt mit {leaderTotal} Punkten — des is scho was!",
      "Jo, Runde {roundNum} — und Schluss! Da {leader} triumphiert mit {leaderTotal} Punkten! {second} schaut mit {leaderGap} Punkten Rückstand ins Leere — hoid so!",
    ],
    brave_success: [
      "Na des is was! Da {bravePlayer} sagt {bravePredict} Stiche an in Runde {roundNum} — und trifft! Mutig und erfolgreich! Im Gesamtstand führt {leader} mit {leaderTotal} Punkten, {leaderGap} vor {second}!",
      "Jessas, da {bravePlayer} — {bravePredict} Stiche angsagt und wirklich gmacht! Des war Courage! Da {leader} führt im Gesamt mit {leaderTotal} Punkten!",
      "Oa mei, da {bravePlayer} hat {bravePredict} angsagt — und alles stimmt! Runde {roundNum} mit Bravurleistung! {leader} bleibt vorne mit {leaderTotal} Punkten!",
    ],
    brave_failure: [
      "Jo mei, da {bravePlayer} — {bravePredict} Stiche angsagt und danebenglangt! Des war hoid z'mutig in Runde {roundNum}! {leader} führt trotzdem mit {leaderTotal} Punkten, {leaderGap} vor {second}.",
      "Hm. Da {bravePlayer} wollte {bravePredict} Stiche — des war nix. Runde {roundNum} endet mit Enttäuschung! {leader} mit {leaderTotal} Punkten bleibt vorne.",
      "Schad, da {bravePlayer}! {bravePredict} Stiche angsagt, aber ned gschafft in Runde {roundNum}. Im Gesamtstand: {leader} mit {leaderTotal} Punkten führt weiter.",
    ],
    all_correct: [
      "Na schau! Runde {roundNum} und alle ham richtig geraten! Des is scho was! Im Gesamt führt {leader} mit {leaderTotal} Punkten — {leaderGap} vor {second}!",
      "Jessas, alle richtig in Runde {roundNum}! {correctCount} Spieler — alle auf Kurs! Da {leader} führt mit {leaderTotal} Punkten — des is hoid so!",
      "Jo mei, in Runde {roundNum} hod's jeder gwisst! Alle richtig! Im Gesamtstand hat {leader} jetzt {leaderTotal} Punkte — {leaderGap} vor {second}!",
    ],
    all_wrong: [
      "Jo mei. Runde {roundNum} und koa hat's troffen. Alle daneben. Da {leader} führt trotzdem mit {leaderTotal} Punkten — aber der Abstand auf {second} ist nur {leaderGap}!",
      "Hm. Des war in Runde {roundNum} ned glorreich. Alle falsch. Da {leader} mit {leaderTotal} Punkten — wenigstens wer. Aber des Feld holt auf!",
      "Na schau, Runde {roundNum} — alle danebenglangt. Da {leader} mit {leaderTotal} Punkten noch vorne, nur {leaderGap} vor {second}!",
    ],
    overtake: [
      "Umschwung! Runde {roundNum} — da {overtaker} überholt den {overtaken}! Neue Führung mit {leaderTotal} Punkten! {leaderGap} vor {second} — na des is stark!",
      "Na des is was! Runde {roundNum} — da {overtaker} zieht vorbei! {leaderTotal} Gesamtpunkte! Bisheriger Leader ist weg — hoid!",
      "Durchbruch! Da {overtaker} schnappt sich die Führung in Runde {roundNum}! {leaderTotal} Punkte, {leaderGap} vor {second} — des war überfällig!",
    ],
    comeback: [
      "Noch ned vorbei! Da Letzte macht die beste Runde! {topRoundPlayer} mit {topRoundScore} Punkte in Runde {roundNum}! Im Gesamt führt {leader} mit {leaderTotal} — aber der Abstand auf {second} ist nur {leaderGap}!",
      "Koa Angst, des Spiel geht no! {topRoundPlayer} aus der Abstiegszone macht die beste Runde {roundNum} mit {topRoundScore} Punkten! {leader} führt mit {leaderTotal}!",
      "Jo, da {topRoundPlayer} gibt ned auf! Beste Runde {roundNum} mit {topRoundScore} Punkten! {leader} vorne mit {leaderTotal} — aber des Feld kommt!",
    ],
    leader_extends: [
      "Da {leader} läuft weg! Runde {roundNum} und der Abstand wächst auf {leaderGap} Punkte! {leaderTotal} im Gesamt — des wird schwer für {second}!",
      "Ned aufzuhalten, da {leader}! Runde {roundNum} und {leaderTotal} Punkte im Gesamt! {leaderGap} vor {second} — des Spiel neigt sich!",
      "Na bitte, da {leader} baut aus in Runde {roundNum}! {leaderTotal} Gesamtpunkte, {leaderGap} Punkte Abstand — die anderen schauen blöd!",
    ],
    single_hero: [
      "Na des is was! Runde {roundNum} — da {topRoundPlayer} macht {topRoundScore} Punkte und hängt alle ab! Im Gesamt führt {leader} mit {leaderTotal} Punkten, {leaderGap} vor {second}!",
      "Soloshow! Da {topRoundPlayer} mit {topRoundScore} Rundenrunde in Runde {roundNum} — alle anderen weit dahinta! {leader} führt gesamt mit {leaderTotal}!",
      "Oa mei, da {topRoundPlayer} überragt in Runde {roundNum} mit {topRoundScore} Punkten! Gesamtstand: {leader} mit {leaderTotal}, {leaderGap} vor {second}!",
    ],
    single_disaster: [
      "Einer fällt ab! Runde {roundNum} — da {topRoundPlayer} macht {topRoundScore} Punkte, aber einer geht so richtig leer aus! Im Gesamt führt {leader} mit {leaderTotal} Punkten!",
      "Hm, einer hat's gar ned troffa in Runde {roundNum}! Da {topRoundPlayer} macht {topRoundScore} — der Rest schaut blöd! {leader} mit {leaderTotal} gesamt!",
      "Na schau, Runde {roundNum} — einer verliert richtig! {topRoundPlayer} macht {topRoundScore} Runde. {leader} vorne mit {leaderTotal} Punkten, {leaderGap} vor {second}!",
    ],
    safe_players: [
      "Alle auf Nummer sicher! Mehrere sagn 0 an in Runde {roundNum}! Kein Risiko, kein Gwinn! {leader} führt gesamt mit {leaderTotal} Punkten, {leaderGap} vor {second}!",
      "Vorsichtig! Die Nullansager regieren Runde {roundNum}! Aber des Spiel geht weiter: {leader} mit {leaderTotal} Punkten — der riskiert halt was!",
      "Jo, 0 sagn ist sicher in Runde {roundNum}! Aber im Gesamt bleibt {leader} mit {leaderTotal} Punkten vorne — {leaderGap} vor {second}!",
    ],
    close_game: [
      "Wahnsinn, wie eng des is! Runde {roundNum} und da {leader} führt mit {leaderTotal} Punkten — nur {leaderGap} vor {second}! Des wird noch spannend!",
      "Ned viel trennts! Nach Runde {roundNum}: {leader} mit {leaderTotal} Punkten, {second} nur {leaderGap} dahinta! Des Spiel is offen!",
      "Eng wie beim Schafkopf! Runde {roundNum}: {leader} mit {leaderTotal}, {leaderGap} vor {second}! Die nächsten Runden zählen!",
    ],
    mixed: [
      "Jo, Runde {roundNum} is durch! {correctCount} von {playerCount} ham's gwisst. Im Gesamt führt {leader} mit {leaderTotal} Punkten, {leaderGap} vor {second}!",
      "Heast, Runde {roundNum} — so hoid so. Da {topRoundPlayer} macht's guad mit {topRoundScore} Rundenrunde. {leader} führt gesamt mit {leaderTotal}!",
      "Na bitte, Runde {roundNum}! Gemischtes Bild. {leader} mit {leaderTotal} Punkten bleibt vorne — {leaderGap} vor {second}!",
    ],
  },

  fan: {
    final_round: [
      "OH MEIN GOTT DAS FINALE! Runde {roundNum} — die LETZTE! {topRoundPlayer} macht {topRoundScore} Punkte! UND {leader} GEWINNT MIT {leaderTotal} PUNKTEN! {leaderGap} vor {second}! UNBELIEVABLE!",
      "IT'S OVER! Letzte Runde! {correctCount} von {playerCount} noch richtig! {leader} ist der SIEGER mit {leaderTotal} Punkten! INCREDIBLE! AMAZING!",
      "ICH KANN NICHT MEHR! Runde {roundNum} — Schluss! {leader} triumphiert mit {leaderTotal} Gesamtpunkten! {leaderGap} vor {second}! WHAT A GAME!",
    ],
    brave_success: [
      "OH MY GOD! {bravePlayer} sagt {bravePredict} Stiche an — UND TRIFFT EXAKT! Das ist MUTIG und GENIAL in Runde {roundNum}! Im Gesamtstand führt {leader} mit {leaderTotal} Punkten, {leaderGap} vor {second}!",
      "WAHNSINN! {bravePlayer} wagt {bravePredict} Stiche in Runde {roundNum} — UND ES KLAPPT! {leader} führt gesamt mit {leaderTotal} Punkten! DAS IST BRILLANT!",
      "INCREDIBLE! {bravePlayer} mit der mutigsten Ansage des Abends — {bravePredict} Stiche — UND ALLES RICHTIG! Gesamtstand: {leader} mit {leaderTotal}! AMAZING!",
    ],
    brave_failure: [
      "OH NO! {bravePlayer} wollte {bravePredict} Stiche in Runde {roundNum} — und SCHEITERT! Das war zu riskant! Im Gesamtstand führt {leader} weiter mit {leaderTotal} Punkten, {leaderGap} vor {second}!",
      "NOOOO! {bravePlayer} mit {bravePredict} — aber NICHT getroffen! DISASTER in Runde {roundNum}! {leader} bleibt trotzdem vorne mit {leaderTotal} Punkten! HEARTBREAKING!",
      "SO CLOSE BUT SO FAR! {bravePlayer} sagte {bravePredict} an und VERPASST! Runde {roundNum} mit Drama! {leader} führt mit {leaderTotal}! TRAGIC!",
    ],
    all_correct: [
      "OH MEIN GOTT! Runde {roundNum} — ALLE RICHTIG! Das ist WAHNSINN! {topRoundPlayer} mit {topRoundScore} Punkten! Und {leader} führt gesamt mit {leaderTotal}! Ich dreh durch!",
      "JAAAAAA! Runde {roundNum} und alle haben's getroffen! {correctCount} perfekte Vorhersagen! {leader} führt mit {leaderTotal} Punkten — {leaderGap} vor {second}! Unglaublich!",
      "Ich fasse es NICHT! Alle in Runde {roundNum} exakt richtig! Im Gesamtstand hat {leader} nun {leaderTotal} Punkte — {leaderGap} vor {second}!",
    ],
    all_wrong: [
      "NOOO! Runde {roundNum} — KEINER lag richtig?! ALLE falsch! Im Gesamtstand führt {leader} mit {leaderTotal} — aber nur {leaderGap} vor {second}! Das Feld holt auf! AAAAAH!",
      "Aaaargh! Runde {roundNum} und alle falsch! Alle! {leader} hält sich mit {leaderTotal} Punkten — aber wie lange noch?! DRAMA!",
      "OH NEIN OH NEIN! In Runde {roundNum} schießt jeder am Ziel vorbei! {leader} führt mit {leaderTotal} Punkten aber das ist auch kein Ruhm! NUR {leaderGap} vor {second}!",
    ],
    overtake: [
      "YES YES YES! Runde {roundNum} — {overtaker} ÜBERHOLT {overtaken}! Neue Führung mit {leaderTotal} Punkten! {leaderGap} vor {second}! AMAZING COMEBACK! SO EXCITING!",
      "INCREDIBLE! Runde {roundNum} — {overtaker} zieht vorbei! {leaderTotal} Punkte! New leader! {overtaken} muss sich was überlegen! WHAT A MOVE!",
      "PROMOTION! {overtaker} schnappt sich die Führung in Runde {roundNum}! {leaderTotal} Gesamtpunkte, {leaderGap} Punkte vor {second}! Former leader {overtaken} OUT! SO EXCITING!",
    ],
    comeback: [
      "IT'S NOT OVER! Der Letzte macht die beste Runde! {topRoundPlayer} mit {topRoundScore} Punkten in Runde {roundNum}! COMEBACK TIME! Im Gesamt führt {leader} mit {leaderTotal} — aber nur {leaderGap} vor {second}!",
      "YES! {topRoundPlayer} aus der Abstiegszone macht die beste Runde {roundNum} mit {topRoundScore} Punkten! ANYTHING IS POSSIBLE! {leader} führt mit {leaderTotal} — aber beware!",
      "COMEBACK VIBES! {topRoundPlayer} dominiert Runde {roundNum} mit {topRoundScore} Punkten! {leader} vorne mit {leaderTotal} — aber das Feld lebt! WHAT A RACE!",
    ],
    leader_extends: [
      "DOMINATION! {leader} baut den Vorsprung aus in Runde {roundNum}! {leaderTotal} Gesamtpunkte, {leaderGap} vor {second}! Game OVER? IT MIGHT BE! INCREDIBLE!",
      "THIS IS IT! {leader} läuft weg in Runde {roundNum}! {leaderTotal} Punkte gesamt, {leaderGap} Abstand! Die anderen brauchen ein Wunder! GAME OVER vibes!",
      "UNSTOPPABLE! {leader} in Runde {roundNum} wieder stark! {leaderTotal} Gesamtpunkte! {leaderGap} Punkte Vorsprung! Das ist eine STATEMENT-Runde!",
    ],
    single_hero: [
      "OH MY GOD! Runde {roundNum} — {topRoundPlayer} macht {topRoundScore} Punkte und ZERSTÖRT das Feld! Im Gesamtstand führt {leader} mit {leaderTotal} Punkten, {leaderGap} vor {second}!",
      "NUR EINER STRAHLT! {topRoundPlayer} mit {topRoundScore} Punkten in Runde {roundNum} — EINZIGARTIG! {leader} führt gesamt mit {leaderTotal}! BRILLIANT!",
      "SOLOSHOW! {topRoundPlayer} überragt in Runde {roundNum} mit {topRoundScore} Punkten! {leader} mit {leaderTotal} gesamt und {leaderGap} Punkten Abstand! AMAZING!",
    ],
    single_disaster: [
      "OH NO! Einer CRASHT in Runde {roundNum}! {topRoundPlayer} macht {topRoundScore} Punkte — aber einer geht richtig unter! {leader} führt gesamt mit {leaderTotal}! HEARTBREAKING für einen!",
      "MELTDOWN! Einer verliert in Runde {roundNum} alles! {topRoundPlayer} macht {topRoundScore} — und einer weint! Im Gesamtstand: {leader} mit {leaderTotal} Punkten! TRAGIC!",
      "DISASTER für einen Spieler! Runde {roundNum}: {topRoundPlayer} stark mit {topRoundScore}, einer schwach. {leader} führt mit {leaderTotal} — {leaderGap} vor {second}! OH THE DRAMA!",
    ],
    safe_players: [
      "BOOO! Mehrere sagen 0 an in Runde {roundNum}! Kein Risiko! Im Gesamtstand führt {leader} mit {leaderTotal} Punkten, {leaderGap} vor {second}! COME ON, TAKE A CHANCE!",
      "REALLY? Alle auf Null in Runde {roundNum}?! Kein Risiko! {leader} mit {leaderTotal} Gesamtpunkten! Aber wer wagt, der gewinnt — COME ON!",
      "YAWN! Nullansagen in Runde {roundNum}! Aber {leader} führt mit {leaderTotal}! {leaderGap} vor {second}! Das Spiel braucht mehr Mut! BORING but STRATEGIC!",
    ],
    close_game: [
      "OMG! SO CLOSE! Nach Runde {roundNum}: {leader} führt mit {leaderTotal} Punkten — aber NUR {leaderGap} vor {second}! Das ist WAHNSINN! ANYTHING CAN HAPPEN!",
      "TIE GAME VIBES! Runde {roundNum}: {leader} mit {leaderTotal}, {second} nur {leaderGap} dahinter! WHO WILL WIN?! I CAN'T TAKE IT!",
      "HEART-STOPPING! Nach Runde {roundNum} — nur {leaderGap} Punkte zwischen {leader} ({leaderTotal}) und {second}! This is DRAMA! INCREDIBLE!",
    ],
    mixed: [
      "WOW! Runde {roundNum} ist durch! {correctCount} von {playerCount} lagen richtig! {topRoundPlayer} mit {topRoundScore} Punkten! {leader} führt gesamt mit {leaderTotal}, {leaderGap} vor {second}!",
      "Runde {roundNum}! {topRoundPlayer} mit {topRoundScore} Punkten — STARK! Im Gesamtstand: {leader} mit {leaderTotal} Punkten führt! Das wird spannend!",
      "YES! Runde {roundNum} — gemischtes Bild! {correctCount} richtige Vorhersagen! {leader} führt mit {leaderTotal} Punkten! {leaderGap} vor {second}!",
    ],
  },
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function analyzeRound(round, players) {
  const { predictions = {}, tricks = {}, scores: roundScores = {} } = round;
  const pl = Array.isArray(players) ? players : [];

  let correctCount = 0;
  let bigMissPlayer = null;
  let bigMissDiff = 0;

  pl.forEach((p) => {
    const pred = predictions[p] ?? 0;
    const actual = tricks[p] ?? 0;
    const diff = Math.abs(pred - actual);
    if (diff === 0) correctCount++;
    if (diff > bigMissDiff) {
      bigMissDiff = diff;
      bigMissPlayer = p;
    }
  });

  const sortedByRound = [...pl].sort((a, b) => (roundScores[b] ?? 0) - (roundScores[a] ?? 0));
  const topRoundPlayer = sortedByRound[0];
  const topRoundScore = roundScores[topRoundPlayer] ?? 0;

  const allCorrect = correctCount === pl.length;
  const allWrong = correctCount === 0;

  return { correctCount, bigMissPlayer, bigMissDiff, topRoundPlayer, topRoundScore, allCorrect, allWrong };
}

function getTotalRounds(playerCount) {
  const counts = { 3: 20, 4: 15, 5: 12, 6: 10 };
  return counts[playerCount] || 15;
}

export function reactionChance(round, players, totalRounds) {
  const { bigMissDiff, allCorrect, allWrong } = analyzeRound(round, players);
  const isLastRound = round.round_number >= totalRounds;

  let p = 0.35;
  if (allCorrect) p += 0.30;
  if (allWrong) p += 0.35;
  if (bigMissDiff >= 3) p += 0.25;
  if (isLastRound) p += 0.25;
  return Math.min(p, 0.95);
}

/**
 * Build the full commentary for one Wizard round.
 * Returns { segments: [{avatar, name, label, text}], spokenText }
 *
 * @param {object} round        - wizard round (round_number, predictions, tricks, scores,
 *                                 totalScores, prevTotalScores, totalRounds, players)
 * @param {Array}  regPlayers   - registered players array (for avatar/character_type lookup)
 * @param {string} personality  - commentator personality key
 */
export function buildWizardCommentary(round, regPlayers = [], personality = "dramatic") {
  try {
    console.log('[buildWizardCommentary] Building commentary for round:', round);

    if (!round || typeof round !== 'object') {
      console.error('[buildWizardCommentary] Invalid round data:', round);
      return { segments: [{ avatar: "⚠️", name: "System", label: "Fehler", text: "Ungültige Rundendaten" }] };
    }

    const pers = PERSONALITIES[personality] ?? PERSONALITIES.dramatic;
    const regMap = Object.fromEntries((regPlayers ?? []).map((p) => [p.name, p]));

    // Players: prefer round.players (passed from ScoreSheet), fall back to predictions keys
    const players = Array.isArray(round.players) && round.players.length > 0
      ? round.players
      : Object.keys(round.predictions ?? {});

    const totalRoundsFromRound = round.totalRounds ?? getTotalRounds(players.length);
    const totalScores = round.totalScores ?? null;
    const prevTotalScores = round.prevTotalScores ?? null;

    const { correctCount, topRoundPlayer, topRoundScore } = analyzeRound(round, players);

    const scenario = analyzeRoundScenario(round, players, totalRoundsFromRound, prevTotalScores, totalScores);
    const templates = (COMMENTATOR_TEMPLATES[personality] ?? COMMENTATOR_TEMPLATES.dramatic)[scenario]
                   ?? COMMENTATOR_TEMPLATES.dramatic.mixed;

    // --- build total-score variables ---
    const totalRank = totalScores
      ? [...players].sort((a, b) => (totalScores[b] ?? 0) - (totalScores[a] ?? 0))
      : [];
    const leader     = totalRank[0] ?? topRoundPlayer ?? "Unbekannt";
    const second     = totalRank[1] ?? "";
    const leaderTotal = totalScores?.[leader] ?? 0;
    const leaderGap   = totalRank.length >= 2
      ? (totalScores?.[leader] ?? 0) - (totalScores?.[second] ?? 0)
      : 0;

    // --- brave prediction variables ---
    const maxTricks = round.round_number ?? 1;
    const highThreshold = maxTricks * 0.7;
    const braveSuccessPlayer = maxTricks >= 3
      ? players.find(p => {
          const pred = (round.predictions?.[p] ?? 0);
          return pred >= highThreshold && pred === (round.tricks?.[p] ?? 0);
        }) ?? null
      : null;
    const braveFailPlayer = maxTricks >= 3
      ? players.find(p => {
          const pred = (round.predictions?.[p] ?? 0);
          return pred >= highThreshold && pred !== (round.tricks?.[p] ?? 0);
        }) ?? null
      : null;
    const bravePlayer  = braveSuccessPlayer ?? braveFailPlayer ?? topRoundPlayer ?? "Unbekannt";
    const bravePredict = round.predictions?.[bravePlayer] ?? 0;

    // --- overtake variables ---
    let overtaker = leader;
    let overtaken = second;
    if (prevTotalScores && totalScores) {
      const prevRank = [...players].sort((a, b) => (prevTotalScores[b] ?? 0) - (prevTotalScores[a] ?? 0));
      if (prevRank[0] !== leader) {
        overtaker = leader;
        overtaken = prevRank[0];
      }
    }

    const vars = {
      roundNum:       round.round_number ?? 1,
      totalRounds:    totalRoundsFromRound,
      correctCount,
      playerCount:    players.length,
      topRoundPlayer: topRoundPlayer ?? "Unbekannt",
      topRoundScore,
      leader,
      leaderTotal,
      leaderGap,
      second,
      secondTotal:    totalScores?.[second] ?? 0,
      overtaker,
      overtaken,
      bravePlayer,
      bravePredict,
    };

    const segments = [
      {
        avatar: pers.icon,
        name: "Kommentator",
        label: pers.label,
        text: fill(pickRandom(templates), vars),
      },
    ];

    const totalRoundsForChance = totalRoundsFromRound;
    const chance = reactionChance(round, players, totalRoundsForChance);

    // Best scorer reaction
    if (Math.random() < chance && topRoundPlayer) {
      const reg = regMap[topRoundPlayer];
      const charType = reg?.character_type ?? "optimist";
      const topPlayerCorrect = (round.scores?.[topRoundPlayer] ?? 0) >= 0;
      const fallbackScenario = topPlayerCorrect ? "routine_win" : "routine_loss";
      const pool = PLAYER_REACTIONS[charType]?.[scenario]
                ?? PLAYER_REACTIONS[charType]?.[fallbackScenario]
                ?? PLAYER_REACTIONS.optimist?.[scenario]
                ?? PLAYER_REACTIONS.optimist?.[fallbackScenario];

      if (pool && pool.length > 0) {
        segments.push({
          avatar: reg?.avatar ?? "🃏",
          name: topRoundPlayer,
          label: PLAYER_PERSONALITIES[charType]?.label ?? "",
          text: pickRandom(pool),
        });
      }
    }

    // Worst scorer reaction (slightly lower chance)
    const totalRankForWorst = totalRank.length > 0 ? totalRank : [...players].sort((a, b) => (round.scores?.[b] ?? 0) - (round.scores?.[a] ?? 0));
    const bottomPlayer = totalRankForWorst[totalRankForWorst.length - 1];
    if (bottomPlayer && bottomPlayer !== topRoundPlayer && Math.random() < chance * 0.75) {
      const reg = regMap[bottomPlayer];
      const charType = reg?.character_type ?? "optimist";
      const bottomPlayerCorrect = (round.scores?.[bottomPlayer] ?? 0) >= 0;
      const fallbackScenario = bottomPlayerCorrect ? "routine_win" : "routine_loss";
      const pool = PLAYER_REACTIONS[charType]?.[scenario]
                ?? PLAYER_REACTIONS[charType]?.[fallbackScenario]
                ?? PLAYER_REACTIONS.optimist?.[scenario]
                ?? PLAYER_REACTIONS.optimist?.[fallbackScenario];

      if (pool && pool.length > 0) {
        segments.push({
          avatar: reg?.avatar ?? "🃏",
          name: bottomPlayer,
          label: PLAYER_PERSONALITIES[charType]?.label ?? "",
          text: pickRandom(pool),
        });
      }
    }

    const spokenText = segments.map((s) => s.text).join(" — ");
    console.log('[buildWizardCommentary] Commentary built successfully:', { segmentsCount: segments.length, scenario, spokenText });
    return { segments, spokenText };
  } catch (error) {
    console.error('[buildWizardCommentary] Error building commentary:', error);
    return {
      segments: [{
        avatar: "⚠️",
        name: "System",
        label: "Fehler",
        text: "Fehler beim Erstellen des Kommentars: " + error.message,
      }],
      spokenText: "Fehler",
    };
  }
}
