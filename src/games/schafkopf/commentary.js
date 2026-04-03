export const PERSONALITIES = {
  dramatic: { label: "Dramatischer Stadion-Reporter", icon: "🎙️", pitch: 1.2, rate: 0.95 },
  tagesschau: { label: "Nüchterner Tagesschau-Sprecher", icon: "📺", pitch: 0.88, rate: 0.78 },
  bavarian: { label: "Bayerischer Opa", icon: "🍺", pitch: 0.82, rate: 0.72 },
  fan: { label: "Aufgeregter Fan im Biergarten", icon: "🤩", pitch: 1.3, rate: 1.1 },
};

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
    won: {
      Sauspiel: [
        "UND DAAAA! {player} und {partner} spielen das Sauspiel DURCH wie eine heiße Klinge durch Butter! {spielwert} Euro pro Gegner — das schmerzt! SENSATIONELL!",
        "TOOOOOR! Nein, Entschuldigung — SAUSPIEL GEWONNEN! {player} und {partner} liefern eine MEISTERLEISTUNG ab! Die Gegner stehen fassungslos da! {spielwert} Euro wechseln den Besitzer!",
        "Was für ein TRIUMPH! Das Duo {player} und {partner} lässt die Gegner keine Chance! Das nenne ich mal ein Sauspiel! {spielwert} Euro — bitte zahlen!",
      ],
      Wenz: [
        "UNGLAUBLICH! {player} führt den Wenz durch wie ein Maestro! Solo, brutal, GNADENLOS! {spielwert} Euro kassieren die Verlierer — jeder einzelne!",
        "DAS IST EIN WENZ FÜR DIE GESCHICHTSBÜCHER! {player} zeigt keine Gnade! Die Gegner? Pulverisiert! {spielwert} Euro — zahlt gefälligst!",
        "WAS FÜR EIN AUFTRITT! {player} mit dem Wenz — souverän, dominant, UNAUFHALTSAM! {spielwert} Euro pro Nase — das tut weh!",
      ],
      Solo: [
        "UNGLAUBLICH! {player} gewinnt das Solo solo durch! Ein Maestro am Tisch! {spielwert} Euro kassiert jeder Verlierer — SENSATIONELL!",
        "DAS IST SCHAFKOPF-GESCHICHTE! {player} mit einem UNFASSBAREN Solo! Drei gegen einen — und die Drei verlieren! {spielwert} Euro — zahlt!",
        "Was für eine DARBIETUNG! {player} zieht das Solo durch wie ein Messer durch warme Butter! {spielwert} Euro pro Gegner — tschüss Portemonnaie!",
      ],
      "Wenz Tout": [
        "TOUT!!! {player} hat alles gegeben — und ALLES GENOMMEN! Ein Wenz Tout! Das ist der Olymp des Schafkopfs! {spielwert} Euro — das ist Legende!",
      ],
      "Solo Tout": [
        "TOUT!!! Solo Tout von {player}! Das sieht man einmal im Leben! Die Gegner haben nicht einen Stich geholt! {spielwert} Euro — historisch!",
      ],
    },
    lost: {
      Sauspiel: [
        "KATASTROPHE! {player} und {partner} scheitern kläglich am Sauspiel! Die Gegner reiben sich die Hände! {spielwert} Euro wechseln den Besitzer — in die falsche Richtung!",
        "Oh nein, oh nein, oh NEIN! Das Sauspiel von {player} und {partner} bricht zusammen wie ein Kartenhaus! {spielwert} Euro weg — einfach weg!",
        "Was für ein DESASTER! {player} und {partner} verlieren das Sauspiel! Die Gegner feiern! {spielwert} Euro — verloren!",
      ],
      Wenz: [
        "DAS GIBT ES NICHT! {player} verliert den Wenz! Allein gegen alle — und verloren! {spielwert} Euro pro Gegner — das tut DOPPELT weh!",
        "ZUSAMMENBRUCH! {player} scheitert mit dem Wenz! Das war nichts! {spielwert} Euro — weg, weg, WEG!",
        "Was für eine BLAMAGE! {player} verliert den Wenz! Die Gegner tanzen! {spielwert} Euro — zahlen bitte!",
      ],
      Solo: [
        "NIEDERLAGE! {player} verliert das Solo! Solo angesagt und solo gescheitert! {spielwert} Euro zahlt {player} an JEDEN Gegner — das schmerzt gewaltig!",
        "Eine KATASTROPHE mit Ansage! {player} verliert das Solo! {spielwert} Euro — dreifach fällig! Das ist teuer!",
        "Oh, was für ein ABSTURZ! {player} scheitert mit dem Solo! {spielwert} Euro pro Gegner — die Gegner freuen sich königlich!",
      ],
      "Wenz Tout": [
        "DER ABSTURZ DES JAHRES! {player} verliert den Wenz Tout! So hoch gespielt, so tief gefallen! {spielwert} Euro — das ist ein BLUTBAD!",
      ],
      "Solo Tout": [
        "HISTORISCHE NIEDERLAGE! {player} verliert das Solo Tout! Das werden sie noch in zehn Jahren erzählen! {spielwert} Euro — zahlen und schweigen!",
      ],
    },
  },

  tagesschau: {
    won: {
      Sauspiel: [
        "{player} und {partner} haben das Sauspiel gewonnen. Die Verluste der Gegenpartei belaufen sich auf {spielwert} Euro pro Person.",
        "Das Sauspiel wurde von {player} und {partner} gewonnen. Jeder Gegner zahlt {spielwert} Euro. Die Bilanz ist eindeutig.",
        "Meldung: {player} und {partner} gewinnen das Sauspiel. Finanzieller Schaden für die Gegner: {spielwert} Euro je Person.",
      ],
      Wenz: [
        "{player} hat den Wenz gewonnen. Jeder Gegner schuldet {spielwert} Euro. Die Zahlen sprechen für sich.",
        "Der Wenz wurde gespielt. {player} hat gewonnen. {spielwert} Euro je Gegner. Mehr gibt es dazu nicht zu sagen.",
      ],
      Solo: [
        "{player} hat das Solo gewonnen. Jeder der drei Gegner zahlt {spielwert} Euro. Der Spielstand hat sich entsprechend verändert.",
        "Solo gewonnen. Spieler: {player}. Kosten für die Gegner: {spielwert} Euro. Stand: aktualisiert.",
      ],
      "Wenz Tout": [
        "{player} hat einen Wenz Tout gespielt und gewonnen. Jeder Gegner zahlt {spielwert} Euro. Das ist statistisch bemerkenswert.",
      ],
      "Solo Tout": [
        "Ein Solo Tout von {player}. Gewonnen. Kosten für die Gegner: {spielwert} Euro. Weitere Kommentare erübrigen sich.",
      ],
    },
    lost: {
      Sauspiel: [
        "{player} und {partner} haben das Sauspiel verloren. Jeder zahlt {spielwert} Euro an die Gegenpartei. So ist es.",
        "Das Sauspiel von {player} und {partner} ist gescheitert. Verlust: {spielwert} Euro pro Person. Das ist der aktuelle Stand.",
        "Meldung: Sauspiel verloren. Spieler: {player} und {partner}. Kosten: {spielwert} Euro. Keine weiteren Details.",
      ],
      Wenz: [
        "{player} hat den Wenz verloren. Jeder Gegner erhält {spielwert} Euro. Das Ergebnis ist dokumentiert.",
        "Der Wenz von {player} ist gescheitert. {spielwert} Euro an jeden Gegner. So ist es.",
      ],
      Solo: [
        "{player} hat das Solo verloren. {spielwert} Euro werden an jeden Gegner gezahlt. Der Tisch registriert es.",
        "Niederlage im Solo. {player}. Kosten: {spielwert} Euro je Gegner. Weiter.",
      ],
      "Wenz Tout": [
        "{player} hat den Wenz Tout verloren. {spielwert} Euro pro Gegner. Das ist ein erheblicher Verlust.",
      ],
      "Solo Tout": [
        "{player} hat das Solo Tout verloren. Kosten: {spielwert} Euro pro Gegner. Die Zahlen sind, wie sie sind.",
      ],
    },
  },

  bavarian: {
    won: {
      Sauspiel: [
        "Jo schau, des hod da {player} mit dem {partner} scho hinkriagt. {spielwert} Euro — des is hoid so.",
        "Na bitte! Da {player} und da {partner} ham des Sauspiel gwunna. Die Gögner kinna jetzt {spielwert} Euro rausruckn.",
        "Heast, des war gar ned so dumm vum {player} und {partner}! {spielwert} Euro — zahln!",
      ],
      Wenz: [
        "Jo mei, da {player} hod an Wenz gmacht. Hod sogar gwunna. {spielwert} Euro — des ko ma scho sagn.",
        "Bravoo! Da {player} mit sein Wenz — hoid durchzogn! {spielwert} Euro, Buam, zahln!",
        "Na, des war a saubere Leistung vum {player}! Wenz gwunna! {spielwert} Euro pro Gögner — schee wars.",
      ],
      Solo: [
        "Jessas, da {player} hod a Solo durchzogn! Alloa gegen alle drei — und gwunna! {spielwert} Euro — des is scho was!",
        "Sapperment! Da {player} mit sein Solo — hoid durchgezogn! {spielwert} Euro — zahlen bitte, gell!",
        "Jo freilich, da {player} gewinnt des Solo! Was sonst! {spielwert} Euro — des kennt ma.",
      ],
      "Wenz Tout": [
        "Heiligs Blechle! Da {player} spielt an Wenz Tout — und GWINNTS! {spielwert} Euro — des passiert ned alle Tog!",
      ],
      "Solo Tout": [
        "Kruzifix! Solo Tout und gwunna! Da {player} ist a Wahnsinniger! {spielwert} Euro — des schreibt ma auf!",
      ],
    },
    lost: {
      Sauspiel: [
        "Jo mei, des hod halt ned soin sein. Da {player} und da {partner} ham verlorn. {spielwert} Euro hin is {spielwert} Euro hin.",
        "Hm. Des Sauspiel vum {player} und {partner} is danebengegangen. {spielwert} Euro — muss ma zoin, gell.",
        "Na schau, ned jedes Sauspiel geht auf. Da {player} und da {partner} müssn jetzt {spielwert} Euro rausruckn.",
      ],
      Wenz: [
        "Da {player} hod halt seinen Wenz verlorn. Passiert. {spielwert} Euro — des schmerzt scho a bissl.",
        "Jo mei. Wenz verlorn. Da {player} schaut jetzt a bissl blöd. {spielwert} Euro — zahln und guad is.",
        "Schad eigentlich. Da {player} hod den Wenz ned hinkriagt. {spielwert} Euro weg — des is hoid so.",
      ],
      Solo: [
        "Ojeoje. Da {player} hod sein Solo verlorn. Alloa gegen alle drei — und verlorn. {spielwert} Euro — des tuat weh.",
        "Heast, des war nix vum {player}. Solo verlorn, {spielwert} Euro hin. Des nächste Moi besser!",
        "Jo mei, des Solo vom {player} war halt nix. {spielwert} Euro — zahln und weitermachn.",
      ],
      "Wenz Tout": [
        "Herrschaftszeiten! Da {player} verliert an Wenz Tout! {spielwert} Euro — des is a teurer Spaß!",
      ],
      "Solo Tout": [
        "Kruzifix nochmal! Solo Tout verlorn! Da {player} schaut aus wie a begossener Pudel. {spielwert} Euro — heilixs Blechle!",
      ],
    },
  },

  fan: {
    won: {
      Sauspiel: [
        "WAAAS! Das Sauspiel gewonnen?! Servus, das war ja gnadenlos! {player} und {partner} — ihr seid meine Helden! {spielwert} Euro, zahlt's!",
        "Ohhh mein Gott, Ohhh mein Gott! {player} und {partner} gewinnen das Sauspiel! Ich fass es nicht! {spielwert} Euro — AUF WIEDERSEHEN!",
        "JAAAAAA! Das gibt's nicht! {player} und {partner} haben's durchgebracht! {spielwert} Euro — nehmt's euch, ihr habt's verdient!",
      ],
      Wenz: [
        "WAHNSINN! EIN WENZ! UND GEWONNEN! {player}, du Legende! {spielwert} Euro — das ist doch irre!",
        "Ich dreh durch! {player} gewinnt den Wenz! Das ist ja nicht mehr normal! {spielwert} Euro pro Gegner — schmerzhaft!",
        "OH MEIN GOTT! Wenz gewonnen! {player} ist ein Gott! {spielwert} Euro — bezahlt das sofort!",
      ],
      Solo: [
        "NEEEIN! Solo gewonnen?! {player}, du bist nicht normal! Drei gegen einen und der eine gewinnt! {spielwert} Euro — unglaublich!",
        "ICH FASS' DAS NICHT! Solo! Gewonnen! {player} ist ein Phänomen! {spielwert} Euro pro Gegner — das hat sich ausgezahlt!",
        "JUHUUU! {player} macht das Solo und gewinnt! Das ist ja Wahnsinn! {spielwert} Euro — Prost auf den Sieger!",
      ],
      "Wenz Tout": [
        "TOUT?! WENZ TOUT UND GEWONNEN?! {player}, du bist ein absolutes Genie! {spielwert} Euro — DAS IST UNVERGESSLICH!",
      ],
      "Solo Tout": [
        "ICH KANN ES NICHT GLAUBEN! Solo Tout! GEWONNEN! {player} ist ein Schafkopf-Gott! {spielwert} Euro — LEGENDE!",
      ],
    },
    lost: [
      "Oh nein, oh nein, oh nein! {player} verliert! Das darf doch nicht wahr sein! {spielwert} Euro weg!",
      "NOOOO! Verloren! Wie kann das passieren?! {spielwert} Euro — weg, einfach weg!",
      "Aaaargh! Das tut weh! {spielwert} Euro futsch! Ich sehe das nicht gerne, aber gut...",
      "Herrje! {player} verliert! {spielwert} Euro — das ist ein schwarzer Tag!",
    ],
  },
};

