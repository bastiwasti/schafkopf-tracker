import { PERSONALITIES, pickRandom, fill } from "../shared/commentary.js";
import { PLAYER_PERSONALITIES, PLAYER_REACTIONS } from "../shared/playerPersonalities.js";

const COMMENTATOR_TEMPLATES = {
  dramatic: {
    Normal: {
      won: [
        "UND DA IST ES! {player} und {partner} brechen den Widerstand — die Gegenspieler kapitulieren bedingungslos!",
        "Was für eine Machtdemonstration! {player} orchestriert das Spiel wie ein Dirigent — am Ende steht der verdiente Sieg!",
        "Meisterwerk! {player} mit {partner} — präzise, gnadenlos, unaufhaltsam. Die Gegenspieler hatten nie eine Chance!",
        "Das war kein Spiel — das war eine Hinrichtung! {player} und {partner} lassen nichts anbrennen!",
        "Nerven aus Stahl! {player} führt das Duo zum Triumph — die Gegenspieler wissen nicht mehr, was sie getroffen hat!",
      ],
      lost: [
        "Das Kartenhaus fällt! {player} und {partner} kämpfen tapfer — aber die Gegenspieler sind heute schlicht nicht zu stoppen!",
        "Bittere Niederlage! {player} gibt alles, doch es reicht nicht — das Blatt war gegen sie!",
        "Drama pur! {player} und {partner} scheitern — man sah es kommen und konnte es nicht verhindern. Tragisch!",
        "Was für ein Absturz! {player} hält die Karten, aber die Karten halten nicht zurück. Gnadenlose Niederlage!",
        "Die Gegenspieler dominieren jeden Stich — {player} und {partner} stehen mit leeren Händen da. Schmerzhaft!",
      ],
    },
    Solo: {
      won: [
        "UNGLAUBLICH! {player} wagt das Solo — und zieht es durch wie ein Uhrwerk! Drei Gegner, ein Sieger!",
        "Das Publikum hält den Atem an — {player} allein gegen alle drei. Und gewinnt. Legende!",
        "Solo gewonnen! {player} hat heute nicht Doppelkopf gespielt — {player} hat Kunst betrieben!",
        "Was für ein Wahnsinniger! {player} nimmt es mit allen auf — und lacht am Ende als Einziger!",
        "Drei gegen einen — und der eine gewinnt. {player} schreibt heute Geschichte am Kartentisch!",
      ],
      lost: [
        "Das Solo bricht zusammen! {player} wollte Held sein — jetzt zahlt er den Preis der Kühnheit!",
        "Zu riskant, zu mutig, zu teuer! {player} scheitert im Solo — die drei Gegner nehmen keine Gefangenen!",
        "Der Traum vom Solo-Sieg platzt! {player} kämpft, aber drei gegen einen ist eben manchmal einfach drei gegen einen!",
        "So nah und doch so fern! {player} greift nach dem Solo-Triumph — und greift ins Leere. Fataler Fehler!",
        "Die Hybris wird bestraft! {player} dachte, er braucht niemanden — die Gegenspieler belehren ihn eines Besseren!",
      ],
    },
  },
  tagesschau: {
    Normal: {
      won: [
        "Die Spielerpartei unter {player} setzte sich in dieser Runde durch. Die Gegenspieler unterlagen.",
        "{player} und {partner} gewannen die Partie. Der Ausgang war letztlich eindeutig.",
        "Sieg für die Spieler. {player} führte die Partei an und ließ den Gegner keine Mittel.",
        "Die Partie endete zugunsten von {player} und {partner}. Gegenseite ohne Erwiderung.",
        "Nach regulärem Spielverlauf: Sieg der Spieler. Ansager {player} erfüllte die Aufgabe.",
      ],
      lost: [
        "Die Spieler um {player} unterlagen. Die Gegenseite nutzte ihre Chancen konsequent.",
        "{player} und {partner} konnten die Niederlage nicht abwenden. Gegenspieler siegten.",
        "Niederlage für die Spieler. {player} blieb die entscheidenden Stiche verwehrt.",
        "Der Ausgang dieser Partie geht an die Gegenspieler. {player} hatte keine tragfähige Grundlage.",
        "Die Spielerpartei verlor. Ansager {player} konnte das Blatt nicht zu seinen Gunsten wenden.",
      ],
    },
    Solo: {
      won: [
        "{player} gewann das Solospiel. Alle drei Gegenspieler unterlagen dem Alleinspieler.",
        "Das Solospiel von {player} endete erfolgreich. Drei Gegner blieben ohne Stich-Mehrheit.",
        "{player} setzte sich im Solo durch. Bemerkenswert angesichts der numerischen Unterlegenheit.",
        "Solo-Sieg für {player}. Die Gegenspieler fanden kein wirksames Mittel gegen den Alleinspieler.",
        "Das Solo wurde erfolgreich zu Ende gespielt. {player} ließ den Gegnern keine Lücke.",
      ],
      lost: [
        "{player} verlor das Solospiel. Die drei Gegenspieler nutzten ihre zahlenmäßige Überlegenheit.",
        "Das Solospiel von {player} scheiterte. Niederlage für den Alleinspieler.",
        "{player} unterlag im Solo. Die Gegenspieler agierten koordiniert und effektiv.",
        "Solo-Niederlage für {player}. Das Risiko des Alleingangs wurde nicht belohnt.",
        "Das Solo misslang. {player} fand keinen Weg durch die gegnerische Abwehr.",
      ],
    },
  },
  bavarian: {
    Normal: {
      won: [
        "Mia san mia! {player} und {partner} spielen auf und gewinnen — des war a saubere Leistung, Buam!",
        "Ja Servus! {player} haut's raus — die Gegenspieler staunen noch, und's Geld is scho weg!",
        "So schaut's aus! {player} mit {partner} — die Karten haben gsprochen und die Gegner ham zuhört!",
        "Vergelt's Gott! {player} und {partner} ham heit alles richtig gmacht — des war wie a Brotzeit, wo nix übrig bleibt!",
        "Heast, des war fein! {player} spielt auf und {partner} macht's fertig — die Gegenspieler keman ned dagegen an!",
      ],
      lost: [
        "Na servas! {player} und {partner} verlieren — des war heit ned's Gelbe vom Ei, gell?",
        "Oi, des war nix! {player} schaut drein wie a Häufchen Elend — die Gegenspieler lachen si kaputt!",
        "So a Schmarrn! {player} und {partner} ham si ins eigene Knie gschossen — Niederlage, was sonst!",
        "Mei, {player} — heit war der Hut ned auf! Die Gegenspieler ham's gscheid ausgnutzt, des muss ma sagn!",
        "Des war a Watschn! {player} und {partner} verlieren und die Gegenspieler ham's ned amal schwer ghabt!",
      ],
    },
    Solo: {
      won: [
        "Oida! {player} macht's Solo und räumt auf — drei gegen oan, und der oane macht's! Des is Wahnsinn, I sag's euch!",
        "Donnawetter nochmal! {player} spielt alloa gegen alle und gewinnt — des is koa Spui mehr, des is Kunst!",
        "Ja mei, {player}! Drei Gegner und a gsundes Blatt — des reicht halt wenn ma koa Angst kennt!",
        "So a Hund, der {player}! Alloa gegen alle drei und gewinnt — I kauf dem oan a Bier, des hat er sich verdient!",
        "Des gibts doch ned! {player} spielt Solo und alle drei stehen mit de Mäuler offen — bravo, Meister!",
      ],
      lost: [
        "Na des war nixe! {player} wagt's Solo — und verliert. Hochmut kommt halt vor dem Fall, auch beim Doppelkopf!",
        "Oi weh, {player}! Solo ist riskant, des weiß ma doch — aber manchmal muss ma's halt lerna auf die harte Tour!",
        "Des war a Griff ins Klo! {player} glaubt er schafft's alloa — und die drei Gegner zeigen ihm, dass er's ned schafft!",
        "So schaut's aus wenn's schiefgeht! {player} verliert das Solo — nächstes Mal lieber a Sauspiel spieln, gell?",
        "Ha, {player}! Solo verlorn — des kost' was! Aba nix für unguat, nächste Runde wird's besser. Vielleicht.",
      ],
    },
  },
  fan: {
    Normal: {
      won: [
        "JAAAAAA!! {player} UND {partner} MACHEN ES!! ICH FLIPPE AUS!! DAS WAR SO GEIL!!",
        "ICH KANN ES KAUM GLAUBEN!! {player} führt die Spieler zum SIEG!! Das ist ja WUNDERSCHÖN!!",
        "SO EIN SPIEL!! {player} mit {partner} — perfekt gespielt!! Ich habe Gänsehaut!! GÄNSEHAUT!!",
        "TRAUMHAFT!! {player} und {partner} sind heute einfach UNBESIEGBAR!! Die Gegner kommen nicht ran!!",
        "Das war MAGIE!! {player} und {partner} spielen wie ein Uhrwerk!! ICH LIEBE DIESES SPIEL!!",
      ],
      lost: [
        "NOOOO!! {player} und {partner} verlieren!! Ich bin am BODEN!! Das tut physisch weh!!",
        "Wie kann das passieren?! {player} und {partner} geben ihr Bestes und VERLIEREN TROTZDEM!! UNFAIR!!",
        "ICH SCHAU NICHT HIN!! {player} verliert!! Das darf doch nicht wahr sein!! Mein Herz!!",
        "Katastrophe in Zeitlupe!! {player} und {partner} kämpfen — aber die Gegner sind heute einfach besser!! WEH!!",
        "WARUM?! {player} hat alles gegeben!! Und trotzdem!! Das Leben ist so ungerecht!! SO UNGERECHT!!",
      ],
    },
    Solo: {
      won: [
        "EIN SOLO!! UND {player} GEWINNT!! ICH WERDE ZEUGE EINES WUNDERS!! DREI GEGEN EINEN!!",
        "DAS IST NICHT REAL!! {player} SCHLÄGT ALLE DREI!! Das ist das Verrückteste was ich je gesehen habe!!",
        "SOLO-SIEG FÜR {player}!! Ich ruf meine Mutter an!! Sie muss das wissen!! HISTORISCH!!",
        "LEGENDS NEVER DIE!! {player} macht das Solo und GEWINNT!! Ich hab Tränen in den Augen!! TRÄNEN!!",
        "DREI GEGEN EINEN UND {player} GEWINNT!! Ich kann nicht mehr!! Ich bin fertig!! Fertig vor Begeisterung!!",
      ],
      lost: [
        "Das Solo geht verloren!! {player} bricht mir das Herz!! SO TRAGISCH!! SO VERDAMMT TRAGISCH!!",
        "NOOOO!! {player} verliert das Solo!! Ich hatte so gehofft!! Drei gegen einen war zu viel!! WARUM!!",
        "DRAMAAAA!! {player} kämpft bis zum Ende — aber das Ende ist eine Niederlage!! Ich bin am Boden!!",
        "Das war knapp und trotzdem verloren!! {player}!! Ich leid mit dir!! So ein Mist!! SO EIN MIST!!",
        "Solo verloren!! {player} hat alles riskiert!! Alles!! Und verliert trotzdem!! Das Schicksal ist grausam!!",
      ],
    },
  },
};


