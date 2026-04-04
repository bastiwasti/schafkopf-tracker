import { PERSONALITIES, pickRandom, fill } from '../shared/commentary.js';
import { PLAYER_PERSONALITIES, PLAYER_REACTIONS } from '../shared/playerPersonalities.js';
import { analyzeRoundScenario } from './roundScenarios.js';

export { PERSONALITIES };

// ---------------------------------------------------------------------------
// COMMENTATOR TEMPLATES
// ---------------------------------------------------------------------------

const COMMENTATOR_TEMPLATES = {
  dramatic: {
    all_correct: [
      "UNGLAUBLICH! Runde {roundNum} — und ALLE SPIELER lagen EXAKT RICHTIG! {correctCount} von {totalPlayers} perfekte Vorhersagen! Das ist kein Zufall — das ist KÖNNEN! {topPlayer} führt mit {topScore} Punkten!",
      "WAS FÜR EINE RUNDE! Runde {roundNum} mit VOLLSTÄNDIGER PUNKTEAUSBEUTE für alle! {topPlayer} an der Spitze mit {topScore} Punkten — der Tisch tobt!",
      "PERFEKTE RUNDE! In Runde {roundNum} haben alle Spieler ihre Vorhersage HAARGENAU erfüllt! {topPlayer} mit {topScore} Punkten vorne — der Tisch tobt!",
    ],
    all_wrong: [
      "EIN DESASTER! Runde {roundNum} — NIEMAND hat die Vorhersage getroffen! {bigMissPlayer} lag um {bigMissDiff} Stiche daneben! Was ist hier nur los?! {topPlayer} führt mit {topScore} Punkten!",
      "CHAOS AUF DEM TISCH! Runde {roundNum} und kein einziger Spieler lag richtig! Das ist kollektives VERSAGEN auf höchstem Niveau! {topPlayer} rettet sich mit {topScore} Punkten ins Ziel!",
      "UNVORSTELLBAR! In Runde {roundNum} verliert jeder! {bigMissPlayer} mit der schlimmsten Abweichung — {bigMissDiff} Stiche daneben! Eine Katastrophe!",
    ],
    mixed: [
      "Runde {roundNum} ist Geschichte! {correctCount} von {totalPlayers} Spielern lagen richtig! {topPlayer} führt mit {topScore} Punkten — {bottomPlayer} muss aufholen!",
      "Runde {roundNum} — ein gemischtes Bild! {topPlayer} mit starken {topScore} Punkten an der Spitze, während {bottomPlayer} kämpft! {bigMissPlayer} lag um {bigMissDiff} Stiche daneben!",
      "Das Feld sortiert sich in Runde {roundNum}! {correctCount} richtige Vorhersagen — {topPlayer} macht es clever und führt mit {topScore} Punkten!",
    ],
    single_winner: [
      "EINZIGER SIEGER! Runde {roundNum} — nur {topPlayer} lag richtig! {topScore} Punkte! {bottomPlayer} hat's nicht getroffen!",
      "DRAMA! Runde {roundNum} — nur {topPlayer} hat die Vorhersage getroffen! Einzigartige Performance mit {topScore} Punkten!",
      "HERVORRAGEND! Runde {roundNum} — {topPlayer} war der EINZIGE mit richtiger Vorhersage! {topScore} Punkte!",
    ],
    single_loser: [
      "TRAURIG! Runde {roundNum} — nur {bottomPlayer} lag daneben! Alle anderen richtig! {topPlayer} führt mit {topScore} Punkten!",
      "OH JE! Runde {roundNum} — {bottomPlayer} als einziger falsch getippt! Das tut weh! {topPlayer} führt mit {topScore} Punkten!",
      "HART ABER FAIR! Runde {roundNum} — nur {bottomPlayer} hat nicht getroffen! Alle anderen perfekt! {topPlayer} mit {topScore} Punkten!",
    ],
    close_game_decision: [
      "FINALE ENTSCHEIDUNG! Runde {roundNum} — es geht um ALLES! {topPlayer} mit {topScore} Punkten knapp vorne! Spannung pur!",
      "DRAMA IM FINALE! Runde {roundNum} — {topScore} vs {bottomScore} Punkte! Die Entscheidung fällt in der letzten Sekunde!",
      "LETZTE SEKUNDEN! Runde {roundNum} — der Abstand beträgt nur {topScore - bottomScore} Punkte! WER gewinnt?!",
    ],
    game_decided: [
      "SPIEL ENTSCIEDEN! Runde {roundNum} — der Gewinner steht fest! {topPlayer} mit {topScore} Punkten! Spiel vorbei!",
      "ENDSTATION! Runde {roundNum} — {topPlayer} hat es geschafft! {topScore} Punkte Vorsprung! Das Spiel ist gelaufen!",
      "UNUMSTÖSSLICH! Runde {roundNum} — {topPlayer} führt mit {topScore} Punkten! Niemand kann mehr einholen!",
    ],
    dramatic_zero: [
      "HISTORISCH! Runde {roundNum} — ALLE MIT 0 STICHEN! Ein absolutes Novum! {topPlayer} führt dennoch mit {topScore} Punkten!",
      "UNGLAUBLICH! Runde {roundNum} — niemand hat auch nur EINEN Stich! Alle 0! {topPlayer} führt mit {topScore} Punkten!",
      "NIE DAGEWESEN! Runde {roundNum} — 0 Stiche für ALLE! Das ist Wizard-Geschichte! {topPlayer} mit {topScore} Punkten!",
    ],
    dramatic_max: [
      "ALLES ODER NICHTS! Runde {roundNum} — ALLE HABEN DIE MAXIMALEN STICHE! {topPlayer} mit {topScore} Punkten!",
      "PERFEKTE SYNERGIE! Runde {roundNum} — jeder Spieler hat alle Stiche geholt! {topPlayer} führt mit {topScore} Punkten!",
      "DAS WAR DER HAMMER! Runde {roundNum} — alle mit maximalen Stichen! {topPlayer} an der Spitze mit {topScore} Punkten!",
    ],
    comeback_likely: [
      "COMEBACK IM ANZUG! Runde {roundNum} — {bottomPlayer} kommt zurück! Nur {topScore - bottomScore} Punkte Differenz! Es wird spannend!",
      "NICHTS VORBEI! Runde {roundNum} — {bottomPlayer} hat noch Chancen! {topPlayer} führt mit {topScore} Punkten!",
      "ALLES MÖGLICH! Runde {roundNum} — der Rückstand beträgt nur {topScore - bottomScore} Punkte! {topPlayer} führt!",
    ],
    comeback_unlikely: [
      "VERLORENE SACHE! Runde {roundNum} — {topPlayer} führt mit {topScore} Punkten! {bottomPlayer} hat kaum Chancen!",
      "DER HIMMEL HILF! Runde {roundNum} — {topScore} Punkte Vorsprung! {topPlayer} hat es im Griff!",
      "TITELGEFAHR! Runde {roundNum} — {topPlayer} baut {topScore} Punkte aus! {bottomPlayer} kann nicht mehr einholen!",
    ],
    all_zero: [
      "KONSERVATIV! Runde {roundNum} — alle haben 0 Stiche vorhersagt! {topPlayer} führt mit {topScore} Punkten!",
      "ZWEIFELHAFT! Runde {roundNum} — niemand riskiert was! Alle 0! {topPlayer} mit {topScore} Punkten!",
      "VORSICHTIG! Runde {roundNum} — alle Spieler gehen auf Nummer sicher! 0 Stiche für alle!",
    ],
    all_max: [
      "GROTESK! Runde {roundNum} — alle haben die maximale Stichzahl vorhersagt! {topPlayer} mit {topScore} Punkten!",
      "ÜBERMUTIG! Runde {roundNum} — alle wollen ALLE Stiche! {topPlayer} führt mit {topScore} Punkten!",
      "HARTNÄCKIG! Runde {roundNum} — alle Spieler sind zuversichtlich! Maximale Vorhersage für alle!",
    ],
    tie_situation: [
      "Gleichstand! Runde {roundNum} — {topScore} vs {topScore} Punkte! Wer setzt sich durch?! Spannung!",
      "PATTSTELLUNG! Runde {roundNum} — {topPlayer} und {bottomPlayer} punktgleich! {topScore} Punkte! Unentschieden!",
      "KEINER VORNE! Runde {roundNum} — alle auf Augenhöhe! {topScore} Punkte! Wer gewinnt? Spannung pur!",
    ],
    score_overtake: [
      "TABELLENWECHSEL! Runde {roundNum} — {topPlayer} überholt! Neue Führung mit {topScore} Punkten! Was für ein Aufstieg!",
      "POWER MOVE! Runde {roundNum} — {topPlayer} übernimmt die Spitze! {topScore} Punkte! Der ehemalige Leader ist weg!",
      "DURCHBRUCH! Runde {roundNum} — {topPlayer} steigt auf und führt mit {topScore} Punkten! Was für eine Leistung!",
    ],
    score_collapse: [
      "EINSTURZ! Runde {roundNum} — {bottomPlayer} fällt ab! {topScore} Punkte Rückstand! Das tut weh!",
      "DRAMA! Runde {roundNum} — {bottomPlayer} verliert die Führung! {topScore} Punkte! Was für ein Fall!",
      "KATASTROPHE! Runde {roundNum} — {bottomPlayer} rutscht ab! {topScore} Punkte! Einsturz!",
    ],
  },

  tagesschau: {
    all_correct: [
      "Runde {roundNum}: Alle {totalPlayers} Spieler lagen korrekt. {topPlayer} führt mit {topScore} Punkten. Das Ergebnis ist bemerkenswert.",
      "Meldung aus Runde {roundNum}: Vollständige Vorhersagegenauigkeit. {correctCount} von {totalPlayers}. {topPlayer}: {topScore} Punkte. Weiter.",
      "Runde {roundNum} abgeschlossen. Alle Vorhersagen korrekt. {topPlayer}: {topScore} Punkte. Weiter.",
    ],
    all_wrong: [
      "Runde {roundNum}: Keine Vorhersage war korrekt. {bigMissPlayer} lag um {bigMissDiff} Stiche daneben. {topPlayer} führt mit {topScore} Punkten. Die Zahlen sprechen für sich.",
      "Meldung: Runde {roundNum} ohne korrekte Vorhersage. Ergebnis: allgemeine Punktverluste. {topPlayer}: {topScore} Punkte.",
      "In Runde {roundNum} trafen alle Spieler daneben. {bottomPlayer} am stärksten betroffen. {topPlayer} mit {topScore} Punkten an der Spitze.",
    ],
    mixed: [
      "Runde {roundNum}: {correctCount} von {totalPlayers} Vorhersagen korrekt. {topPlayer}: {topScore} Punkte. {bottomPlayer} liegt zurück.",
      "Runde {roundNum} abgeschlossen. {topPlayer} führt mit {topScore} Punkten. {bigMissPlayer} lag um {bigMissDiff} Stiche daneben. Stand aktualisiert.",
      "Zwischenstand nach Runde {roundNum}: {topPlayer} mit {topScore} Punkten vorne. {correctCount} von {totalPlayers} lagen richtig.",
    ],
    single_winner: [
      "Runde {roundNum}: Nur {topPlayer} lag korrekt. {topScore} Punkte. Alle anderen Spieler falsch.",
      "Meldung: Runde {roundNum}. {topPlayer} als einziger korrekt. {topScore} Punkte. {bottomPlayer} ohne Treffer.",
      "Runde {roundNum}: {correctCount} von {totalPlayers} korrekt. {topPlayer} führt mit {topScore} Punkten.",
    ],
    single_loser: [
      "Runde {roundNum}: Alle korrekt bis auf {bottomPlayer}. {topPlayer} führt mit {topScore} Punkten.",
      "Meldung: Runde {roundNum}. {bottomPlayer} als einziger falsch. {topPlayer}: {topScore} Punkte.",
      "Runde {roundNum}: {correctCount} von {totalPlayers} korrekt. {topPlayer} führt mit {topScore} Punkten. {bottomPlayer} fehlerhaft.",
    ],
    close_game_decision: [
      "Runde {roundNum}: Entscheidungsschlussrunde. {topPlayer} führt knapp mit {topScore} Punkten. Differenz: {topScore - bottomScore}.",
      "Meldung: Runde {roundNum}. {topPlayer}: {topScore} Punkte. {bottomPlayer}: {bottomScore} Punkte. Entscheidung fällt in letzter Runde.",
      "Zwischenstand Runde {roundNum}: Enger Zwischenstand. {topPlayer} führt mit {topScore} Punkten vor {bottomPlayer}.",
    ],
    game_decided: [
      "Runde {roundNum}: Entscheidung gefallen. {topPlayer} gewinnt mit {topScore} Punkten. Das Spiel ist entschieden.",
      "Meldung: Runde {roundNum}. {topPlayer} baut unüberholbaren Vorsprung auf. {topScore} Punkte. Spiel vorbei.",
      "Runde {roundNum}: {topPlayer} gewinnt. {topScore} Punkte. {bottomPlayer} kann nicht mehr einholen.",
    ],
    dramatic_zero: [
      "Runde {roundNum}: Besonderes Ergebnis. Alle Spieler mit 0 Stichen. {topPlayer} führt mit {topScore} Punkten.",
      "Meldung: Runde {roundNum}. Historische Situation. Keine Stiche für alle Spieler. {topPlayer}: {topScore} Punkte.",
      "Runde {roundNum}: Alle Spieler ohne Stiche. Einzigartiges Ergebnis. {topPlayer} führt mit {topScore} Punkten.",
    ],
    dramatic_max: [
      "Runde {roundNum}: Alle Spieler mit maximalen Stichen. {topPlayer} führt mit {topScore} Punkten.",
      "Meldung: Runde {roundNum}. Alle Spieler holen alle Stiche. {topPlayer}: {topScore} Punkte.",
      "Runde {roundNum}: Maximalstiche für alle Spieler. {topPlayer} führt mit {topScore} Punkten.",
    ],
    comeback_likely: [
      "Runde {roundNum}: Comeback möglich. {bottomPlayer} liegt nur {topScore - bottomScore} Punkte zurück. {topPlayer} führt mit {topScore} Punkten.",
      "Meldung: Runde {roundNum}. Enges Rennen. {topPlayer}: {topScore} Punkte. {bottomPlayer}: {bottomScore} Punkte.",
      "Zwischenstand Runde {roundNum}: {topPlayer} führt mit {topScore} Punkten. {bottomPlayer} kommt auf. Differenz: {topScore - bottomScore}.",
    ],
    comeback_unlikely: [
      "Runde {roundNum}: {topPlayer} führt mit {topScore} Punkten. Comeback für {bottomPlayer} unwahrscheinlich.",
      "Meldung: Runde {roundNum}. {topPlayer} baut {topScore} Punkte Vorsprung auf. {bottomPlayer} hat kaum Chancen.",
      "Runde {roundNum}: Entscheidung nahezu gefallen. {topPlayer} führt mit {topScore} Punkten vor {bottomPlayer}.",
    ],
    all_zero: [
      "Runde {roundNum}: Alle Spieler mit 0 Stich-Vorhersage. {topPlayer} führt mit {topScore} Punkten.",
      "Meldung: Runde {roundNum}. Konservative Vorhersagen. Alle 0. {topPlayer}: {topScore} Punkte.",
      "Runde {roundNum}: Keine Risikobereitschaft. Alle Spieler mit 0 Stich-Vorhersage. {topPlayer} führt.",
    ],
    all_max: [
      "Runde {roundNum}: Alle Spieler mit maximaler Stich-Vorhersage. {topPlayer} führt mit {topScore} Punkten.",
      "Meldung: Runde {roundNum}. Zuversichtliche Vorhersagen. Alle maximal. {topPlayer}: {topScore} Punkte.",
      "Runde {roundNum}: Alle Spieler erwarten viele Stiche. {topPlayer} führt mit {topScore} Punkten.",
    ],
    tie_situation: [
      "Runde {roundNum}: Punktgleichstand. {topPlayer} und {bottomPlayer} mit {topScore} Punkten. Entscheidung offen.",
      "Meldung: Runde {roundNum}. {topScore} Punkte für mehrere Spieler. Unentschieden im Zwischenstand.",
      "Runde {roundNum}: {topScore} Punkte für alle führenden Spieler. Kein klarer Sieger.",
    ],
    score_overtake: [
      "Runde {roundNum}: Tabellenwechsel. {topPlayer} übernimmt Führung mit {topScore} Punkten. {bottomPlayer} wird verdrängt.",
      "Meldung: Runde {roundNum}. {topPlayer} zieht an {topPlayer} vorbei. Neue Führung: {topScore} Punkte.",
      "Runde {roundNum}: {topPlayer} steigt auf. {topScore} Punkte. Bisheriger Führender verliert Spitzenposition.",
    ],
    score_collapse: [
      "Runde {roundNum}: Leistungseinbruch bei {bottomPlayer}. {topPlayer} führt mit {topScore} Punkten. {bottomPlayer} verliert Boden.",
      "Meldung: Runde {roundNum}. {bottomPlayer} fällt ab. {topScore} Punkte Rückstand. Stand: {bottomScore} Punkte.",
      "Runde {roundNum}: {bottomPlayer} verliert Position. {topPlayer} führt mit {topScore} Punkten. {bottomPlayer}: {bottomScore} Punkte.",
    ],
  },

  bavarian: {
    all_correct: [
      "Na schau! Runde {roundNum} und alle ham richtig geraten! Des is scho was! Da {topPlayer} mit {topScore} Punkten — schee wars!",
      "Jessas, alle richtig in Runde {roundNum}! {correctCount} Spieler, alle auf Kurs! Da {topPlayer} führt mit {topScore} — des is hoid so!",
      "Jo mei, in Runde {roundNum} hod's jeder gwisst! Alle richtig! Da {topPlayer} mit {topScore} Punkten — Bravoo!",
    ],
    all_wrong: [
      "Jo mei. Runde {roundNum} und koa hat's troffen. Da {bigMissPlayer} mit {bigMissDiff} Stich daneben — des war halt nix. Da {topPlayer} führt trotzdem mit {topScore}.",
      "Hm. Des war in Runde {roundNum} ned sonderlich glorreich. Alle falsch. Da {topPlayer} mit {topScore} Punkten — wenigstens wer.",
      "Na schau, Runde {roundNum} — alle danebenglangt. Da {bottomPlayer} schaut a bissl blöd. Da {topPlayer} mit {topScore} Punkten noch vorne.",
    ],
    mixed: [
      "Jo, Runde {roundNum} is durch! {correctCount} von {totalPlayers} ham's gwisst. Da {topPlayer} mit {topScore} Punkten führt — des ko ma scho sagn.",
      "Heast, Runde {roundNum} — so hoid so. Da {topPlayer} macht's guad und führt mit {topScore} Punkten. Da {bigMissPlayer} mit {bigMissDiff} daneben — schad.",
      "Na bitte, Runde {roundNum}! {correctCount} Richtige! Da {topPlayer} mit {topScore} Punkten — schee.",
    ],
    single_winner: [
      "Na des is was! Runde {roundNum} — nur {topPlayer} hat's gwisst! {topScore} Punkte! Des is stark!",
      "Jessas, Runde {roundNum} — bloß {topPlayer} richtig! {topScore} Punkte! Da andere ham nix gschafft!",
      "Oa mei, Runde {roundNum} — {topPlayer} war der oanzige mit richtiger Vorhersage! {topScore} Punkte! Hoid!",
    ],
    single_loser: [
      "Jo mei, Runde {roundNum} — nur {bottomPlayer} ned getroffen! Da andra ham's gschafft! {topPlayer} führt mit {topScore} Punkten.",
      "Schad, Runde {roundNum} — {bottomPlayer} als einziger daneben! Des tut weh! {topPlayer} mit {topScore} Punkten.",
      "Na bitte, Runde {roundNum} — {bottomPlayer} war schlecht! Alle andra richtig! {topPlayer} mit {topScore} Punkten!",
    ],
    close_game_decision: [
      "Wird eng! Runde {roundNum} — jetzt geht's um alles! {topPlayer} mit {topScore} Punkten knapp vorne! Spannung!",
      "Oa mei, Runde {roundNum} — Entscheidung fällt! {topScore} vs {bottomScore} Punkte! WER gewinnt?!",
      "Na, Runde {roundNum} — nur {topScore - bottomScore} Punkte Unterschied! {topPlayer} führt! Enges Rennen!",
    ],
    game_decided: [
      "Des war's dann! Runde {roundNum} — der Gewinner steht fest! {topPlayer} mit {topScore} Punkten! Aus!",
      "So, Runde {roundNum} — {topPlayer} hat's gschafft! {topScore} Punkte Vorsprung! Spiel vorbei!",
      "Na scho, Runde {roundNum} — {topPlayer} führt mit {topScore} Punkten! Koa muaß mehr!",
    ],
    dramatic_zero: [
      "Na verdammt! Runde {roundNum} — ALLE MIT 0 STICHEN! Des hot's ned geben! {topPlayer} führt mit {topScore} Punkten!",
      "Wos is des?! Runde {roundNum} — 0 Stiche für ALLE! A absolute Kuriosität! {topPlayer} mit {topScore} Punkten!",
      "Nie dagewesen! Runde {roundNum} — niemand hod an Stich! Alle 0! {topPlayer} mit {topScore} Punkten!",
    ],
    dramatic_max: [
      "Hoid der Geier! Runde {roundNum} — ALLE HAM ALLE STICHE! {topPlayer} mit {topScore} Punkten!",
      "Unfassbar! Runde {roundNum} — jeder Spieler hod alle Stiche gholt! {topPlayer} an der Spitzn mit {topScore} Punkten!",
      "Das war der Hammer! Runde {roundNum} — alle mit maximalen Stichen! {topPlayer} mit {topScore} Punkten!",
    ],
    comeback_likely: [
      "Noch ned vorbei! Runde {roundNum} — {bottomPlayer} kommt wieder! Nur {topScore - bottomScore} Punkte hinta! Wird spannend!",
      "Koa Angst! Runde {roundNum} — {bottomPlayer} hat no Chance! {topPlayer} führt mit {topScore} Punkten!",
      "Alles möglich! Runde {roundNum} — der Rückstand ist nur {topScore - bottomScore} Punkte! {topPlayer} führt!",
    ],
    comeback_unlikely: [
      "Oa mei, des is vorbei! Runde {roundNum} — {topPlayer} führt mit {topScore} Punkten! {bottomPlayer} hod koa Chance!",
      "Gott im Himmel! Runde {roundNum} — {topScore} Punkte Vorsprung! {topPlayer} hod's im Griff!",
      "Gefahr! Runde {roundNum} — {topPlayer} baut {topScore} Punkte aus! {bottomPlayer} koa mehr einhola!",
    ],
    all_zero: [
      "Vorsichtig! Runde {roundNum} — alle ham 0 Stiche vorhersagt! {topPlayer} führt mit {topScore} Punkten!",
      "Zweifelhaft! Runde {roundNum} — keiner riskiert was! Alle 0! {topPlayer} mit {topScore} Punkten!",
      "Sicherheitsdenker! Runde {roundNum} — alle gehen auf Nummer sicher! 0 Stiche für alle!",
    ],
    all_max: [
      "Großmäulig! Runde {roundNum} — alle wollen alle Stiche! {topPlayer} mit {topScore} Punkten!",
      "Selbstbewusst! Runde {roundNum} — alle sind zuversichtlich! Maximal für alle! {topPlayer} mit {topScore} Punkten!",
      "Tollpatsch! Runde {roundNum} — alle ham maximale Vorhersage! {topPlayer} mit {topScore} Punkten!",
    ],
    tie_situation: [
      "Gleichstand! Runde {roundNum} — {topScore} vs {topScore} Punkte! Wer setzt sich durch?! Spannung!",
      "Patt! Runde {roundNum} — {topPlayer} und {bottomPlayer} punktgleich! {topScore} Punkte! Unentschieden!",
      "Keiner vorne! Runde {roundNum} — alle auf Augenhöhe! {topScore} Punkte! Wer gewinnt?",
    ],
    score_overtake: [
      "Umschwung! Runde {roundNum} — {topPlayer} überholt! Neue Führung mit {topScore} Punkten! Na des is stark!",
      "Na des is was! Runde {roundNum} — {topPlayer} übernimmt die Spitze! {topScore} Punkte! Bisheriger Leader is weg!",
      "Durchbruch! Runde {roundNum} — {topPlayer} steigt auf und führt mit {topScore} Punkten! Hoid!",
    ],
    score_collapse: [
      "Einbruch! Runde {roundNum} — {bottomPlayer} fällt ab! {topScore} Punkte Rückstand! Des tut weh!",
      "Drama! Runde {roundNum} — {bottomPlayer} verliert die Führung! {topScore} Punkte! Was für a Fall!",
      "Katastrophe! Runde {roundNum} — {bottomPlayer} rutscht ab! {topScore} Punkte! Oa mei!",
    ],
  },

  fan: {
    all_correct: [
      "OH MEIN GOTT! Runde {roundNum} — ALLE RICHTIG! Das ist WAHNSINN! {topPlayer} mit {topScore} Punkten! Ich dreh durch!",
      "JAAAAAA! Runde {roundNum} und alle haben's getroffen! {correctCount} perfekte Vorhersagen! {topPlayer} mit {topScore}! Unglaublich!",
      "Ich fasse es NICHT! Alle in Runde {roundNum} exakt richtig! {topPlayer} mit {topScore} Punkten — der ist auf einem anderen Level!",
    ],
    all_wrong: [
      "NOOO! Runde {roundNum} — KEINER lag richtig?! Das kann doch nicht sein! {bigMissPlayer} mit {bigMissDiff} Stichen daneben! Was ist das?!",
      "Aaaargh! Runde {roundNum} und alle falsch! Alle! {bottomPlayer} am schlimmsten! {topPlayer} hält sich noch mit {topScore} Punkten — aber wie?!",
      "OH NEIN OH NEIN! In Runde {roundNum} schießt jeder am Ziel vorbei! {topPlayer} führt mit {topScore} Punkten aber das ist auch kein Ruhm!",
    ],
    mixed: [
      "WOW! Runde {roundNum} ist durch! {correctCount} von {totalPlayers} lagen richtig! {topPlayer} mit {topScore} Punkten — der macht das!",
      "Runde {roundNum}! {topPlayer} mit {topScore} Punkten — STARK! {bottomPlayer} muss sich was überlegen! {bigMissPlayer} mit {bigMissDiff} Stichen daneben — oje!",
      "YES! {correctCount} richtige Vorhersagen in Runde {roundNum}! {topPlayer} mit {topScore} Punkten führt! Das wird spannend!",
    ],
    single_winner: [
      "OH MY GOD! Runde {roundNum} — nur {topPlayer} hat's getroffen! {topScore} Punkte! EINZIGER SIEGER!",
      "WOW! Runde {roundNum} — {topPlayer} als einziger korrekt! {topScore} Punkte! Alle anderen falsch! Unglaublich!",
      "ICH GLAUBE ES NICHT! Runde {roundNum} — nur {topPlayer} richtig! {topScore} Punkte! Was für eine Performance!",
    ],
    single_loser: [
      "OH NO! Runde {roundNum} — nur {bottomPlayer} falsch! Alle anderen richtig! {topPlayer} mit {topScore} Punkten! Das tut weh!",
      "NEIN! Runde {roundNum} — {bottomPlayer} als einziger daneben! {topScore} Punkte! Das ist hartherzig!",
      "TRAGIC! Runde {roundNum} — {bottomPlayer} war der einzige Fehler! Alle perfekt! {topPlayer} mit {topScore} Punkten!",
    ],
    close_game_decision: [
      "DRAMA! Runde {roundNum} — Entscheidung fällt! {topPlayer} mit {topScore} Punkten knapp vorne! WER GEWINNT?!",
      "HEART-STOPPING! Runde {roundNum} — {topScore} vs {bottomScore} Punkte! Die Entscheidung fällt jetzt! AAAAAH!",
      "FINAL STRETCH! Runde {roundNum} — nur {topScore - bottomScore} Punkte Unterschied! Spannung pur! OMG!",
    ],
    game_decided: [
      "IT'S OVER! Runde {roundNum} — {topPlayer} gewinnt mit {topScore} Punkten! Das Spiel ist vorbei! GEWONNEN!",
      "CHAMPION! Runde {roundNum} — {topPlayer} ist unumstritten! {topScore} Punkte Vorsprung! INCREDIBLE!",
      "UNBEATABLE! Runde {roundNum} — {topPlayer} hat es geschafft! {topScore} Punkte! Niemand kann das einholen! WAHNSINN!",
    ],
    dramatic_zero: [
      "WHAT?! Runde {roundNum} — ALLE MIT 0 STICHEN! Das ist WAHNSINN! {topPlayer} mit {topScore} Punkten!",
      "NO WAY! Runde {roundNum} — 0 Stiche für ALLE! Das gab es NIE! {topPlayer} mit {topScore} Punkten! UNBELIEVABLE!",
      "HOLY COW! Runde {roundNum} — niemand hat auch nur EINEN Stich! Alle 0! {topPlayer} mit {topScore} Punkten! AMAZING!",
    ],
    dramatic_max: [
      "UNBELIEVABLE! Runde {roundNum} — ALLE MIT MAXIMALEN STICHEN! {topPlayer} mit {topScore} Punkten! INCREDIBLE!",
      "WOW! Runde {roundNum} — jeder Spieler hat ALLE Stiche geholt! {topPlayer} an der Spitze mit {topScore} Punkten! AMAZING!",
      "THIS IS CRAZY! Runde {roundNum} — alle mit maximalen Stichen! {topPlayer} mit {topScore} Punkten! I CAN'T BELIEVE IT!",
    ],
    comeback_likely: [
      "IT'S NOT OVER! Runde {roundNum} — {bottomPlayer} kommt zurück! Nur {topScore - bottomScore} Punkte hinta! COMEBACK TIME!",
      "YES! Runde {roundNum} — {bottomPlayer} hat noch Chance! {topPlayer} führt mit {topScore} Punkten! SPANNUNG!",
      "ANYTHING IS POSSIBLE! Runde {roundNum} — Rückstand nur {topScore - bottomScore} Punkte! {topPlayer} führt! WHAT A RACE!",
    ],
    comeback_unlikely: [
      "OH NO! Runde {roundNum} — {topPlayer} führt mit {topScore} Punkten! {bottomPlayer} hat kaum Chancen! TRAGIC!",
      "THIS IS IT! Runde {roundNum} — {topScore} Punkte Vorsprung! {topPlayer} hat es im Griff! GAME OVER!",
      "TITLE RACE OVER! Runde {roundNum} — {topPlayer} baut {topScore} Punkte aus! {bottomPlayer} kann nicht mehr einholen! SAD!",
    ],
    all_zero: [
      "BOOO! Runde {roundNum} — alle mit 0 Stich-Vorhersage! {topPlayer} führt mit {topScore} Punkten! BORING!",
      "REALLY? Runde {roundNum} — alle 0! Kein Risiko! {topPlayer} mit {topScore} Punkten! COME ON!",
      "YAWN! Runde {roundNum} — alle gehen auf Nummer sicher! 0 Stiche für alle! {topPlayer} mit {topScore} Punkten! WEAK!",
    ],
    all_max: [
      "CRAZY! Runde {roundNum} — alle mit maximaler Stich-Vorhersage! {topPlayer} führt mit {topScore} Punkten! BOLD!",
      "WOW! Runde {roundNum} — alle wollen ALLE Stiche! {topPlayer} mit {topScore} Punkten! CONFIDENT!",
      "WILD! Runde {roundNum} — alle erwarten viele Stiche! {topPlayer} führt mit {topScore} Punkten! WHAT A RACE!",
    ],
    tie_situation: [
      "OMG! Runde {roundNum} — Gleichstand! {topPlayer} und {bottomPlayer} mit {topScore} Punkten! WHO WILL WIN?!",
      "TIE GAME! Runde {roundNum} — {topScore} Punkte für mehrere! Unentschieden! WHAT'S GONNA HAPPEN?!",
      "NO CLEAR WINNER! Runde {roundNum} — {topScore} Punkte für alle führenden! DRAMA! EXCITING!",
    ],
    score_overtake: [
      "YES YES YES! Runde {roundNum} — {topPlayer} überholt! Neue Führung mit {topScore} Punkten! AMAZING COMEBACK!",
      "INCREDIBLE! Runde {roundNum} — {topPlayer} zieht vorbei! {topScore} Punkte! New leader! SO EXCITING!",
      "PROMOTION! Runde {roundNum} — {topPlayer} steigt auf! {topScore} Punkte! Former leader OUT! WHAT A MOVE!",
    ],
    score_collapse: [
      "OH NO! Runde {roundNum} — {bottomPlayer} fällt ab! {topScore} Punkte Rückstand! HEARTBREAKING!",
      "DISASTER! Runde {roundNum} — {bottomPlayer} verliert die Führung! {topScore} Punkte! WHAT A FALL! SAD!",
      "MELTDOWN! Runde {roundNum} — {bottomPlayer} rutscht ab! {topScore} Punkte! TRAGEDY! OH THE HUMANITY!",
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

  const playersArray = Array.isArray(players) ? players : [];

  playersArray.forEach((p) => {
    const pred = predictions[p] ?? 0;
    const actual = tricks[p] ?? 0;
    const diff = Math.abs(pred - actual);
    if (diff === 0) correctCount++;
    if (diff > bigMissDiff) {
      bigMissDiff = diff;
      bigMissPlayer = p;
    }
  });

  const sorted = [...playersArray].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));
  const topPlayer = sorted[0];
  const bottomPlayer = sorted[sorted.length - 1];
  const topScore = scores[topPlayer] ?? 0;

  const allCorrect = correctCount === playersArray.length;
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
  try {
    console.log('[buildWizardCommentary] Building commentary for round:', round);
    
    if (!round || typeof round !== 'object') {
      console.error('[buildWizardCommentary] Invalid round data:', round);
      return { segments: [{ avatar: "⚠️", name: "System", label: "Fehler", text: "Ungültige Rundendaten" }] };
    }

    const pers = PERSONALITIES[personality] ?? PERSONALITIES.dramatic;
    const regMap = Object.fromEntries((regPlayers ?? []).map((p) => [p.name, p]));
    const playersArray = Object.keys(round.predictions ?? {});
    const players = Array.isArray(playersArray) ? playersArray : [];
    const totalRounds = getTotalRounds(players.length);

    const { correctCount, bigMissPlayer, bigMissDiff, topPlayer, bottomPlayer, topScore } =
      analyzeRound(round, players);

    const scenario = analyzeRoundScenario(round, players, totalRounds);
    const templates = (COMMENTATOR_TEMPLATES[personality] ?? COMMENTATOR_TEMPLATES.dramatic)[scenario];

    if (!templates || !Array.isArray(templates) || templates.length === 0) {
      console.error('[buildWizardCommentary] No templates found for scenario:', scenario, 'Available scenarios:', Object.keys(COMMENTATOR_TEMPLATES.dramatic));
      return { segments: [{ avatar: "⚠️", name: "System", label: "Fehler", text: "Keine Kommentare verfügbar für Szenario: " + scenario }] };
    }

    const vars = {
      roundNum: round.round_number ?? 1,
      topPlayer: topPlayer ?? "Unbekannt",
      topScore: topScore ?? 0,
      bottomPlayer: bottomPlayer ?? "Unbekannt",
      bottomScore: (round?.scores?.[bottomPlayer ?? ""] ?? 0),
      correctCount: correctCount ?? 0,
      totalPlayers: players.length ?? 0,
      bigMissPlayer: bigMissPlayer ?? "",
      bigMissDiff: bigMissDiff ?? 0,
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
    if (Math.random() < chance && topPlayer) {
      const reg = regMap[topPlayer];
      const charType = reg?.character_type ?? "optimist";
      const topPlayerCorrect = (round.scores?.[topPlayer] ?? 0) >= 0;
      const fallbackScenario = topPlayerCorrect ? "routine_win" : "routine_loss";
      const pool = PLAYER_REACTIONS[charType]?.[scenario]
                ?? PLAYER_REACTIONS[charType]?.[fallbackScenario]
                ?? PLAYER_REACTIONS.optimist?.[scenario]
                ?? PLAYER_REACTIONS.optimist?.[fallbackScenario];
      
      if (pool && pool.length > 0) {
        segments.push({
          avatar: reg?.avatar ?? "🃏",
          name: topPlayer,
          label: PLAYER_PERSONALITIES[charType]?.label ?? "",
          text: pickRandom(pool),
        });
      }
    }

    // Worst scorer reaction (slightly lower chance)
    if (bottomPlayer && bottomPlayer !== topPlayer && Math.random() < chance * 0.75) {
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
        text: "Fehler beim Erstellen des Kommentars: " + error.message 
      }], 
      spokenText: "Fehler" 
    };
  }
}