const MODIFIERS = {
  dramatic: {
    schneider: [
      " Und obendrauf: SCHNEIDER! Die Demütigung ist komplett!",
      " SCHNEIDER noch dazu! Als ob die Niederlage nicht schon genug wäre!",
    ],
    schwarz: [
      " SCHWARZ! Kein einziger Stich für die Verlierer! HISTORISCH!",
      " UND SCHWARZ! Das sieht man einmal im Leben!",
    ],
    laufende: [
      " Dazu {laufende} Laufende! Das ist eine Abrechnung ohne Gnade!",
      " {laufende} Laufende obendrauf — das macht es nur noch schlimmer!",
    ],
    bock: [" Und das alles in einer BOCKRUNDE mit Faktor {bock}! Das schmerzt doppelt!"],
    klopfer: [" Plus Klopfer! Die Dreistigkeit zahlt sich aus — oder nicht!"],
  },
  tagesschau: {
    schneider: [" Zusätzlich: Schneider. Die Gegner hatten weniger als 31 Punkte."],
    schwarz: [" Schwarz. Die Gegner gewannen keinen einzigen Stich."],
    laufende: [" {laufende} Laufende wurden gewertet."],
    bock: [" Es handelt sich um eine Bockrunde (Faktor {bock})."],
    klopfer: [" Ein Klopfer wurde berücksichtigt."],
  },
  bavarian: {
    schneider: [" Und Schneider dazu — des war ned schee."],
    schwarz: [" Schwarz! Koa einziger Stich — des is scho extrem."],
    laufende: [" {laufende} Laufende noch dazu, jo mei."],
    bock: [" Is a Bockrunde, ×{bock} — des macht's teurer."],
    klopfer: [" Und a Klopfer dabei — hm."],
  },
  fan: {
    schneider: [" UND SCHNEIDER! Als wäre das nicht genug!"],
    schwarz: [" SCHWARZ! Unglaublich! Kein einziger Stich!"],
    laufende: [" {laufende} Laufende obendrauf — stop, das wird zu viel!"],
    bock: [" Bockrunde ×{bock}! Der Schmerz ist {bock}fach!"],
    klopfer: [" Klopfer! Die Frechheit!"],
  },
};