function buildCommentatorText(game, personality) {
  const tmpl = COMMENTATOR_TEMPLATES[personality] ?? COMMENTATOR_TEMPLATES.dramatic;
  const byType = tmpl[game.type] ?? tmpl["Normal"];
  const byOutcome = game.won ? byType.won : byType.lost;
  const template = pickRandom(byOutcome);
  return fill(template, { player: game.player, partner: game.partner ?? "Partner" });
}

function buildKontraNote(game, personality) {
  if (!game.kontra && !game.ansage) return null;
  const parts = [];
  if (game.kontra) parts.push("Kontra");
  if (game.ansage) {
    const labels = { keine30: "Keine 30", keine60: "Keine 60", keine90: "Keine 90", schwarz: "Schwarz" };
    parts.push(labels[game.ansage] ?? game.ansage);
  }
  const ansageStr = parts.join(" + ");
  const notes = {
    dramatic: `Und das mit ${ansageStr} angesagt! Der Einsatz war hoch — und jemand bezahlt dafür!`,
    tagesschau: `Zu vermerken: ${ansageStr} wurde angesagt. Dies erhöhte den Spielwert entsprechend.`,
    bavarian: `Und des bei ${ansageStr}! Da war's dann scho a bissl ernster, gell!`,
    fan: `UND ${ansageStr.toUpperCase()} WAR ANGESAGT!! DER EINSATZ WAR RIESIG!! WAHNSINN!!`,
  };
  return notes[personality] ?? notes.dramatic;
}

