import { PERSONALITIES, pickRandom, fill } from "../shared/commentary.js";
import { PLAYER_PERSONALITIES, PLAYER_REACTIONS } from "../shared/playerPersonalities.js";
import { isNullType } from "./logic.js";
import { analyzeGameScenario } from "./gameScenarios.js";

export { PERSONALITIES };

// ---------------------------------------------------------------------------
// HAUPTKOMMENTARE — Farbspiele & Grand
// ---------------------------------------------------------------------------

const COMMENTATOR_TEMPLATES = {
  dramatic: {
    won: {
      Farbe: [
        "{player} dominiert am Skatttisch! {gameType} gespielt — {points} Punkte eingestrichen, grandios!",
        "Welch ein Alleinspieler! {player} holt sich das {gameType}-Spiel mit {points} Punkten — keine Gnade!",
        "{player} hat das {gameType}-Spiel souverän durchgezogen! {points} Punkte — die Gegner hatten keine Chance!",
      ],
      Grand: [
        "GRAND! Das Spiel aller Spiele — und {player} gewinnt es mit {points} Punkten! Atemberaubend!",
        "{player} wagt den Grand und triumphiert! {points} Punkte — was für ein Alleinspieler!",
        "Alle vier Buben als Trumpf, und {player} nutzt sie meisterhaft! Grand gewonnen — {points} Punkte!",
      ],
    },
    lost: {
      Farbe: [
        "{player} scheitert beim {gameType}! Die Gegenpartei war zu stark — {points} Punkte futsch!",
        "Das {gameType}-Spiel geht schief für {player}! Die Gegner jubeln, {points} Punkte verloren!",
        "Niederlage für {player} beim {gameType}! {points} Punkte weg — heute war nicht der Tag!",
      ],
      Grand: [
        "GRAND verloren! {player} riskierte alles und verliert {points} Punkte — ein teurer Fehler!",
        "{player} scheitert am Grand — die Gegenpartei sticht durch! {points} Punkte dahin!",
        "Der Grand bricht zusammen! {player} verliert {points} Punkte — der Mut war da, das Glück nicht!",
      ],
    },
  },

  tagesschau: {
    won: {
      Farbe: [
        "{player} gewinnt das {gameType}-Spiel. Ergebnis: {points} Punkte.",
        "Im {gameType}-Spiel setzt sich {player} durch. Punktestand: plus {points}.",
        "{player} gewinnt als Alleinspieler im {gameType}. {points} Punkte gutgeschrieben.",
      ],
      Grand: [
        "{player} gewinnt den Grand. {points} Punkte werden verbucht.",
        "Grand für {player} — erfolgreich abgeschlossen. {points} Punkte.",
        "{player} spielt Grand und gewinnt. Gutschrift: {points} Punkte.",
      ],
    },
    lost: {
      Farbe: [
        "{player} verliert das {gameType}-Spiel. Minus {points} Punkte.",
        "Das {gameType}-Spiel geht verloren. {player}: minus {points} Punkte.",
        "{player} unterliegt im {gameType}. Abzug: {points} Punkte.",
      ],
      Grand: [
        "{player} verliert den Grand. Abzug: {points} Punkte.",
        "Grand-Niederlage für {player}. Minus {points} Punkte.",
        "{player} scheitert im Grand. {points} Punkte werden abgezogen.",
      ],
    },
  },

  bavarian: {
    won: {
      Farbe: [
        "Sauguad, der {player}! {gameType} gholt und {points} Punkte kassiert — des is a Wahnsinnsleistung!",
        "Jo mei, da {player} spuidt wia a Gott! {gameType} gwunna und {points} Punkte eingholt, Servus!",
        "Da {player} haut des {gameType}-Spui weg wia nix! {points} Punkte — des is Skat auf Bayerisch!",
      ],
      Grand: [
        "Heiligs Blechle! Da {player} spuidt Grand und gwinnts! {points} Punkte — des is scho was!",
        "Grand! Da {player} haut alle viere hin und gwinnts! {points} Punkte, Vergelt's Gott!",
        "Des ist ja fantastisch! Da {player} macht an Grand — {points} Punkte, Prost auf den Spieler!",
      ],
    },
    lost: {
      Farbe: [
        "Ach du liebe Güte! Da {player} verliert beim {gameType} — {points} Punkte wech, schad!",
        "Jessas na, da {player} is beim {gameType} auf die Schnauzen gfallen! {points} Punkte futsch!",
        "Na servus! {player} beim {gameType} verloren — {points} Punkte dahin, nächstes Mal vielleicht!",
      ],
      Grand: [
        "Heilandsakrament! Da {player} verliert den Grand! {points} Punkte weg — des tuat weh!",
        "Oba naa! Grand verloren, da {player} schaut jetzt deppert aus. {points} Punkte hin!",
        "So a Mist! Da {player} wagt den Grand und verliert — {points} Punkte futsch, nix gwesen!",
      ],
    },
  },

  fan: {
    won: {
      Farbe: [
        "JAAAA! {player} holt das {gameType}-Spiel! {points} Punkte — WAHNSINN, ich dreh durch!",
        "Das ist MEGA! {player} gewinnt {gameType} — {points} Punkte, SO LÄUFT DAS HIER!",
        "{player} RÄUMT AB beim {gameType}! {points} Punkte!! Alter, das war KRANK!",
      ],
      Grand: [
        "GRAND GEWONNEN!! {player} ist ein GOTT!! {points} Punkte — ICH GLAUB ES NICHT!!",
        "OH MEIN GOTT, GRAND! {player} macht das DING — {points} Punkte, LEGENDÄR!!",
        "{player} GRAND — das ist das BESTE was ich heute gesehen hab! {points} Punkte, HAAAALT!",
      ],
    },
    lost: [
      "Neeeeein! {player} verliert! Scheiße! {points} Punkte WEG!",
      "Das DARF NICHT SEIN! {player} verliert das Spiel! {points} Punkte flöten — MIST!",
      "Ugh, das war nix! {player} hat verloren, {points} Punkte weg. Nächstes Mal besser!",
    ],
  },
};