// ---------------------------------------------------------------------------
// PLAYER REACTION TEMPLATES
// ---------------------------------------------------------------------------

const PLAYER_REACTIONS = {
  dramatic: {
    won: [
      "Ja, das war ich! Hat jemand etwas anderes erwartet?!",
      "CHAMPION! Das ist meine Bühne!",
      "Grandios, ich weiß. Danke, danke, kein Applaus nötig.",
      "Das nenne ich mal ein Spiel! Ich bin beeindruckt — von mir selbst!",
      "So läuft das hier. Merkt euch das.",
    ],
    lost: [
      "Das ist ein SKANDAL! Ich fordere eine Neuauszählung!",
      "Unglaublich! Das war Sabotage!",
      "Ich verlange eine Erklärung für diese Schande!",
      "Das war... strategisch. Ja. Strategisch verloren.",
      "Beim nächsten Mal gewinne ICH. Das steht fest.",
    ],
  },
  tagesschau: {
    won: [
      "Die Berechnung war korrekt. Das Spiel ist gewonnen.",
      "Ergebnis: positiv. Weiter.",
      "Das Ergebnis entspricht meiner Erwartung.",
      "Zufriedenstellend. Weiter.",
    ],
    lost: [
      "Das Ergebnis ist zur Kenntnis genommen.",
      "Verlust verbucht. Nächstes Spiel.",
      "Die Zahlen sind eindeutig. Ich akzeptiere das.",
      "So ist es. Weiter.",
    ],
  },
  bavarian: {
    won: [
      "Jo, hob i ma glei dacht!",
      "Freilich! Was sonst!",
      "Des war a schene Partie, muss i sagn.",
      "Ja mei, dann hoid so.",
      "Heast, des war sauguad!",
    ],
    lost: [
      "Jo mei. Halt ned mein Tog.",
      "Des war halt nix. Nächste Runde.",
      "Hm. Passiert. Schad.",
      "Naja, des Leben geht weida.",
    ],
  },
  fan: {
    won: [
      "JAAAA! Das ist mein Moment! Ich liebe dieses Spiel!",
      "Habe ich euch nicht gesagt, dass ich gewinne?!",
      "OH WOW! Das war so gut! Ich bin so gut!",
      "Unglaublich! Nein! Doch! Oh!",
    ],
    lost: [
      "NOOO! Das ist nicht fair! Das war Pech!",
      "Ich fasse es nicht! Nächste Runde gehört mir!",
      "Ugh! Nein! Aber gut... nächstes Mal!",
      "Das kann nicht sein! Das KANN NICHT SEIN!",
    ],
  },
};

