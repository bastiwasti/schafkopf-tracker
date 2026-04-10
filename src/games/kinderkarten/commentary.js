import { PERSONALITIES, pickRandom, fill } from '../shared/commentary.js';
import { PLAYER_PERSONALITIES, PLAYER_REACTIONS } from '../shared/playerPersonalities.js';
import { analyzeKinderkartenScenario, buildTemplateVars, KINDERKARTEN_SCENARIOS } from './roundScenarios.js';

export { PERSONALITIES };

const COMMENTATOR_TEMPLATES = {
  dramatic: {
    first_round: [
      "🎉 ACHTUNG ACHTUNG! Das Spiel beginnt! {winner} schnappt sich den ersten Stich wie ein hungriger Hamster eine Nuss!",
      "🚀 DIE KARTEN FLIEGEN! {winner} gewinnt Runde 1 und schaut dabei so cool aus wie ein Pinguin mit Sonnenbrille!",
      "🎭 HISTORISCHER MOMENT! {winner} macht den ersten Stich! Die Geschichtsbücher werden davon berichten!",
      "⚡ BUMM PENG KLATSCH! {winner} legt sofort los! Die anderen reiben sich die Augen!",
      "🌟 DAS ERSTE BLUT IST GEFLOSSEN! Also das erste Karten-Blut! {winner} führt!",
    ],
    perfect_round: [
      "🏆 ALLE STICHE! ALLE! {winner} hat ALLE Stiche genommen! Die anderen haben NULL! Das ist wie wenn man alle Pommes vom Teller klaut!",
      "🌟 UNFASSBAR! {winner} räumt KOMPLETT ab! Alle 5 Stiche! Die anderen schauen so leer aus wie ein leerer Kühlschrank!",
      "🎯 ABSOLUTE DOMINANZ! {winner} gewinnt JEDEN EINZELNEN Stich! Das ist nicht fair! Das ist GENIAL!",
      "👑 NIEMAND KRIEGT AUCH NUR EINEN STICH AUSSER {winner}! Nullkommanull für den Rest! Das schreit zum Himmel!",
      "⭐ KOMPLETTER SWEEP! {winner} macht alle 5 Stiche! Die anderen sitzen da wie bestellt und nicht abgeholt!",
    ],
    dominant_lead: [
      "🏃 {leader} rennt davon wie ein aufgescheuchtes Huhn! {leader_gap} Punkte vor {second}! Wer soll das noch einholen?!",
      "🚂 {leader} ist ein Zug der keine Bremse hat! {leader_gap} Punkte Vorsprung! {second} pustet hinterher!",
      "🎪 {leader} macht einfach was {leader} will! {leader_gap} Punkte vor {second}! Das Spiel gehört {leader}!",
      "🌪 {leader} fliegt davon wie ein Drachen bei Sturm! {leader_gap} Punkte Abstand! Wahnsinn!",
      "💥 {leader_gap} Punkte! PUNKT! {leader} lässt {second} stehen wie einen nassen Pudel!",
    ],
    close_game: [
      "😬 HAUCHDÜNN! Nur {leader_gap} Punkte zwischen {leader} und {second}! Das ist dünner als eine Scheibe Aufschnitt!",
      "🔥 {leader} und {second} liegen so eng beieinander, die teilen sich fast die Schuhe! Nur {leader_gap} Punkte!",
      "😰 {leader_gap} Punkte Unterschied! Das entscheidet eine einzige Karte! Eine einzige! Ich halte es kaum aus!",
      "🤯 MEGA KNAPP! {leader} vor {second} mit nur {leader_gap} Punkten! Jeder Stich ist jetzt Gold wert!",
      "🎭 So eng wie zwei Wollmäuse in einem Strumpf! {leader_gap} Punkte zwischen {leader} und {second}!",
    ],
    worst_player: [
      "😢 OH NEIN! {worst_player} geht LEER aus! Null! Nada! Gar nichts! Die Karten haben {worst_player} heute nicht lieb!",
      "🥺 {worst_player} kriegt keinen einzigen Stich! Die anderen haben {max_tricks}! Das ist so traurig wie Regen am Geburtstag!",
      "💔 NULL STICHE für {worst_player}! Die Karten fliegen alle zu den anderen! Das tut weh!",
      "🌧️ {worst_player} sitzt da mit leeren Händen! Kein einziger Stich! Das Schicksal ist grausam heute!",
      "😱 KATASTROPHE! {worst_player} holt NICHTS! Die anderen reiben sich die Hände, {worst_player} reibt sich die Augen!",
    ],
    negative_run: [
      "😱 {streak_count} RUNDEN IN FOLGE OHNE STICH! {streak_player} sammelt Nullen wie andere Leute Briefmarken! Schon {streak_total_zero} Mal!",
      "🌧️ {streak_player} und die Stiche - das ist eine Liebesgeschichte die nicht funktioniert! {streak_count} Runden! {streak_total_zero} Mal null!",
      "😬 IST DAS EIN FLUCH?! {streak_player} holt {streak_count} Runden lang NICHTS! {streak_total_zero} Nullen im Sammelbuch!",
      "🥺 {streak_player} wartet auf den ersten Stich wie aufs Christkind! {streak_count} Runden! Wann kommt er endlich?!",
      "💀 {streak_total_zero} Nullen! {streak_player} bricht gerade den Rekord für meiste Nieten! {streak_count} Runden ohne einen einzigen Stich!",
    ],
    comeback: [
      "🎉 WUNDER DES JAHRHUNDERTS! {winner} kam von ganz hinten und gewinnt jetzt diese Runde! Das schreibt man in Geschichtsbücher!",
      "🚀 PHOENIX AUS DER ASCHE! {winner} war am Boden und fliegt jetzt ganz oben! UNFASSBAR!",
      "⭐ {winner} dreht das Spiel wie eine Socke! Von hinten nach vorne! So geht Comeback!",
      "🌟 DAS DARF NICHT WAHR SEIN! {winner} kriecht aus dem Keller und springt an die Spitze! DRAMA PUR!",
      "🎭 SENSATION! {winner} dreht den Spieß um! Die anderen fallen fast vom Stuhl!",
    ],
    leader_change: [
      "🔄 TAUSCH DES THRONS! {winner} schmeißt den alten Chef raus und setzt sich selbst auf den Thron! Krone sitzt!",
      "⚡ NEUER ANFÜHRER! {winner} übernimmt das Kommando! Der alte Boss muss nach hinten! Was für ein Tag!",
      "🎪 {winner} stiehlt die Führung! Klaut sie einfach! Und schaut dabei noch unschuldig drein!",
      "🚀 MACHTWECHSEL! {winner} ist jetzt der Boss! Die anderen müssen sich hinten anstellen!",
      "🌟 ALLE AUGEN AUF {winner}! Neue Nummer 1! Das Spiel dreht sich komplett auf links!",
    ],
    tie_game: [
      "🤝 UNENTSCHIEDEN! {winners} können sich einfach nicht einigen wer besser ist! Also gewinnen beide!",
      "🎭 GLEICHSTAND! {winners} teilen brav wie im Kindergarten! Jeder kriegt gleich viel!",
      "🌟 {winners} sagen: Warum nicht einfach beide gewinnen? Gesagt, getan!",
      "🤝 PATT! {winners} liegen Nasenspitze an Nasenspitze! Beide auf Platz 1! Beide Sieger!",
      "⭐ WIE ZWILLINGE! {winners} machen exakt gleich viele Stiche! Das schreit nach Gerechtigkeit!",
    ],
    mixed: [
      "🎮 {winner} macht die Runde klar! {max_tricks} Stiche eingesackt! Auf zur nächsten!",
      "🎲 SOLIDE! {winner} nimmt diese Runde mit! Die anderen schauen ein bisschen neidisch!",
      "🎭 {winner} gewinnt! Klar und deutlich! So muss das!",
      "🎯 {max_tricks} Stiche für {winner}! Das war sauber! Weiter geht der Spaß!",
      "⚡ {winner} zieht die Runde an sich! {max_tricks} Stiche! Nicht schlecht, nicht schlecht!",
    ],
  },

  tagesschau: {
    first_round: [
      "Guten Abend. Erste Runde. {winner} hat gewonnen. Wir berichten weiter.",
      "Es ist so weit. Das Spiel hat begonnen. {winner} gewinnt die Auftaktrunde. Die Nachrichtenlage bleibt angespannt.",
      "Meldung aus dem Kinderzimmer: {winner} gewinnt die erste Runde. Niemand wurde verletzt.",
      "In einer überraschenden Wendung gewinnt {winner} die Eröffnungsrunde. Experten sind gespalten.",
    ],
    perfect_round: [
      "Wir unterbrechen das Programm für eine Sondermeldung: {winner} hat alle Stiche gewonnen. Alle. Den Rest trifft keine Schuld.",
      "Historische Zahlen aus dem Spielzimmer: {winner} erzielt fünf von fünf Stichen. Die anderen erzielen null von fünf Stichen. Wir lassen das so stehen.",
      "Es gibt Neuigkeiten. {winner} gewinnt jeden einzelnen Stich dieser Runde. Die Mitbewerber gehen leer aus. Ende der Meldung.",
      "Sondersendung: {winner} dominiert die Runde vollständig. Alle Stiche. Keine Ausnahmen. Wir empfehlen Fassung zu bewahren.",
    ],
    dominant_lead: [
      "{leader} führt mit {leader_gap} Punkten vor {second}. Die Situation ist eindeutig. Wir empfehlen Gelassenheit.",
      "Aktuelle Zahlen: {leader} hat {leader_gap} Punkte Vorsprung auf {second}. Das ist viel. Wir sagen das nur.",
      "{leader_gap} Punkte. {leader} vorne. {second} hinten. Mehr ist dazu nicht zu sagen.",
      "Der Abstand zwischen {leader} und {second} beträgt {leader_gap} Punkte. Fachleute sprechen von einem deutlichen Vorsprung. Wir schließen uns an.",
    ],
    close_game: [
      "{leader} und {second} trennen {leader_gap} Punkte. Das ist wenig. Wir beobachten die Lage.",
      "Eng. Sehr eng. {leader_gap} Punkte zwischen {leader} und {second}. Die Spannung ist mit Händen zu greifen. Wir greifen nicht hin.",
      "Knapper geht es kaum: {leader} führt mit {leader_gap} Punkten vor {second}. Wir bleiben für Sie auf Sendung.",
      "Die Lage ist unübersichtlich. {leader_gap} Punkte Unterschied. {leader} vorne. {second} sehr nah dahinter. Ausgehen gehen würden wir heute nicht.",
    ],
    worst_player: [
      "{worst_player} hat diese Runde keinen Stich erzielt. Null. Wir erwähnen das ohne Wertung.",
      "Meldung: {worst_player} geht leer aus. Die anderen Spieler hatten {max_tricks} Stiche. Das war ein Unterschied.",
      "{worst_player} und die Stiche - in dieser Runde fand keine Begegnung statt. Wir respektieren das.",
      "Null Stiche für {worst_player}. Dieser Satz enthält alle notwendigen Informationen.",
    ],
    negative_run: [
      "{streak_player} hat nun {streak_count} Runden in Folge keinen Stich erzielt. Insgesamt {streak_total_zero} Mal. Wir empfehlen Durchatmen.",
      "Die Serie von {streak_player} setzt sich fort: {streak_count} Runden ohne Stich. {streak_total_zero} Nullen gesamt. Eine bemerkenswerte Statistik.",
      "{streak_total_zero} Mal ohne Stich. {streak_count} Runden in Folge. {streak_player}. Wir geben diese Zahlen ohne Kommentar weiter.",
      "Anhaltend schwierige Lage für {streak_player}: Erneut kein Stich. Runde {streak_count} ohne Erfolg. Wir bleiben sachlich.",
    ],
    comeback: [
      "{winner} gewinnt diese Runde trotz schwieriger Ausgangslage. Eine Wende. Wir hatten sie nicht ausgeschlossen.",
      "Überraschende Entwicklung: {winner} kämpft sich zurück und gewinnt diese Runde. Das Blatt hat sich gewendet. Buchstäblich.",
      "{winner} gewinnt. Das war nicht unbedingt zu erwarten. Und doch ist es passiert. So ist das Leben.",
      "Wende im Spielzimmer: {winner} holt auf und gewinnt die Runde. Wir werten das als positives Signal.",
    ],
    leader_change: [
      "Führungswechsel. {winner} ist jetzt vorne. Der vorherige Führende ist jetzt nicht mehr vorne. Das sind alle Informationen.",
      "Neue Spitze: {winner} übernimmt Platz eins. Für alle anderen ändert sich die Platzierung entsprechend. Wir danken für Ihre Aufmerksamkeit.",
      "{winner} führt nun. Das war bis eben noch anders. Veränderung ist möglich. Das ist die Botschaft.",
    ],
    tie_game: [
      "Gleichstand. {winners} haben gleich viele Stiche. Beide auf Platz eins. Das ist mathematisch korrekt.",
      "{winners} teilen sich den Sieg. Beide haben {max_tricks} Stiche. Das nennt man Unentschieden. Wir auch.",
      "Keine Einigung möglich: {winners} landen gleichauf. Das Ergebnis ist offen. Wie das Leben.",
    ],
    mixed: [
      "{winner} gewinnt die Runde mit {max_tricks} Stichen. Das Spiel geht weiter.",
      "Runde abgeschlossen. {winner} vorne. {max_tricks} Stiche. Nächste Runde folgt.",
      "{winner} setzt sich durch. {max_tricks} Stiche. Wir nehmen das zur Kenntnis.",
    ],
  },

  bavarian: {
    first_round: [
      "🎉 Servus und Pfüat di! {winner} schnappt sich gleich den erschden Stich! So fangt des o - wia a Raubtier!",
      "🚀 Jetzt geht's los, Leutl! {winner} macht den Anfang! Des Hendl hod des Ei scho gefunden!",
      "🎭 Naaaa, schau moi oo! {winner} gewinnt gleich am Anfang! Schau her wia der des macht!",
      "⚡ Heast! {winner} nimmt den erschdn Stich! Scho von Anfang an voll dabei! Bravissimo!",
      "🌟 {winner} macht den Start! Wia a aufgeregter Terrier springt der glei ins Spui!",
    ],
    perfect_round: [
      "🏆 Heilige Kuh nochmal! {winner} nimmt ALLE Stich! Olle! De andern kriagn GAR NIX! Des is ja a Wahnsinn!",
      "🌟 Mia san baff! {winner} räumt KOMPLETT ob! 5 Stich, koa einzige für d'andern! Des is a Weltklasse!",
      "🎯 Na heast, des gibt's doch ned! {winner} gewinnt JEDEN Stich! De andern schaun drein wia d'Kuh wann's donnert!",
      "👑 HALTAUS! {winner} macht alle Stich! ALLE! De andern hamm nix, rein gar nix! Sowas hob i no ned gsehn!",
    ],
    dominant_lead: [
      "Jo mei, {leader} rennt davo wia a aufgescheuchtes Reh! {leader_gap} Punkte vor dem {second}! Des wird schwer zum aufholen!",
      "Sapperment, {leader} macht des richtig! {leader_gap} Punkte Vorsprung auf {second}! Do muss ma scho a bissl schwitzen!",
      "{leader} is so weit vorn, der hört de andern scho nimma! {leader_gap} Punkte! {second} schnauft hinterher!",
      "Na bitte schön, {leader} davon wia a Radler bergab! {leader_gap} Punkte auf {second}! Des schaut ned guad aus für de anderen!",
    ],
    close_game: [
      "Jo mei, des is so knapp wia a Hendlhaxn an Fasching! {leader_gap} Punkte zwischen {leader} und {second}!",
      "Heast! {leader} und {second} liegen so beieinand - da passt koa Brezn dazwischen! Nur {leader_gap} Punkte!",
      "Mhm, des is a spannende Sach! {leader_gap} Punkte trennen {leader} von {second}! Jeder Stich is jetzt Gold wert!",
      "Na schau! {leader} und {second} kleben aneinand wia Lebkuchen im Sommer! Nur {leader_gap} Punkte Unterschied!",
    ],
    worst_player: [
      "Oha! {worst_player} geht leer aus! Nix! Null! Nada! Des is schlimmer als wenn'd Brezen ausgangen is!",
      "Oje oje oje! {worst_player} mit 0 Stich! De Karten mögn den heut ned! Des tut weh wia a Wespenststich!",
      "Sapperment, armer {worst_player}! Koa einziger Stich! De anderen ham {max_tricks}! Des is ja a Katastroph!",
      "Jetzt schau her! {worst_player} sitzt da wia a Gartenzwerg im Regen! Koa Stich, rein gar nix!",
      "Herrgott sakra! {worst_player} geht komplett leer aus! Des Glück is heut a ganz anderer Ort!",
    ],
    negative_run: [
      "Jo mei jo mei! {streak_player} sammelt Nullen wia andere Leut Pilze! {streak_count} Runden! Schon {streak_total_zero} Mal nix!",
      "Heast! {streak_player} und de Stiche, des is eine unglückliche Liebe! {streak_count} Runden ohne! {streak_total_zero} Nullen!",
      "Da schau her! {streak_count} Runden am Stück nix für {streak_player}! {streak_total_zero} Mal leer! Is des a Fluch?!",
      "Oha, der arme {streak_player}! {streak_count} Mal hintereinand ohne Stich! {streak_total_zero} Nullen insgesamt! Wann kommt endlich die Wende?!",
    ],
    comeback: [
      "Des gibt's doch ned! {winner} war ganz hint und gewinnt jetzt diese Rund! Des is a Wunder wia d'Auferstehung der Weißwurscht!",
      "Mia Leutl, des is a echtes Märchen! {winner} kriecht aus dem Keller und springt an die Spitz! SPEKTAKULÄR!",
      "Heast! {winner} dreht des Spui komplett! Von hint nach vorn! Des is wia wenn'd Sonne durch die Wolken bricht!",
      "Na, jetzt hau mi nieder! {winner} macht des Unmögliche möglich! Comeback des Jahres im Kinderzimmer!",
    ],
    leader_change: [
      "Umschwung! {winner} schmeißt den Alten vom Thron! Jetzt sitzt {winner} ganz vorn! Servus!",
      "Heast, jetzt dreht si des Blatt! {winner} überholt alle und führt! Des Spui is komplett offen!",
      "Na bitte! {winner} stiehlt die Führung! Einfach so! Und schaut dabei so unschuldig drein wia a Lebkuchenmann!",
      "UMSCHWUNG IM KINDERZIMMER! {winner} ist die neue Nummer eins! Des hatten wir so ned erwartet!",
    ],
    tie_game: [
      "Heast, de können si ned einigen! {winners} machen gleich viele Stich! Also gewinnen halt beide! Sehr demokratisch!",
      "Des is ja goldig! {winners} teilen brav! Jeder kriegt gleich viel! Des nennt ma Gleichstand auf Bayrisch!",
      "Na schau, {winners} sind Freunde! Beide gewinnen, beide happy! So soll's sei!",
      "Patt! {winners} auf gleichem Niveau! Beide Stich, beide Sieg! Schön wann's so ausgeht!",
    ],
    mixed: [
      "Na freilich, {winner} macht das! {max_tricks} Stich einsackt! So geht das auf Bayrisch!",
      "Guad gmacht, {winner}! {max_tricks} Stich! Des war sauber! Weiter so!",
      "Heast, {winner} gewinnt diese Rund! Net schlecht für heit! Auf zur nächsten!",
      "{winner} zieht die Runde an sich! {max_tricks} Stich! Bravissimo, sog i!",
    ],
  },

  fan: {
    first_round: [
      "🎉 OH MEIN GOTT ES GEHT LOS! {winner} GEWINNT SOFORT! ICH KANN NICHT RUHIG SITZEN! AAAAH!",
      "🚀 ERSTER STICH GEHT AN {winner}! DAS IST DER BESTE TAG MEINES LEBENS! JA JA JA!",
      "🌟 ICH WARTE SCHON SO LANGE AUF DIESEN MOMENT! {winner} MACHT DEN START! TRAUMHAFT!",
      "⚡ LET'S GOOOOO! {winner} KNALLT SOFORT REIN! DAS WIRD EINE LEGENDÄRE PARTIE!",
    ],
    perfect_round: [
      "🏆 ALLE STICHE! ALLE! {winner} NIMMT ALLE! ICH HABE TRÄNEN IN DEN AUGEN! DAS IST KUNST!",
      "🌟 PERFEKTO! ABSOLUTO! {winner} LÄSST DEN ANDEREN NULL! NULL! ICH BIN SPRACHLOS! FAST!",
      "🎯 DAS IST NICHT MÖGLICH! {winner} MACHT ALLE {card_count} STICHE! DIE ANDEREN NULL! ICH FASSE ES NICHT!",
      "👑 LEGENDÄR! HISTORISCH! {winner} DOMINIERT WIE EIN KARTENSPIEL-GOTT! ALLE STICHE! BOAH!",
      "⭐ ICH SCHREIE! {winner} SCHNAPPT SICH EINFACH ALLE STICHE! DAS GIBT ES NICHT! WIE?! WIESO?! WIE?!",
    ],
    dominant_lead: [
      "🏃 {leader} RAST DAVON! {leader_gap} PUNKTE VOR {second}! ICH KANN DAS NICHT FASSEN! DAS IST EINMALIG!",
      "🚂 {leader} IST UNAUFHALTSAM! {leader_gap} PUNKTE! {second} IST MACHTLOS! ICH FLIPPE AUS!",
      "🌪 {leader_gap} PUNKTE VORSPRUNG! {leader} MACHT DAS! WER SOLL DAS NOCH STOPPEN?! NIEMAND!",
      "💥 {leader} VS. ALLE! UND {leader} GEWINNT! {leader_gap} PUNKTE! ABSOLUTE DOMINANZ! GÄNSEHAUT!",
    ],
    close_game: [
      "🔥 NUR {leader_gap} PUNKTE! MEIN HERZ! {leader} UND {second} SO KNAPP! ICH HALTE DAS KAUM AUS!",
      "😬 {leader_gap} PUNKTE UNTERSCHIED! HAARSCHARF! ICH ATME NICHT MEHR! {leader} VOR {second}!",
      "😰 SO KNAPP! SO WAHNSINNIG KNAPP! {leader} UND {second} MIT NUR {leader_gap} PUNKTEN! DRAMA!",
      "🤯 ICH KANN NICHT HINSCHAUEN! ICH SCHAUE TROTZDEM HIN! {leader_gap} PUNKTE! UNGLAUBLICH ENG!",
    ],
    worst_player: [
      "😢 NEIN NEIN NEIN! {worst_player} GEHT LEER AUS! NULL STICHE! DAS BRICHT MIR DAS HERZ! AUFMUNTERUNG FOLGT!",
      "🥺 {worst_player} KRIEGT NICHTS! GAR NICHTS! DIE ANDEREN HABEN {max_tricks}! DAS IST SO UNFAIR! SO UNFAIR!",
      "💔 ARMER {worst_player}! NULL STICHE! ICH WEINE INNERLICH! ABER ICH GLAUBE AN DAS COMEBACK!",
      "🌧️ {worst_player} UND NULL STICHE! DAS TUT WEH! ICH SPÜRE DEN SCHMERZ! KOMMEN SIE ZURÜCK {worst_player}!",
    ],
    negative_run: [
      "😱 {streak_count} RUNDEN! {streak_player} MIT NULL! {streak_total_zero} MAL NICHTS! ICH KANN NICHT MEHR! WANN BRICHT DER BANN?!",
      "🌧️ {streak_player} SAMMELT NULLEN! {streak_count} RUNDEN HINTEREINANDER! {streak_total_zero} GESAMT! ICH LEIDE MIT!",
      "😬 DAS DARF NICHT WAHR SEIN! {streak_player} SCHON WIEDER NULL! {streak_count} MAL! {streak_total_zero} INSGESAMT! FLUCH?!",
      "🥺 {streak_player} KÄMPFT! {streak_count} RUNDEN OHNE STICH! {streak_total_zero} NULLEN! ICH GLAUBE AN DICH! BITTE STICH!",
    ],
    comeback: [
      "🎉 COMEBACK! COMEBACK! COMEBACK! {winner} WAR GANZ HINTEN! JETZT VORNE! ICH DREHE DURCH! DAS IST VERRÜCKT!",
      "🚀 ICH HABE GEWUSST ES KOMMT! {winner} STEIGT AUF! VON GANZ UNTEN NACH GANZ OBEN! LEGENDÄR!",
      "⭐ PHOENIX! FEUER! AUFERSTEHUNG! {winner} IST ZURÜCK! DAS WAR DAS SPIEL DES JAHRHUNDERTS!",
      "🌟 UNGLAUBLICH! UNFASSBAR! UNBESCHREIBLICH! {winner} MACHT ES! COMEBACK DES JAHRHUNDERTS! JA!",
    ],
    leader_change: [
      "🔄 NEUER BOSS! {winner} ÜBERNIMMT! DER ALTE ANFÜHRER IST GESCHICHTE! MEIN LIEBLINGSMOMENT!",
      "⚡ {winner} IST JETZT NUMMER EINS! ICH SCHREIE! DAS HAT SICH KEINER GEDACHT! NIEMAND!",
      "🌟 WAHNSINN! {winner} KLAUT DIE FÜHRUNG! EINFACH SO! DAS NENNT MAN KLASSE! MEGA!",
      "🚀 {winner} AN DER SPITZE! DAS KOMPLETTE CHAOS! DAS PERFEKTE CHAOS! ICH LIEBE DIESES SPIEL!",
    ],
    tie_game: [
      "🤝 BEIDE GEWINNEN! {winners} MACHEN GLEICH VIELE STICHE! DAS IST SO SCHÖN! SO GERECHT! FREUDE!",
      "🌟 UNENTSCHIEDEN! {winners} TEILEN! DAS IST TEAMWORK! DAS IST FREUNDSCHAFT! DAS IST HERZ!",
      "⭐ {winners} GLEICHAUF! BEIDE SIEGER! DAS MACHT MICH SO GLÜCKLICH! WUNDERBAR!",
      "🤝 GLEICH! GLEICH! GLEICH! {winners} MIT {max_tricks} STICHEN JEDER! SO SOLL DAS SEIN! PERFEKT!",
    ],
    mixed: [
      "🎮 {winner} MACHT DAS! {max_tricks} STICHE! JEDE RUNDE EIN ABENTEUER! ICH LIEBE ES!",
      "🎲 {winner} GEWINNT! SAUBER! {max_tricks} STICHE! WEITER GEHT DAS SPEKTAKEL!",
      "🎯 SO MACHT MAN DAS! {winner} MIT {max_tricks} STICHEN! NÄCHSTE RUNDE BITTE SOFORT!",
      "⚡ {winner} LEGT VOR! {max_tricks} STICHE! DAS SPIEL LÄUFT! ICH BIN DABEI! IMMER!",
    ],
  },
};