// ---------------------------------------------------------------------------
// NULL-SPIELE — Ziel: KEINEN Stich machen
// ---------------------------------------------------------------------------

const NULL_TEMPLATES = {
  dramatic: {
    won: {
      Null: [
        "MAKELLOS! {player} nimmt keinen einzigen Stich — das Null ist perfekt durchgezogen! {points} Punkte!",
        "Unsichtbar wie ein Geist! {player} weicht jedem Stich aus — Null gewonnen, {points} Punkte!",
        "{player} meistert die Kunst der Stichvermeidung! Kein einziger Stich — Null gewonnen! {points} Punkte!",
      ],
      NullHand: [
        "NULL HAND — ohne Skat, ohne Stiche! {player} ist fehlerlos! {points} Punkte — brillant!",
        "Mit verbundenen Augen durchgezogen! Null Hand für {player} — kein Stich, {points} Punkte!",
        "{player} braucht keinen Skat und keinen Stich — Null Hand gewonnen! {points} Punkte, unglaublich!",
      ],
      NullOuvert: [
        "OFFEN GESPIELT, KEINEN STICH GEMACHT! {player} legt alles auf den Tisch und triumphiert! {points} Punkte!",
        "Null Ouvert — Karten offen, Nerven aus Stahl! {player} nimmt keinen Stich, {points} Punkte!",
        "{player} zeigt alle Karten und nimmt trotzdem keinen Stich — Null Ouvert perfekt! {points} Punkte!",
      ],
      NullOuvertHand: [
        "NULL OUVERT HAND!! Das Unmögliche ist möglich — {player} ohne Skat, offen, kein Stich! {points} Punkte, LEGENDÄR!",
        "Das Allerschwierigste im Skat — und {player} schafft es! Null Ouvert Hand gewonnen! {points} Punkte!",
        "{player} wagt das Höchste und gewinnt! Null Ouvert Hand — kein Stich, alles offen, {points} Punkte!",
      ],
    },
    lost: {
      Null: [
        "KATASTROPHE! {player} nimmt einen Stich — das Null ist geplatzt! {points} Punkte verloren!",
        "Ein fataler Stich reicht aus — {player} scheitert am Null! {points} Punkte futsch!",
        "{player} kann einen Stich nicht vermeiden — das Null ist gescheitert, {points} Punkte weg!",
      ],
      NullHand: [
        "Null Hand verloren! {player} hat einen Stich kassiert — ohne Skat, ohne Chance! {points} Punkte weg!",
        "Ein einziger Stich vernichtet die Null Hand! {player} büßt {points} Punkte!",
        "{player} riskiert die Null Hand und scheitert — ein Stich zuviel, {points} Punkte dahin!",
      ],
      NullOuvert: [
        "Offen gespielt, einen Stich kassiert! {player} verliert die Null Ouvert — {points} Punkte weg!",
        "Die Karten lagen offen — und trotzdem hat {player} gestochen! Null Ouvert verloren, {points} Punkte!",
        "{player} zeigt alles, nimmt dann doch einen Stich — Null Ouvert gescheitert! {points} Punkte futsch!",
      ],
      NullOuvertHand: [
        "Das Risikoreichste im Skat und {player} verliert es! Null Ouvert Hand — ein Stich kostet {points} Punkte!",
        "Null Ouvert Hand gescheitert! {player} nimmt einen Stich — {points} Punkte bezahlen!",
        "{player} wagt alles beim Null Ouvert Hand und verliert einen Stich — {points} Punkte weg!",
      ],
    },
  },

  tagesschau: {
    won: {
      Null: [
        "{player} gewinnt das Null. Kein Stich genommen. {points} Punkte.",
        "Null erfolgreich. {player} nimmt keinen Stich. Plus {points} Punkte.",
        "{player}: kein einziger Stich im Null-Spiel. {points} Punkte gutgeschrieben.",
      ],
      NullHand: [
        "Null Hand gewonnen. {player} ohne Skat, ohne Stich. {points} Punkte.",
        "{player} gewinnt die Null Hand. Kein Stich genommen. Plus {points} Punkte.",
        "Null Hand: {player} erfolgreich. {points} Punkte werden verbucht.",
      ],
      NullOuvert: [
        "Null Ouvert gewonnen. Karten lagen offen, kein Stich für {player}. {points} Punkte.",
        "{player} gewinnt die Null Ouvert. Offen gespielt, kein Stich. Plus {points} Punkte.",
        "Null Ouvert: {player} nimmt keinen Stich. Ergebnis: {points} Punkte.",
      ],
      NullOuvertHand: [
        "Null Ouvert Hand gewonnen. {player} ohne Skat, Karten offen, kein Stich. {points} Punkte.",
        "{player} gewinnt Null Ouvert Hand. Höchste Schwierigkeit. Plus {points} Punkte.",
        "Null Ouvert Hand erfolgreich. {player}: kein Stich, kein Skat, alles offen. {points} Punkte.",
      ],
    },
    lost: {
      Null: [
        "{player} verliert das Null. Stich genommen. Minus {points} Punkte.",
        "Null gescheitert. {player} hat gestochen. Abzug: {points} Punkte.",
        "{player} nimmt einen Stich im Null-Spiel. Minus {points} Punkte.",
      ],
      NullHand: [
        "Null Hand verloren. {player} nimmt einen Stich. Minus {points} Punkte.",
        "{player} scheitert bei der Null Hand. Ein Stich. Abzug: {points} Punkte.",
        "Null Hand nicht bestanden. {player}: ein Stich, minus {points} Punkte.",
      ],
      NullOuvert: [
        "Null Ouvert verloren. {player} nimmt trotz offener Karten einen Stich. Minus {points} Punkte.",
        "{player} scheitert bei Null Ouvert. Ein Stich. Abzug: {points} Punkte.",
        "Null Ouvert gescheitert. {player}: ein Stich, minus {points} Punkte.",
      ],
      NullOuvertHand: [
        "Null Ouvert Hand verloren. {player} scheitert. Minus {points} Punkte.",
        "{player} verliert Null Ouvert Hand. Ein Stich entscheidet. Abzug: {points} Punkte.",
        "Null Ouvert Hand: {player} nimmt einen Stich. Minus {points} Punkte.",
      ],
    },
  },

  bavarian: {
    won: {
      Null: [
        "Koa Stich, gar koa Stich! Da {player} macht a perfekts Null — {points} Punkte, Hammer!",
        "Da {player} is wia a Geist — kein Stich kriagt er, des Null is perfekt! {points} Punkte!",
        "Sauberer ghts nimmer! Da {player} macht koa Null und gholt {points} Punkte — wunderbar!",
      ],
      NullHand: [
        "Ohne Skat und koa Stich! Da {player} spuidt Null Hand wia a Meister — {points} Punkte, Wahnsinn!",
        "Null Hand ohne Skat — und da {player} macht trotzdem koa Stich! {points} Punkte, Vergelt's Gott!",
        "Des is ja sakrisch guad! Null Hand, koa Skat, koa Stich — da {player} is einfach super! {points} Punkte!",
      ],
      NullOuvert: [
        "Offe glegt und trotzdem koa Stich! Da {player} macht Null Ouvert perfekt — {points} Punkte!",
        "Da {player} legt alle Karten auf'n Tisch und kriagt trotzdem koa Stich — Null Ouvert gwunna! {points} Punkte!",
        "Kruzitürken, des war mutig! Null Ouvert für {player}, koa Stich, {points} Punkte — bravo!",
      ],
      NullOuvertHand: [
        "Heiligs Blechle, des is des Schwerste beim Skat — und da {player} schafft's! Null Ouvert Hand, {points} Punkte!",
        "Koa Skat, offe gspuidt, koa Stich — da {player} macht des Unmögliche! {points} Punkte, ein Traum!",
        "Wia macht der des nur? Null Ouvert Hand gwunna! Da {player} kriagt koa Stich — {points} Punkte!",
      ],
    },
    lost: {
      Null: [
        "Oje, oje! Da {player} kriagt an Stich beim Null — des Null is gscheidat! {points} Punkte futsch!",
        "Na servus! Ain einziger Stich und des Null is hi! Da {player} verliert {points} Punkte — schad!",
        "Jessas, an Stich kriagt und scho is des Null gscheidat! Da {player} verliert {points} Punkte!",
      ],
      NullHand: [
        "Null Hand verlorn! Da {player} kriagt an Stich — ohne Skat unds trotzdem nix gworden! {points} Punkte weg!",
        "So a Mist! Null Hand und doch an Stich kriagt — da {player} verliert {points} Punkte, armer Kerl!",
        "Wehe dem! Null Hand gscheitert, da {player} hat an Stich — {points} Punkte dahin, des tuat weh!",
      ],
      NullOuvert: [
        "Offe gspuidt und trotzdem an Stich kriagt! Da {player} verliert Null Ouvert und {points} Punkte!",
        "Des war nix! Null Ouvert verlorn — da {player} macht an Stich, {points} Punkte futsch!",
        "Null Ouvert verlorn! Karten lagen offe, aber da {player} hat trotzdem gstocha — {points} Punkte weg!",
      ],
      NullOuvertHand: [
        "Himmelherrgott! Null Ouvert Hand verlorn! Da {player} kriagt an Stich — {points} Punkte dahin!",
        "Des war z'vui gwagt! Null Ouvert Hand und da {player} verliert — {points} Punkte weg, schad!",
        "So a Wahnsinn! Null Ouvert Hand gscheidat — da {player} hat an Stich kriagt, {points} Punkte futsch!",
      ],
    },
  },

  fan: {
    won: {
      Null: [
        "KEIN EINZIGER STICH!! {player} gewinnt Null PERFEKT — {points} Punkte, OH GOTT ICH DREH DURCH!",
        "NULL GEWONNEN!! Kein Stich für {player} — {points} Punkte, DAS IST UNGLAUBLICH!!",
        "{player} nimmt KEINEN STICH! Null gewonnen, {points} Punkte — ABSOLUTE LEGENDE!",
      ],
      NullHand: [
        "NULL HAND OHNE SKAT UND KEIN STICH!! {player} ist ÜBERIRDISCH!! {points} Punkte!!",
        "Null Hand gewonnen!! {player} braucht keinen Skat — KEIN STICH, {points} PUNKTE, WAHNSINN!",
        "OH MEIN GOTT NULL HAND!! {player} macht das EINFACH! Kein Stich, {points} Punkte, KRANK!",
      ],
      NullOuvert: [
        "ALLES OFFEN UND KEIN STICH!! {player} gewinnt Null Ouvert — {points} Punkte, LEGENDÄR!!",
        "NULL OUVERT GEWONNEN!! Karten offen, kein Stich für {player} — {points} Punkte, BOAH!!",
        "{player} ZEIGT ALLES und nimmt NICHTS!! Null Ouvert, {points} Punkte — ICH LIEBE SKAT!!",
      ],
      NullOuvertHand: [
        "NULL OUVERT HAND!! DAS SCHWERSTE ÜBERHAUPT!! {player} MACHT ES!! {points} PUNKTE — WAHNSINN TOTAL!!",
        "UNGLAUBLICH!! Null Ouvert Hand für {player}!! Kein Skat, alles offen, KEIN STICH!! {points} Punkte!!",
        "{player} IST EIN GOTT!! Null Ouvert Hand gewonnen — {points} Punkte, DAS KANN NICHT REAL SEIN!!",
      ],
    },
    lost: {
      Null: [
        "NEEEIN!! {player} macht einen Stich — das Null ist KAPUTT!! {points} Punkte weg, Katastrophe!!",
        "EIN STICH ZU VIEL!! {player} verliert das Null — {points} Punkte dahin, ICH KANN NICHT!!",
        "OH NEIN OH NEIN OH NEIN!! {player} sticht — Null verloren, {points} Punkte weg!!",
      ],
      NullHand: [
        "NULL HAND VERLOREN!! Ein Stich und alles futsch — {player} büßt {points} Punkte, TRAGISCH!!",
        "NOOOO!! Null Hand — ein fataler Stich für {player}! {points} Punkte weg, ich fass es nicht!!",
        "DRAMA!! Null Hand gescheitert, {player} hat gestochen — {points} Punkte verloren!!",
      ],
      NullOuvert: [
        "TROTZ OFFENER KARTEN GESTOCHEN!! {player} verliert Null Ouvert — {points} Punkte weg, SCHANDE!!",
        "NULL OUVERT VERLOREN!! {player} macht einen Stich obwohl alles offen lag — {points} Punkte futsch!!",
        "WIE KANN DAS PASSIEREN?! Null Ouvert für {player} gescheitert — {points} Punkte, UNFASSBAR!!",
      ],
      NullOuvertHand: [
        "NULL OUVERT HAND VERLOREN!! Das SCHLIMMSTE!! {player} sticht — {points} Punkte weg, DRAMA PUR!!",
        "KATASTROPHE!! Null Ouvert Hand gescheitert — {player} hat gestochen, {points} Punkte dahin!!",
        "{player} WAGT ALLES UND VERLIERT ALLES!! Null Ouvert Hand — ein Stich, {points} Punkte futsch!!",
      ],
    },
  },
};