// Opponent reactions (winner's perspective = their team won/lost the round)
const OPPONENT_REACTIONS = {
  dramatic: {
    won: [
      "Hervorragend! Wir haben sie zerstört!",
      "Das ist GERECHTIGKEIT! Uns aufhalten? Unmöglich!",
      "Das Ergebnis war nie in Frage. Nie.",
    ],
    lost: [
      "Glück gehabt. Nur Glück.",
      "Das war Glück. Das nächste Mal gewinnen WIR.",
      "Genießt es. Es wird nicht wieder passieren.",
    ],
  },
  tagesschau: {
    won: [
      "Das Ergebnis ist erfreulich.",
      "Gewonnen. Gut.",
      "Der Ausgang war absehbar.",
    ],
    lost: [
      "Verlust akzeptiert.",
      "Schade. Aber so ist es.",
      "Das Ergebnis wird dokumentiert.",
    ],
  },
  bavarian: {
    won: [
      "Jo, hab i ma dacht! Schee!",
      "Freilich ham mia gwunna!",
      "Heast, des war leiwand!",
    ],
    lost: [
      "Na, des war nix. Oba gut.",
      "Schad. Nächstes Moi.",
      "Jo mei, so is des hoid.",
    ],
  },
  fan: {
    won: [
      "YESSS! Wir haben gewonnen! Wir sind die Besten!",
      "HA! Das geschieht euch recht!",
      "Ich bin AUSSER MIR! Was ein Spiel!",
    ],
    lost: [
      "Oh komm schon! Das war so knapp!",
      "Nein nein nein! Nächste Runde!",
      "Ich glaub's nicht! Wie kann das passieren?!",
    ],
  },
};