function buildSonderNote(game, personality) {
  const re = game.re_sonderpunkte ?? {};
  const ko = game.kontra_sonderpunkte ?? {};
  const reItems = [];
  const koItems = [];
  if (re.fuchs > 0) reItems.push(`${re.fuchs}× Fuchs`);
  if (re.doppelkopf > 0) reItems.push(`${re.doppelkopf}× Doppelkopf`);
  if (re.karlchen > 0) reItems.push("Karlchen");
  if (ko.fuchs > 0) koItems.push(`${ko.fuchs}× Fuchs`);
  if (ko.doppelkopf > 0) koItems.push(`${ko.doppelkopf}× Doppelkopf`);
  if (ko.karlchen > 0) koItems.push("Karlchen");
  if (reItems.length === 0 && koItems.length === 0) return null;

  const reStr = reItems.length > 0 ? `Spieler: ${reItems.join(", ")}` : null;
  const koStr = koItems.length > 0 ? `Gegenspieler: ${koItems.join(", ")}` : null;
  const combined = [reStr, koStr].filter(Boolean).join(" — ");

  const notes = {
    dramatic: `Sonderpunkte! ${combined}. Das dreht die Abrechnung nochmal auf links!`,
    tagesschau: `Sonderpunkte wurden verbucht: ${combined}.`,
    bavarian: `Und dann noch Sonderpunkte — ${combined}. Des macht beim Abrechnen dann scho was aus!`,
    fan: `SONDERPUNKTE!! ${combined.toUpperCase()}!! NOCH MEHR SPANNUNG!! ICH HALTS KAUM AUS!!`,
  };
  return notes[personality] ?? notes.dramatic;
}