// ---------------------------------------------------------------------------
// RAMSCH — Strafspiel wenn alle zu feige waren
// ---------------------------------------------------------------------------

const RAMSCH_TEMPLATES = {
  dramatic: [
    "RAMSCH! Keiner wollte spielen — jetzt werden alle bestraft! {loser} hat mit {loserPoints} Punkten am meisten gezittert!",
    "Die Feigheit hat ihren Preis! Alle passen, alle verlieren — {loser} mit {loserPoints} Punkten am schlimmsten dran!",
    "Wenn keiner Mut hat, siegt der Ramsch! {loser} kassiert {loserPoints} Punkte und verliert sie alle — gut gemacht, Feiglinge!",
  ],
  tagesschau: [
    "Ramsch gespielt. Kein Spieler übernahm das Spiel. {loser} schied mit {loserPoints} Punkten am schlechtesten ab.",
    "Ramsch: kein Alleinspieler. {loser} nimmt die meisten Punkte — {loserPoints}. Alle verlieren entsprechend.",
    "Ramsch-Runde beendet. Höchste Punktzahl: {loser} mit {loserPoints} Punkten.",
  ],
  bavarian: [
    "Na geh! Keiner traut sich — also Ramsch! Da {loser} hockt jetzt auf {loserPoints} Punkten, des is die Strafe fürs Passen!",
    "Alle z'feig zum Spuin, also wird geramscht! Da {loser} haut {loserPoints} Punkte rein — wer net spuidt, verliert halt!",
    "Wer net spuidt, muss auch leiden! Ramsch — und da {loser} leidet am meisten mit {loserPoints} Punkten!",
  ],
  fan: [
    "RAMSCH!! Alle zu FEIGE um zu spielen!! {loser} hat {loserPoints} Punkte UND VERLIERT SIE ALLE — GERECHTE STRAFE!!",
    "NIEMAND HAT SICH GETRAUT!! Also RAMSCH!! {loser} kassiert {loserPoints} Punkte und zahlt drauf — KARMA!!",
    "HA! {loser} glaubt er kommt davon — aber {loserPoints} Punkte beim Ramsch bedeuten VERLUST!! NÄCHSTES MAL SPIELEN!!",
  ],
};