// ---------------------------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------------------------

function buildCommentatorText(game, personality) {
  const p = personality;
  const templates = COMMENTATOR_TEMPLATES[p] ?? COMMENTATOR_TEMPLATES.dramatic;
  const outcome = game.won ? "won" : "lost";

  let mainTemplates;
  if (p === "fan" && !game.won) {
    mainTemplates = templates.lost;
  } else {
    const byOutcome = templates[outcome];
    mainTemplates = byOutcome?.[game.type] ?? byOutcome?.["Solo"] ?? Object.values(byOutcome)[0];
  }

  const vars = {
    player: game.player,
    partner: game.partner ?? "",
    type: game.type,
    spielwert: (game.spielwert ?? 0).toFixed(2),
    seq: game.seq,
    laufende: game.laufende,
    bock: game.bock,
  };

  let text = fill(pickRandom(mainTemplates), vars);

  const mods = MODIFIERS[p] ?? MODIFIERS.dramatic;
  if (game.schneider) text += fill(pickRandom(mods.schneider), vars);
  if (game.schwarz) text += fill(pickRandom(mods.schwarz), vars);
  if (game.laufende > 0) text += fill(pickRandom(mods.laufende), vars);
  if (game.bock > 1) text += fill(pickRandom(mods.bock), vars);
  if (game.klopfer?.length > 0) text += fill(pickRandom(mods.klopfer), vars);

  return text;
}