const SCENARIOS_BY_PERSONALITY = {
  dramatic: COMMENTATOR_TEMPLATES.dramatic,
  tagesschau: COMMENTATOR_TEMPLATES.tagesschau,
  bavarian: COMMENTATOR_TEMPLATES.bavarian,
  fan: COMMENTATOR_TEMPLATES.fan,
};

export function buildKinderkartenCommentary(round, registeredPlayers = [], personality = PERSONALITIES.dramatic, sessionHistory = [], gameType = null) {
  try {
    console.log('[buildKinderkartenCommentary] Building commentary for round:', round);

    if (!round || typeof round !== 'object') {
      console.error('[buildKinderkartenCommentary] Invalid round data:', round);
      return { segments: [{ avatar: " ", name: "System", label: "Fehler", text: "Ungültige Rundendaten" }] };
    }

    const pl = Object.keys(round.trick_counts || {});

    console.log('[buildKinderkartenCommentary] round.id:', round.id);
    console.log('[buildKinderkartenCommentary] round.seq:', round.seq);
    console.log('[buildKinderkartenCommentary] pl:', pl);
    console.log('[buildKinderkartenCommentary] sessionHistory.length:', Array.isArray(sessionHistory) ? sessionHistory.length : 0);

    // IMPORTANT: Filter out current round from history to get ONLY previous rounds
    const prevHistory = Array.isArray(sessionHistory) ? sessionHistory.filter(r => r.id !== round.id) : [];

    // Calculate balances from history (previous rounds only)
    const balances = {};
    pl.forEach(p => balances[p] = 0);
    
    prevHistory.forEach(r => {
      if (r && r.scores) {
        Object.entries(r.scores).forEach(([player, score]) => {
          if (balances[player] !== undefined) {
            balances[player] += score;
          }
        });
      }
    });

    const scenario = analyzeKinderkartenScenario(round, pl, prevHistory, balances, null);
    console.log('[buildKinderkartenCommentary] Detected scenario:', scenario);

    const templates = SCENARIOS_BY_PERSONALITY[personality] || SCENARIOS_BY_PERSONALITY.dramatic;
    const templateKey = scenario;
    const templateList = templates[templateKey] || templates.mixed || [];

    if (templateList.length === 0) {
      console.warn('[buildKinderkartenCommentary] No templates found for scenario:', templateKey);
      return { segments: [{ avatar: " ", name: "Kommentator", label: "Info", text: "Kein Kommentar verfügbar" }] };
    }

    const templateVars = buildTemplateVars(round, pl, prevHistory, balances);
    const template = pickRandom(templateList);
    const filledText = fill(template, templateVars);

    const segments = [{
      avatar: PERSONALITIES[personality]?.icon || " ",
      name: PERSONALITIES[personality]?.label || "Kommentator",
      label: PERSONALITIES[personality]?.label || "Kommentator",
      text: filledText,
      scenario: scenario,
      gameType: gameType,
    }];

    // Add player reactions
    const regMap = Object.fromEntries((registeredPlayers ?? []).map(p => [p.name, p]));
    
    // Winner reaction
    if (round.winners && round.winners.length > 0 && Math.random() < 0.7) {
      const winnerName = round.winners[0];
      const winnerReg = regMap[winnerName];
      const charType = winnerReg?.character_type ?? "optimist";
      
      const reactionPool = PLAYER_REACTIONS[charType]?.[scenario]
        ?? PLAYER_REACTIONS[charType]?.["routine_win"]
        ?? PLAYER_REACTIONS["optimist"]?.[scenario]
        ?? PLAYER_REACTIONS["optimist"]?.["routine_win"]
        ?? ["Super!", "Gut gemacht!"];
      
      segments.push({
        avatar: winnerReg?.avatar ?? "🃏",
        name: winnerName,
        label: PLAYER_PERSONALITIES[charType]?.label ?? "",
        text: pickRandom(reactionPool),
        scenario: scenario,
      });
    }

    // Other players reactions
    if (Math.random() < 0.5) {
      const otherPlayers = pl.filter(p => !round.winners.includes(p));
      const otherPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
      
      if (otherPlayer) {
        const otherReg = regMap[otherPlayer];
        const charType = otherReg?.character_type ?? "pessimist";
        
        const reactionPool = PLAYER_REACTIONS[charType]?.["routine_loss"]
          ?? PLAYER_REACTIONS[charType]?.[scenario]
          ?? PLAYER_REACTIONS[charType]?.["routine_loss"]
          ?? PLAYER_REACTIONS["pessimist"]?.["routine_loss"]
          ?? PLAYER_REACTIONS["pessimist"]?.[scenario]
          ?? PLAYER_REACTIONS["pessimist"]?.["routine_loss"]
          ?? ["Schade...", "Nächste Mal!"];
        
        segments.push({
          avatar: otherReg?.avatar ?? "🃏",
          name: otherPlayer,
          label: PLAYER_PERSONALITIES[charType]?.label ?? "",
          text: pickRandom(reactionPool),
          scenario: scenario,
        });
      }
    }

    console.log('[buildKinderkartenCommentary] Commentary built:', segments);

    return {
      segments: segments.map(s => ({ ...s, gameType })),
      spokenText: filledText,
      scenario: scenario,
    };
  } catch (error) {
    console.error('[buildKinderkartenCommentary]] Error building commentary:', error);
    return {
      segments: [{
        avatar: " ",
        name: "System",
        label: "Fehler",
        text: "Fehler beim Erstellen des Kommentars: " + error.message,
      }],
      spokenText: "Fehler",
      scenario: 'mixed',
      gameType: gameType,
    };
  }
}

export default {
  KINDERKARTEN_SCENARIOS,
  buildKinderkartenCommentary,
};