// ---------------------------------------------------------------------------
// MODIFIER-TEXTE (werden an Hauptkommentar angehängt)
// ---------------------------------------------------------------------------

const MODIFIERS = {
  dramatic: {
    schneider: [
      " Und SCHNEIDER obendrauf — die Gegner kommen auf unter 30 Punkte, das ist eine Demontage!",
      " Schneider! Die Gegenpartei wurde förmlich vorgeführt!",
      " Noch dazu Schneider — {player} hat keine Gnade gezeigt!",
    ],
    schwarz: [
      " SCHWARZ! Kein einziger Stich für die Gegner — absolute Dominanz von {player}!",
      " Schwarz gespielt — alle Stiche für {player}, das ist historisch!",
      " SCHWARZ! Die Gegenpartei ist weggefegt worden!",
    ],
    ohne: [
      " Und das {mitOhne} {spitzen} — ohne die höchsten Trümpfe gespielt! Welch Risikobereitschaft!",
      " Ohne die Top-Trümpfe ins Spiel gegangen — und trotzdem gewonnen! Respekt!",
      " Ohne {spitzen} — ein riskantes Unterfangen, brillant durchgezogen!",
    ],
    re: [
      " Re angesagt — der Alleinspieler glaubt an sich!",
      " Mit Re — doppelte Wette, doppelter Einsatz!",
    ],
    reBock: [
      " Re und Bock — dreifacher Druck, dreifacher Jubel (oder Schmerz)!",
      " Re plus Bock — hier zittert der Kontostand!",
    ],
    reBockHirsch: [
      " Re, Bock UND Hirsch — vierfacher Spielwert, das ist das volle Risiko!",
      " Alle drei: Re, Bock, Hirsch — maximale Dramatik!",
    ],
  },

  tagesschau: {
    schneider: [
      " Zusätzlich: Schneider. Gegner unter 30 Punkte.",
      " Schneider erzielt. Bonus notiert.",
      " Schneider — Punkteaufschlag wird verbucht.",
    ],
    schwarz: [
      " Zudem: Schwarz. Kein Stich für die Gegner.",
      " Schwarz gespielt. Alle Stiche gewonnen.",
      " Schwarz — maximales Ergebnis.",
    ],
    ohne: [
      " Gespielt {mitOhne} {spitzen}.",
      " Ohne die höchsten Trümpfe gespielt.",
      " {mitOhne} {spitzen} — riskante Variante gewählt.",
    ],
    re: [
      " Re angesagt.",
      " Mit Re-Aufschlag gespielt.",
    ],
    reBock: [
      " Re und Bock aktiv.",
      " Doppelter Aufschlag durch Re und Bock.",
    ],
    reBockHirsch: [
      " Re, Bock und Hirsch — voller Aufschlag.",
      " Dreifacher Aufschlag registriert.",
    ],
  },

  bavarian: {
    schneider: [
      " Und Schneider noch dazu — die Gegnä hom weniger als 30 Punkte, des is a Blamage!",
      " Schneider! Da {player} hat's den Gegnern so richtig zeigt!",
      " Schneider obenauf — wunderbar, da {player} is in Form!",
    ],
    schwarz: [
      " Schwarz! Koa einziger Stich für die Gegnä — des is a Demontage auf Bayerisch!",
      " Schwarz gespuidt — alle Stiche für {player}, des is außergewöhnlich!",
      " Und Schwarz! Da {player} hat absolute Kontrolle ghabt!",
    ],
    ohne: [
      " Und des {mitOhne} {spitzen} noch dazu — ohne die Topp-Trümpfe, Wahnsinn!",
      " Ohne die höchsten Trümpfe gspuidt — und gwunna! Bravo, {player}!",
      " {mitOhne} {spitzen} — a riskante Geschichte, aber da {player} macht's!",
    ],
    re: [
      " Re gsagt — da {player} glaubt an sich, sowas von!",
      " Mit Re — doppelt oder nix, typisch bayerisch!",
    ],
    reBock: [
      " Re und Bock — da wackelt die Hosennaht!",
      " Re plus Bock — dreimal Spaß oder dreimal Schmerz!",
    ],
    reBockHirsch: [
      " Re, Bock und Hirsch — des is voller Einsatz, Leute!",
      " Alle drei! Re, Bock, Hirsch — da {player} geht aufs Ganze!",
    ],
  },

  fan: {
    schneider: [
      " SCHNEIDER AUCH NOCH!! Die Gegner kommen unter 30 — DAS IST EINFACH ZU GUT!!",
      " UND SCHNEIDER!! {player} zeigt KEINE GNADE!!",
      " SCHNEIDER DRAUF!! Was für ein ABEND!!",
    ],
    schwarz: [
      " SCHWAAAAARZ!!! KEIN EINZIGER STICH FÜR DIE GEGNER — DAS IST WAHNSINN!!!",
      " SCHWARZ!! ALLE STICHE!! ICH FLIPPE AUS!!",
      " UND SCHWARZ OBENDRAUF!! DAS IST HISTORISCH!!",
    ],
    ohne: [
      " Und das OHNE die Top-Trümpfe!! {player} ist VERRÜCKT und GENIAL!!",
      " {mitOhne} {spitzen} — OHNE DIE BESTEN KARTEN!! RESPEKT!!",
      " Ohne Top-Trümpfe gespielt — WER MACHT DAS BITTE!!",
    ],
    re: [
      " RE ANGESAGT!! {player} glaubt an sich — ZURECHT!!",
      " Mit RE gespielt — doppelter Mut, doppelter Applaus!!",
    ],
    reBock: [
      " RE UND BOCK!! Dreifach oder NADA!!",
      " Re plus Bock — der Kontostand bebt!!",
    ],
    reBockHirsch: [
      " RE, BOCK UND HIRSCH!! VIERFACHER WERT!! DAS IST DAS MAXIMUM!!",
      " ALLE DREI!! Re, Bock, Hirsch — TOTALER WAHNSINN!!",
    ],
  },
};