// How likely player reactions are, based on how dramatic the game was
function reactionChance(game) {
  let p = 0.30; // base for a plain Sauspiel
  if (game.type === "Solo Tout" || game.type === "Wenz Tout") p += 0.50;
  else if (game.type === "Solo" || game.type === "Wenz") p += 0.28;
  if (game.schwarz) p += 0.25;
  if (game.schneider) p += 0.10;
  if ((game.laufende ?? 0) >= 3) p += 0.12;
  if ((game.bock ?? 1) > 1) p += 0.10;
  if ((game.klopfer?.length ?? 0) > 0) p += 0.10;
  return Math.min(p, 0.95);
}

/**
 * Build the full commentary for one game as an array of segments.
 * Each segment has: { avatar, name, label, text }
 * The returned object also has a `spokenText` field for TTS.
 *
 * @param {object} game        - the game object from the API
 * @param {Array}  regPlayers  - registered players array (for avatar/character_type lookup)
 * @param {string} personality - commentator personality key
 * @returns {{ segments: Array, spokenText: string }}
 */
export function buildFullCommentary(game, regPlayers = [], personality = "dramatic") {
  const pers = PERSONALITIES[personality] ?? PERSONALITIES.dramatic;
  const regMap = Object.fromEntries((regPlayers ?? []).map((p) => [p.name, p]));
  const isSauspiel = game.type === "Sauspiel";
  const partnerName = isSauspiel ? game.partner : null;

  const segments = [
    {
      avatar: pers.icon,
      name: "Kommentator",
      label: pers.label,
      text: buildCommentatorText(game, personality),
    },
  ];

  const chance = reactionChance(game);

  // Declarer reaction
  if (Math.random() < chance) {
    const reg = regMap[game.player];
    const charType = reg?.character_type ?? "dramatic";
    const pool = (PLAYER_REACTIONS[charType] ?? PLAYER_REACTIONS.dramatic)[game.won ? "won" : "lost"];
    segments.push({
      avatar: reg?.avatar ?? "🃏",
      name: game.player,
      label: PERSONALITIES[charType]?.label ?? "",
      text: pickRandom(pool),
    });
  }

  // Opponent reaction (slightly lower chance than declarer)
  if (Math.random() < chance * 0.75) {
    const opponentReg = (regPlayers ?? []).find(
      (p) => p.name !== game.player && p.name !== partnerName
    );
    if (opponentReg) {
      const charType = opponentReg.character_type ?? "dramatic";
      const opponentWon = !game.won;
      const pool = (OPPONENT_REACTIONS[charType] ?? OPPONENT_REACTIONS.dramatic)[opponentWon ? "won" : "lost"];
      segments.push({
        avatar: opponentReg.avatar ?? "🃏",
        name: opponentReg.name,
        label: PERSONALITIES[charType]?.label ?? "",
        text: pickRandom(pool),
      });
    }
  }

  const spokenText = segments.map((s) => s.text).join(" — ");
  return { segments, spokenText };
}