export function buildFullCommentary(game, regPlayers = [], personality = "dramatic", _sessionHistory = []) {
  const pers = PERSONALITIES[personality] ?? PERSONALITIES.dramatic;

  const mainText = buildCommentatorText(game, personality);
  const kontraNote = buildKontraNote(game, personality);
  const sonderNote = buildSonderNote(game, personality);

  const fullText = [mainText, kontraNote, sonderNote].filter(Boolean).join(" ");
  const segments = [{ avatar: pers.icon, name: "Kommentator", label: pers.label, text: fullText }];

  // Player reactions
  const reactionChance = game.type === "Solo" ? 0.65 : game.kontra ? 0.40 : 0.20;
  const involvedPlayers = [game.player, game.partner].filter(Boolean);
  const reactingPlayer = involvedPlayers[Math.floor(Math.random() * involvedPlayers.length)];

  if (Math.random() < reactionChance && reactingPlayer) {
    const regPlayer = (regPlayers ?? []).find((p) => p.name === reactingPlayer);
    const charType = regPlayer?.character_type ?? "optimist";
    const reactionPool = PLAYER_REACTIONS[charType] ?? PLAYER_REACTIONS.optimist;

    // Pick scenario based on game context
    let scenarioKey;
    if (game.type === "Solo") {
      scenarioKey = game.won ? "high_solo_win" : "dramatic_loss";
    } else if (game.kontra || game.ansage) {
      scenarioKey = game.won ? "dramatic_win" : "dramatic_loss";
    } else {
      scenarioKey = game.won ? "routine_win" : "routine_loss";
    }

    const outcomePool = reactionPool[scenarioKey] ?? (game.won ? reactionPool.routine_win : reactionPool.routine_loss) ?? [];
    if (outcomePool.length > 0) {
      const reaction = pickRandom(outcomePool);
      segments.push({
        avatar: regPlayer?.avatar ?? "🃏",
        name: reactingPlayer,
        label: PLAYER_PERSONALITIES[charType]?.label ?? "",
        text: typeof reaction === "function" ? reaction() : reaction,
      });
    }
  }

  return { segments };
}