// ---------------------------------------------------------------------------
// HELPER
// ---------------------------------------------------------------------------

function getNullGroup(gameType) {
  if (gameType === "Null Ouvert Hand") return "NullOuvertHand";
  if (gameType === "Null Ouvert") return "NullOuvert";
  if (gameType === "Null Hand") return "NullHand";
  return "Null";
}

function buildCommentatorText(game, personality) {
  const p = personality;
  const gt = game.game_type;
  const won = !!game.won;

  const vars = {
    player: game.declarer ?? "",
    gameType: gt,
    points: game.points ?? 0,
    spitzen: game.spitzen ?? 1,
    mitOhne: game.mit_ohne ?? "mit",
  };

  let text;

  // Null-Varianten
  if (isNullType(gt)) {
    const nullGroup = getNullGroup(gt);
    const nullTpl = NULL_TEMPLATES[p] ?? NULL_TEMPLATES.dramatic;
    const outcome = won ? "won" : "lost";
    const pool = nullTpl[outcome]?.[nullGroup] ?? nullTpl[outcome]?.Null;
    text = fill(pickRandom(pool), vars);
  } else {
    // Farbspiele & Grand
    const tpl = COMMENTATOR_TEMPLATES[p] ?? COMMENTATOR_TEMPLATES.dramatic;
    const outcome = won ? "won" : "lost";
    const byOutcome = tpl[outcome];

    // Fan hat bei Verlust ein flaches Array (kein game-type-split)
    if (p === "fan" && !won) {
      text = fill(pickRandom(byOutcome), vars);
    } else {
      const group = gt === "Grand" ? "Grand" : "Farbe";
      const pool = byOutcome?.[group] ?? Object.values(byOutcome)[0];
      text = fill(pickRandom(Array.isArray(pool) ? pool : Object.values(pool)[0]), vars);
    }
  }

  // Modifier anhängen
  const mods = MODIFIERS[p] ?? MODIFIERS.dramatic;
  if (game.schwarz) text += fill(pickRandom(mods.schwarz), vars);
  else if (game.schneider) text += fill(pickRandom(mods.schneider), vars);
  if (game.mit_ohne === "ohne") text += fill(pickRandom(mods.ohne), vars);
  const reCount = (game.re ? 1 : 0) + (game.bock ? 1 : 0) + (game.hirsch ? 1 : 0);
  if (reCount === 3) text += fill(pickRandom(mods.reBockHirsch), vars);
  else if (reCount === 2) text += fill(pickRandom(mods.reBock), vars);
  else if (reCount === 1) text += fill(pickRandom(mods.re), vars);

  return text;
}

function buildRamschText(game, personality) {
  const p = personality;
  const rp = typeof game.ramsch_points === "string"
    ? JSON.parse(game.ramsch_points)
    : (game.ramsch_points ?? {});

  const entries = Object.entries(rp);
  const loserEntry = entries.reduce((max, cur) => (cur[1] > max[1] ? cur : max), ["?", 0]);

  const vars = {
    loser: loserEntry[0],
    loserPoints: loserEntry[1],
  };

  const pool = RAMSCH_TEMPLATES[p] ?? RAMSCH_TEMPLATES.dramatic;
  return fill(pickRandom(pool), vars);
}

function reactionChance(game) {
  let p = 0.25;
  if (game.game_type === "Grand") p += 0.25;
  if (isNullType(game.game_type)) p += 0.35;
  if (game.game_type === "Ramsch") p += 0.40;
  if (game.schwarz) p += 0.20;
  if (game.schneider) p += 0.10;
  if (game.re || game.bock || game.hirsch) p += 0.15;
  if (game.mit_ohne === "ohne") p += 0.15;
  return Math.min(p, 0.95);
}

// ---------------------------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------------------------

/**
 * Build full commentary for a Skat game.
 * @param {object} game           - game object from the API
 * @param {Array}  regPlayers     - registered players with avatar/character_type
 * @param {string} personality    - commentator personality key
 * @param {Array}  sessionHistory - full session history for context
 * @returns {{ segments: Array, spokenText: string }}
 */
export function buildFullCommentary(game, regPlayers = [], personality = "dramatic", sessionHistory = []) {
  const pers = PERSONALITIES[personality] ?? PERSONALITIES.dramatic;

  // Derive active players for this game (handles 4+ player sessions where one sits out)
  const activePLayerNames = game.active_players
    ? (typeof game.active_players === "string" ? JSON.parse(game.active_players) : game.active_players)
    : null;
  const activeRegPlayers = activePLayerNames
    ? (regPlayers ?? []).filter(p => activePLayerNames.includes(p.name))
    : (regPlayers ?? []);

  const regMap = Object.fromEntries((regPlayers ?? []).map((p) => [p.name, p]));
  const isRamsch = game.game_type === "Ramsch";
  const players = Object.keys(
    typeof game.ramsch_points === "string"
      ? JSON.parse(game.ramsch_points)
      : (game.ramsch_points ?? {})
  ).length > 0
    ? Object.keys(typeof game.ramsch_points === "string" ? JSON.parse(game.ramsch_points) : game.ramsch_points)
    : activeRegPlayers.map(p => p.name);

  // Pre-game balances from session history
  const balances = {};
  players.forEach(p => (balances[p] = 0));
  (sessionHistory ?? [])
    .filter(g => g.id !== game.id && !g.archived_at)
    .forEach(g => {
      if (g.declarer) {
        const pts = g.points ?? 0;
        const won = !!g.won;
        balances[g.declarer] = (balances[g.declarer] ?? 0) + (won ? pts : -(pts * 2));
      }
    });

  // Kommentator-Text
  const commentatorText = isRamsch
    ? buildRamschText(game, personality)
    : buildCommentatorText(game, personality);

  const segments = [{
    avatar: pers.icon,
    name: "Kommentator",
    label: pers.label,
    text: commentatorText,
  }];

  const chance = reactionChance(game);

  if (isRamsch) {
    // Ramsch: alle Spieler können reagieren (alle betroffen)
    const reactors = activeRegPlayers.filter(() => Math.random() < chance * 0.5);
    reactors.slice(0, 2).forEach(reg => {
      const charType = reg.character_type ?? "pessimist";
      const pool = PLAYER_REACTIONS[charType]?.routine_loss
                ?? PLAYER_REACTIONS.pessimist?.routine_loss;
      if (pool) {
        segments.push({
          avatar: reg.avatar ?? "🃏",
          name: reg.name,
          label: PLAYER_PERSONALITIES[charType]?.label ?? "",
          text: pickRandom(pool),
        });
      }
    });
  } else {
    // Alleinspieler reagiert
    const scenario = analyzeGameScenario(game, players, balances);
    if (Math.random() < chance) {
      const reg = regMap[game.declarer];
      const charType = reg?.character_type ?? "optimist";
      const fallback = game.won ? "routine_win" : "routine_loss";
      const pool = PLAYER_REACTIONS[charType]?.[scenario]
                ?? PLAYER_REACTIONS[charType]?.[fallback]
                ?? PLAYER_REACTIONS.optimist?.[fallback];
      if (pool) {
        segments.push({
          avatar: reg?.avatar ?? "🃏",
          name: game.declarer,
          label: PLAYER_PERSONALITIES[charType]?.label ?? "",
          text: pickRandom(pool),
        });
      }
    }

    // Ein Gegner reagiert
    if (Math.random() < chance * 0.65) {
      const opponent = activeRegPlayers.find(p => p.name !== game.declarer);
      if (opponent) {
        const charType = opponent.character_type ?? "optimist";
        const oppWon = !game.won;
        const fallback = oppWon ? "routine_win" : "routine_loss";
        const pool = PLAYER_REACTIONS[charType]?.[fallback]
                  ?? PLAYER_REACTIONS.optimist?.[fallback];
        if (pool) {
          segments.push({
            avatar: opponent.avatar ?? "🃏",
            name: opponent.name,
            label: PLAYER_PERSONALITIES[charType]?.label ?? "",
            text: pickRandom(pool),
          });
        }
      }
    }
  }

  const spokenText = segments.map(s => s.text).join(" — ");
  return { segments, spokenText };
}
