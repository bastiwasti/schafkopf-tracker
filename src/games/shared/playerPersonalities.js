export const PLAYER_PERSONALITIES = {
  optimist: {
    label: "Der Optimist",
    icon: "🌟",
    catchphrases: ["Kein Stress!", "Ich schaff das!", "Immer positiv bleiben!", "Das klappt schon!", "Gut gelaunt bleiben!"]
  },
  pessimist: {
    label: "Der Pessimist",
    icon: "🌧️",
    catchphrases: ["Wie erwartet...", "Das dachte ich mir schon", "Schon wieder...", "Nicht überraschend.", "Typisch."]
  },
  stratege: {
    label: "Der Strateg",
    icon: "🧠",
    catchphrases: ["Alles kalkuliert.", "Statistiken lügen nicht.", "Nach Plan.", "Kalkulation korrekt.", "Logik siegt."]
  },
  joker: {
    label: "Der Joker",
    icon: "🤪",
    catchphrases: ["Zufall oder Genie?", "Haha!", "Boah, bin ich gut!", "Pure Energie!", "Voll der Spaß!"]
  },
  eitle: {
    label: "Der Eitle",
    icon: "🎩",
    catchphrases: ["Natürlich!", "Ich bin der Beste!", "Alle bewundern mich.", "Perfekt wie immer.", "Meine Strategie ist unschlagbar."]
  },
  stoische: {
    label: "Der Stoische",
    icon: "🪨",
    catchphrases: ["...", "Mhm.", "So ist es.", "Okay.", "Verstanden."]
  },
  empoerte: {
    label: "Die Empörte",
    icon: "😤",
    catchphrases: ["BETRUG!", "Das ist unmöglich!", "SCHÄNDLICH!", "Unfair!", "Ich bin entrüstet!"]
  },
  anfaenger: {
    label: "Der Anfänger",
    icon: "🐣",
    catchphrases: ["Echt jetzt?", "Ich verstehe das noch nicht...", "Hä?", "Ganz schön kompliziert!", "Was ist hier los?"]
  },
  veteran: {
    label: "Der Veteran",
    icon: "🏆",
    catchphrases: ["Klassiker.", "Passiert.", "Habe ich schon tausendmal gesehen.", "Alte Bekannte.", "Standard-Situation."]
  },
  chiller: {
    label: "Der Chiller",
    icon: "😎",
    catchphrases: ["Kein Stress.", "Easy peasy.", "Ist okay.", "Chill mal.", "Geht so weiter."]
  },
};

export const PLAYER_REACTIONS = {
  optimist: {
    // ── Schafkopf-Szenarien ──────────────────────────────────────────────────
    routine_win: [
      "Super gemacht! Das war ein solides Spiel!",
      "Läuft bei mir — gutes Karma heute!",
      "Ja! Weiter so, der Schwung ist auf meiner Seite!",
      "Klasse! Jeder Sieg zählt!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    routine_loss: [
      "Kein Problem, nächstes Mal wird's besser!",
      "Nur ein kleiner Rückschlag — ich komm zurück!",
      "Kopf hoch, das nächste Spiel gehört mir!",
      "Erfahrungen sammeln ist auch was wert!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    close_win: [
      "Phew! Hauchdünn, aber ein Sieg ist ein Sieg!",
      "Mein Herz! Aber ich hab's gewusst, es klappt!",
      "Knapp ist auch drüber — ich liebe diese Spannung!",
      "So ein Nervenkitzel! Und dann noch gewonnen!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    close_loss: [
      "Haarscharf! Beim nächsten Mal kipp ich das!",
      "So knapp — aber ich bleib zuversichtlich!",
      "Fast! Ich spür schon den nächsten Sieg!",
      "Nicht schlimm, das Glück dreht sich!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    dramatic_win: [
      "JA! Das war mein Moment — unglaublich!",
      "PERFEKT! Eines meiner besten Spiele überhaupt!",
      "ICH GLAUB ES NICHT! Einfach sensationell!",
      "Wow — das Spiel der Spiele, und ich gewinne!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    dramatic_loss: [
      "Okay, das war heftig — aber ich lern daraus!",
      "Puh! Hart, aber ich geb nicht auf!",
      "Schockierend, aber das macht mich stärker!",
      "Nicht mein Tag, aber morgen schon!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    bock_good_luck: [
      "BOCK! Doppelt gewonnen — heute läuft alles!",
      "Bockrunde und voll abgeräumt — das war perfekt!",
      "2x für mich! Dieser Abend ist unschlagbar!",
      "Doppeltes Glück, doppelte Freude!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    bock_bad_luck: [
      "Doppelt verloren, aber das ist nur eine Runde!",
      "Bock gegen mich — kein Problem, ich hol's zurück!",
      "Okay, Bockrunde verloren. Wird schon wieder!",
      "Das war teuer, aber ich bleib positiv!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    high_solo_win: [
      "60+ Punkte Solo! Absoluter Traumlauf!",
      "MEIN BESTES SOLO! Ich bin überglücklich!",
      "Solo-König heute — was für ein Gefühl!",
      "Solo mit Vollpunkten! Ich liebe dieses Spiel!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    against_solo_win: [
      "Zusammen haben wir's dem Solo-Spieler gezeigt!",
      "Teamwork! Gemeinsam sind wir unschlagbar!",
      "Solo geschlagen — das Kollektiv siegt!",
      "Wir gegen einen — und wir gewinnen!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    klopfer_luck: [
      "Klopfer und abgesahnt — heute ist mein Tag!",
      "KLOPFER! Alles richtig gemacht, alles gewonnen!",
      "Mit Klopfer gewonnen — Volltreffer!",
      "Klopfer-Glück! So läuft ein guter Abend!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    klopfer_bad_luck: [
      "Klopfer verloren — aber kein Weltuntergang!",
      "Okay, Klopfer gegen mich. Nächstes Mal meins!",
      "Das war teuer, aber ich bleib dran!",
      "Klopfer-Pech, nächstes Mal Klopfer-Glück!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    streak_end_win: [
      "Streak geht weiter — kein Ende in Sicht!",
      "Ich hab den Dreh wirklich raus heute!",
      "Noch einer! Ich kann gar nicht aufhören!",
      "Serie läuft — ich bin im Flow!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    leader_gain: [
      "Führung übernommen — und ich halte sie!",
      "AN DER SPITZE! Das fühlt sich fantastisch an!",
      "Ich bin der Leader — jetzt erst recht!",
      "Vorne! Und von hier aus schaue ich nur vorwärts!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    leader_loss: [
      "Führung abgegeben — ich hol sie mir zurück!",
      "Nicht mehr vorne, aber der Weg dahin ist kurz!",
      "Okay, jetzt muss ich aufholen — ich schaff das!",
      "Rückschlag? Nur kurz. Ich komm wieder!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],

    // ── Wizard-Szenarien ─────────────────────────────────────────────────────
    final_round: [
      "Letzte Runde! Ich geb alles — jetzt oder nie!",
      "Das Finale! Ich glaube an mich!",
      "Letzte Chance — und ich nutze sie!",
      "Schlusspunkt! Ich mach das Beste draus!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    brave_success: [
      "Ja! Die mutige Ansage aufgegangen — ich wusste es!",
      "Hohes Risiko, voller Lohn — perfekt!",
      "Ich hab's riskiert und recht gehabt — unglaublich!",
      "Mutiger Zug, maximale Belohnung — das ist Wizard!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    brave_failure: [
      "Okay, die hohe Ansage hat nicht geklappt — ich trau mich trotzdem wieder!",
      "Mutig versucht, nicht ganz gereicht — macht nichts!",
      "Das Risiko war es wert, auch wenn's nicht klappte!",
      "Danebengegriffen, aber Mut zahlt sich auf Dauer aus!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    all_correct: [
      "Alle lagen richtig! Was für eine perfekte Runde!",
      "Wow, wir alle treffen — das ist Teamgeist!",
      "Wenn alle richtig liegen, macht Wizard einfach Spaß!",
      "Komplette Trefferquote — so eine Runde genießt man!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    all_wrong: [
      "Okay, alle daneben — aber gemeinsam überstehen wir das!",
      "Kollektives Scheitern verbindet! Weiter geht's!",
      "Alle falsch? Das ist die Spannungskurve die wir brauchen!",
      "Nächste Runde legen wir alle richtig — versprochen!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    overtake: [
      "Ich hab aufgeholt! Der Rückstand ist Geschichte!",
      "Neue Führung — das Blatt hat sich gewendet!",
      "Jetzt bin ich vorne — und bleibe es!",
      "Rang gut, Runde gut — weiter so!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    comeback: [
      "Comeback-King! Aus der Tiefe an die Spitze!",
      "Beste Runde aus letzter Position — ich glaub daran!",
      "Jetzt komm ich — aufgepasst!",
      "Von hinten nach vorne — das ist meine Geschichte heute!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    leader_extends: [
      "Ich bau meinen Vorsprung aus — läuft wie geschmiert!",
      "Immer weiter vorne — dieser Abend gehört mir!",
      "Führung wächst! Ich hab heute alles richtig gemacht!",
      "Mehr Abstand, mehr Sicherheit — perfekt!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    single_hero: [
      "Beste Runde von allen — das ist mein Moment!",
      "Diese Runde gehört mir — und wie!",
      "Alle überflügelt diese Runde — ich strahle!",
      "Rundensieger! Genau so soll Wizard sein!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    single_disaster: [
      "Das war meine Runde leider nicht — nächste wird besser!",
      "Worst-Case, aber kein Weltuntergang — weiter!",
      "Schlechteste Runde? Nur eine Runde! Ich komm zurück!",
      "Diesen Einbruch stecke ich weg — positiv bleiben!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    safe_players: [
      "Null angesagt — sicherer geht's nicht, das war klug!",
      "Auf Sicherheit gespielt und es hat sich gelohnt!",
      "Manchmal ist null die klügste Ansage — ich weiß!",
      "Konservativ und erfolgreich — auch das ist eine Strategie!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    close_game: [
      "So eng! Das macht den Ausgang so spannend!",
      "Alles noch offen — ich liebe diesen Nervenkitzel!",
      "Hauchdünn getrennt — jede Runde zählt jetzt!",
      "Spannung pur! Genau so soll Wizard sein!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    mixed: [
      "Gemischt, aber positiv — ich mach das Beste draus!",
      "Mal so, mal so — aber der Trend ist gut!",
      "Solide Runde, solide Aussichten!",
      "Weiter dran bleiben — es wird!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
  },

  pessimist: {
    routine_win: [
      "Wunder über Wunder — ich habe gewonnen. Wird nicht wieder passieren.",
      "Einmal Glück, das ist alles. Zufall.",
      "Gewonnen. Kommt sicher nicht nochmal.",
      "Habe ich nicht erwartet. War wohl Versehen.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    routine_loss: [
      "Wie erwartet. Nichts Neues.",
      "Das passiert ja ständig — warum auch nicht.",
      "Verloren. Natürlich.",
      "Vorhersehbar. Wie immer.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    close_win: [
      "Knapp gewonnen. Wird beim nächsten Mal nicht klappen.",
      "Einmal Glück gehabt — läuft schon bald gegen mich.",
      "Das war Zufall, reinste Glück.",
      "Knapp drüber, aber der nächste Verlust wartet schon.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    close_loss: [
      "Natürlich so knapp verloren. Typisch.",
      "Einen Punkt gefehlt. Wie immer.",
      "Das passiert mir ständig — so nah und doch so weit.",
      "Punkt davor, klar. Das ist mein Leben.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    dramatic_win: [
      "Unfassbar, aber wohl wahr. Das passiert mir nie wieder.",
      "Einmal im Leben. Das wars dann.",
      "Ich glaube es nicht. Wirklich nicht.",
      "Wahrscheinlich das letzte Mal, dass ich so gewinne.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    dramatic_loss: [
      "Schlimmste Befürchtung bestätigt. Wie immer.",
      "Natürlich. Das musste ja passieren.",
      "Wie ich es mir gedacht habe. Schon vor dem Spiel.",
      "Das ist mein Standard. Maximaler Schaden.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    bock_good_luck: [
      "Bockrunde gewonnen. Wie selten das ist. Wird nicht wieder vorkommen.",
      "Doppelt gewonnen — das war definitiv Zufall.",
      "Einmal im Jahr vielleicht hat man Bockglück.",
      "Kurioses Glück. Nächste Bockrunde verliere ich doppelt.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    bock_bad_luck: [
      "Klar, Bockrunde verloren. Doppelter Schmerz wie immer.",
      "Bock gegen mich — das überrascht mich kein bisschen.",
      "Wenn Bock, dann natürlich gegen mich. Statistisch unvermeidbar.",
      "Doppelt verloren. So ist das bei mir halt.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    high_solo_win: [
      "Solo gewonnen. Wahrscheinlich haben die anderen Fehler gemacht.",
      "Das war sicher ein Ausnahmetag. Kommt nie wieder.",
      "60 Punkte. Wird nie wieder passieren.",
      "Irgendwie gewonnen. Sicher nicht durch mein Können.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    against_solo_win: [
      "4 gegen 1 und gewonnen. War ja klar.",
      "Nicht mein Verdienst. Die anderen haben das gemacht.",
      "Statistisch wahrscheinlich bei solcher Überzahl.",
      "Nächstes Mal verliert der Solo-Spieler natürlich nicht mehr.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    klopfer_luck: [
      "Mit Klopfer gewonnen — das passiert mir nie wieder.",
      "Klopfer gewonnen. War sicher Zufall.",
      "Klopfer-Glück. Hält nicht lange.",
      "Gibt's nicht, ist passiert. Einmaliges Ereignis.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    klopfer_bad_luck: [
      "Klopfer gegen mich. Das war zu erwarten.",
      "Klar, Klopfer sind immer gegen mich.",
      "Wenn Klopfer, dann verliere ich. Gesetzmäßigkeit.",
      "Doppelter Schmerz dank Klopfer. Wie erwartet.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    streak_end_win: [
      "Streak geht weiter. Wird bald vorbei sein.",
      "Glück muss irgendwann aufhören. Bald.",
      "Nächstes Mal verliere ich wieder. Garantiert.",
      "Kein Grund zur Freude. Der Absturz kommt.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    leader_gain: [
      "Jetzt führe ich. Werde gleich wieder überholt.",
      "Führung ist stressig. Ich will das eigentlich gar nicht.",
      "Hält nicht lange, diese Führung.",
      "Nächste Runde bin ich wieder weg von der Spitze.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    leader_loss: [
      "Führung verloren. So ist es richtig. War zu gut um wahr zu sein.",
      "Endlich wieder hinten. Weniger Stress.",
      "Besser so. Führungen halten bei mir nie.",
      "Hab ich gewusst, dass es nicht bleibt.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],

    // ── Wizard ───────────────────────────────────────────────────────────────
    final_round: [
      "Letzte Runde. Dann verliere ich endgültig.",
      "Finale. Wird für mich nicht gut ausgehen.",
      "Schlusspunkt. Mein schlechtestes Ergebnis des Abends.",
      "Die letzte Chance. Die ich wahrscheinlich verpasse.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    brave_success: [
      "Hohe Ansage getroffen — Ausnahme, nicht Regel. Nächstes Mal klappt das nicht.",
      "Gewagt und geklappt. Seltenheitswert.",
      "Einmal Glück mit der mutigen Ansage. Nie wieder.",
      "Hat funktioniert. Wird nicht wieder funktionieren.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    brave_failure: [
      "Zu hoch angesagt und gescheitert. Wie ich es erwartet hatte.",
      "Mutige Ansage, klares Scheitern. Typisch.",
      "Natürlich klappt die hohe Ansage nicht. Statistisch unvermeidbar.",
      "Danebengegriffen. Wer hoch spielt, verliert — bei mir jedenfalls.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    all_correct: [
      "Alle lagen richtig. Kommt nicht nochmal vor.",
      "Kollektiver Erfolg. Seltenes Ereignis.",
      "Diesmal alle richtig. Nächste Runde wieder nicht.",
      "Überraschend. Unwahrscheinlich. Nicht reproduzierbar.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    all_wrong: [
      "Alle daneben. Das ist eigentlich mein Normalzustand.",
      "Niemand lag richtig. Erwartet.",
      "Kollektives Versagen. Zumindest bin ich nicht allein.",
      "Alle falsch. Wenigstens haben alle gleich viel verloren.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    overtake: [
      "Jemand hat mich überholt. Das war vorauszusehen.",
      "Rangwechsel. Ich rutsche nach hinten. Wie immer.",
      "Der Aufstieg anderer auf Kosten meiner Position. Natürlich.",
      "Wieder überholt. Das zieht sich durch den ganzen Abend.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    comeback: [
      "Comeback von hinten. Wird nicht reichen am Ende.",
      "Gute Runde aus letzter Position. Bringt mir nichts mehr.",
      "Beste Runde wenn es zu spät ist. Klassisch.",
      "Jetzt aufholen wenn es nichts mehr ändert. Sinnlos.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    leader_extends: [
      "Der Führende baut aus. Mein Rückstand ist hoffnungslos.",
      "Vorsprung wächst. Ich verliere. Erwartet.",
      "Je länger das Spiel, desto hoffnungsloser meine Lage.",
      "Führung wird größer. Meine Chance wird kleiner. Wen wundert's.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    single_hero: [
      "Einer macht die beste Runde. Ich natürlich nicht.",
      "Einzel-Triumph. Nicht meiner.",
      "Jemand anderem läuft es. Mir nicht.",
      "Die beste Runde geht an jemand anderen. Wie immer.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    single_disaster: [
      "Schlimmste Runde von allen. Das bin natürlich ich.",
      "Einer verliert am meisten. Rate mal wer.",
      "Wieder mal auf dem falschen Ende der Skala.",
      "Rundenletzter. Nicht überraschend.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    safe_players: [
      "Alle auf Null. Wenigstens verliere ich genauso wenig wie die anderen.",
      "Nullansagen überall. Keine Gewinner, keine Verlierer. Traurig.",
      "Auf Sicherheit gespielt. Bringt auch nichts.",
      "Null angesagt. Risikofrei und trotzdem öde.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    close_game: [
      "Alles eng beieinander. Ich verliere trotzdem.",
      "Knapper Gesamtstand. Macht es für mich nicht besser.",
      "Spannung? Ja. Für mich relevant? Nein.",
      "Alles offen. Für mich ist trotzdem der schlechteste Platz reserviert.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    mixed: [
      "Gemischte Runde. Für mich natürlich eher schlecht.",
      "Mal so mal so. Bei mir eher so.",
      "Durchschnittlich. Unterdurchschnittlich für mich.",
      "Wieder eine Runde die nichts ändert. Außer meiner Stimmung.",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
  },

  stratege: {
    routine_win: [
      "Ergebnis entspricht der Kalkulation. Plan aufgegangen.",
      "Wahrscheinlichkeit war auf meiner Seite. Erwartetes Ergebnis.",
      "Strategie korrekt ausgeführt. Punktzahl stimmt.",
      "Datenbasierte Entscheidung. Richtiges Resultat.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    routine_loss: [
      "Abweichung von der Erwartung. Ursachenanalyse läuft.",
      "Kalkulationsfehler identifiziert. Wird angepasst.",
      "Statistischer Ausreißer oder Strategiefehler — muss geprüft werden.",
      "Verlust akzeptiert. Optimierungspotential notiert.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    close_win: [
      "Marginaler Sieg. Stochastisch knapp, aber erfolgreich.",
      "Grenzwertige Situation gelöst. Faktor Zufall positiv.",
      "Knapper als kalkuliert, aber Ergebnis positiv.",
      "Varianz war diesmal günstig. Ergebnis: Sieg.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    close_loss: [
      "Marginal verfehlt. Varianz negativ.",
      "Grenzwert um eine Einheit verfehlt. Analyse zeigt: Strategie war korrekt.",
      "Statistischer Ausreißer. Erwartungswert war positiv.",
      "Minimale Abweichung. Strategie grundsätzlich richtig.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    dramatic_win: [
      "Optimale Ausführung aller Parameter. Maximales Ergebnis.",
      "Strategisches Meisterstück. Alle Variablen kontrolliert.",
      "Höchste Punktzahl. Kalkulation perfekt bestätigt.",
      "Signifikant über Erwartung. Strategie übertrifft sich selbst.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    dramatic_loss: [
      "Komplettes Strategieversagen. Alle Parameter negativ.",
      "Maximaler Schaden. Grundlegende Neuanalyse erforderlich.",
      "Katastrophale Abweichung. Strategie war fehlerhaft.",
      "Worst-Case eingetreten. Kalkulation neu aufstellen.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    bock_good_luck: [
      "Bock-Multiplikator positiv angewendet. 2x-Strategie erfolgreich.",
      "Hebel-Effekt der Bockrunde positiv genutzt.",
      "Multiplikator-Einsatz rentiert sich. Optimale Situation.",
      "Doppelter Gewinn kalkuliert und eingefahren.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    bock_bad_luck: [
      "Bock-Multiplikator negativ. Doppelter Verlust als Risiko einkalkuliert.",
      "2x-Verlust. Statistisch erwartet, wenn man Bockrunden einbezieht.",
      "Multiplikator hat gegen uns gearbeitet. Strategie anpassen.",
      "Risiko der Bockrunde hat sich materialisiert. Notiert.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    high_solo_win: [
      "Solo-Strategie vollständig aufgegangen. 60+ Punkte kalkuliert.",
      "Maximaler Solo-Ertrag. Karte-zu-Stich-Verhältnis optimal.",
      "Wahrscheinlichkeitsrechnung für Solo korrekt. Ergebnis: gewonnen.",
      "Solo-Risiko korrekt bewertet. Ertrag entspricht Erwartung.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    against_solo_win: [
      "4-gegen-1-Strategie optimal ausgeführt.",
      "Kooperative Verteidigungsstrategie erfolgreich.",
      "Team-Koordination hat funktioniert. Solo bezwungen.",
      "Gegenstrategie zum Solo statistisch korrekt — und funktioniert.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    klopfer_luck: [
      "Klopfer-Einsatz profitabel. Risiko-Ertrag-Verhältnis positiv.",
      "Multiplikator durch Klopfer positiv genutzt.",
      "Klopfer-Strategie hat sich gerechnet.",
      "Zusätzlicher Hebel positiv aktiviert.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    klopfer_bad_luck: [
      "Klopfer-Risiko negativ ausgefallen. Strategie war zu aggressiv.",
      "Klopfer-Einsatz war suboptimal. Analyse läuft.",
      "Risiko-Ertrag bei Klopfer diesmal negativ. Merken.",
      "Klopfer-Verlust. Der Gegner hatte die bessere Hand.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    streak_end_win: [
      "Erfolgsrate konstant hoch. Streak statistisch signifikant.",
      "Trend positiv. Leistungskontinuität bestätigt.",
      "Gewinnrate stabil. Strategie konsistent.",
      "Streak weiter. Kein Grund zur Anpassung.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    leader_gain: [
      "Führungsposition übernommen. Gesamtpunktzahl ist führend.",
      "Leader-Status erreicht. Position muss verteidigt werden.",
      "Statistisch führend. Strategie zur Verteidigung aktivieren.",
      "Spitzenposition. Remaining-Rounds-Analyse läuft.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    leader_loss: [
      "Führungsposition abgegeben. Differenz wird analysiert.",
      "Nicht mehr führend. Aufholjagd-Strategie erforderlich.",
      "Position verloren. Delta zum Leader berechnen und aufholen.",
      "Leader-Status verloren. Anpassung der Strategie notwendig.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],

    // ── Wizard ───────────────────────────────────────────────────────────────
    final_round: [
      "Finale Runde. Verbleibende Optimierungsmöglichkeiten minimal.",
      "Letzte Runde. Maximalertrag aus aktueller Position ableiten.",
      "Finale. Alle verbleibenden Stiche sind bekannt — Kalkulation läuft.",
      "Gesamtanalyse vor letzter Runde abgeschlossen. Strategie festgelegt.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    brave_success: [
      "Hohe Ansage mit berechneter Trefferwahrscheinlichkeit — korrekt.",
      "Risikoreiche Ansage rentiert sich. Kalkulation bestätigt.",
      "70%+ Ansage aufgegangen. Erwartungswert war positiv.",
      "Mutiger Zug mit korrekter Datenbasis. Ergebnis: Punkte.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    brave_failure: [
      "Hohe Ansage gescheitert. Stichwahrscheinlichkeit wurde überschätzt.",
      "Kalkulation der hohen Ansage fehlerhaft. Angepasst.",
      "Risikobewertung war zu optimistisch. Verlust verbucht.",
      "Wahrscheinlichkeit nicht eingetreten. Analyse: Überoptimismus.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    all_correct: [
      "100% Trefferquote. Seltenes Ergebnis — statistisch signifikant.",
      "Vollständige Vorhersagegenauigkeit aller Spieler. Notiert.",
      "Alle Ansagen korrekt. Informationsgrad der Spieler war hoch.",
      "Trefferrate 100%. Außergewöhnliche Runde.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    all_wrong: [
      "0% Trefferquote. Karten-Verteilung war nicht vorhersagbar.",
      "Alle Ansagen falsch. Informationsdefizit bei allen Spielern.",
      "Komplettes Vorhersageversagen. Zufallskomponente dominiert.",
      "Schätzfehler bei allen Spielern. Häufig bei komplexer Kartenlage.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    overtake: [
      "Rangveränderung im Gesamtstand. Position neu bewertet.",
      "Führungswechsel registriert. Neue Ausgangslage analysieren.",
      "Rangaufstieg durch optimale Rundenleistung. Planmäßig.",
      "Gesamtranking aktualisiert. Strategie für verbleibende Runden anpassen.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    comeback: [
      "Comeback aus unterer Position durch starke Rundenleistung. Statistisch möglich.",
      "Hohe Rundenpunktzahl trotz schlechter Gesamtposition. Kalkulation bestätigt Möglichkeit.",
      "Rückstand wird durch optimale Einzelrunden aufgeholt. Strategie läuft.",
      "Comeback-Potenzial durch konzentrierte Leistung realisiert.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    leader_extends: [
      "Führung wird ausgebaut. Rückholung mathematisch erschwert.",
      "Abstand wächst. Aufholwahrscheinlichkeit der Konkurrenz sinkt.",
      "Führungsausbau planmäßig. Position ist stabil.",
      "Gesamtvorsprung größer. Gewinnwahrscheinlichkeit steigt.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    single_hero: [
      "Einzelner Spieler dominant. Rundenpunktzahl signifikant über Durchschnitt.",
      "Ausreißer nach oben. Einer Spieler mit optimaler Rundenausführung.",
      "Solo-Dominanz in dieser Runde. Karten und Vorhersage passten perfekt.",
      "Rundensieger deutlich abgesetzt. Strategie war überlegen.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    single_disaster: [
      "Einzelner Spieler mit starker Negativabweichung. Fehlkalkulation.",
      "Ausreißer nach unten. Vorhersage stark von Realität abgewichen.",
      "Einer mit deutlichem Rundenverlust. Stich-Kalkulation war falsch.",
      "Maximaler Einzelschaden in der Runde. Strategie fehlerhaft.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    safe_players: [
      "Nullansagen dominieren. Risikovermeidungsstrategie verbreitet.",
      "Mehrere Spieler mit Nullansage. Konservative Strategie.",
      "Zero-Stich-Vorhersage als Standardstrategie. Verbreiteter Ansatz.",
      "Nullansager in der Überzahl. Sicherheitsdenken dominiert die Runde.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    close_game: [
      "Gesamtabstand minimal. Entscheidung fällt statistisch in letzten Runden.",
      "Enger Gesamtstand. Jede Runde hat maximales Gewicht.",
      "Punktedifferenz unter Signifikanzschwelle. Ausgang offen.",
      "Spannungsgeladene Gesamtsituation. Varianz entscheidet.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    mixed: [
      "Gemischte Runde. Trefferquote unter Erwartungswert.",
      "Teils korrekt, teils daneben. Durchschnittliche Rundenleistung.",
      "Ergebnis im Mittelfeld. Keine signifikante Verbesserung oder Verschlechterung.",
      "Standard-Rundenausgang. Keine besonderen Auffälligkeiten.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
  },

  joker: {
    routine_win: [
      "Haha, das war richtig einfach! Oder hatte ich einfach Glück?",
      "Boah, bin ich heute gut! Oder alle anderen schlecht?",
      "Ich nehme jeden Sieg! Danke, Kartenengel!",
      "Total easy! Wer kommt als Nächstes?",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    routine_loss: [
      "Haha, mist! Die Karten haben mich belogen!",
      "Okay, war nix — aber lustig wars trotzdem!",
      "Verloren? Schon? Oh. Egal, weiter!",
      "Die Karten waren heute komisch — oder ich? 😅",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    close_win: [
      "BOAH! Herzstillstand aber GEWONNEN! Das war Spaß!",
      "So knapp! Ich hab nicht mal gewusst dass ich noch drin bin!",
      "Wer braucht Puffer? Knapp ist auch drüber!",
      "Uff! Fast-Katastrophe wird zum Sieg — ICH LIEBE WIZARD!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    close_loss: [
      "Haha so knapp! Das ist zum Totlachen und Weinen gleichzeitig!",
      "EINEN PUNKT! EINEN! Das ist Humor vom Schicksal!",
      "Herzstillstand und dann verloren! Klassiker!",
      "So knapp daneben ist auch vorbei — haha, fair!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    dramatic_win: [
      "ICH BIN EIN GOTT! Ein schlechter Gott, aber immerhin!",
      "UNGLAUBLICH! Ich hab's selbst nicht geglaubt! Und ich hatte recht, es nicht zu glauben!",
      "Bestes Spiel meines Lebens — das sag ich jedes Mal!",
      "Kann gar nicht mehr atmen! Zu viel Aufregung! Haha!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    dramatic_loss: [
      "OMG! Das ist zum Totlachen! Ich bin so schlecht — und das mit Hingabe!",
      "So ein episches Versagen hat fast schon Stil!",
      "Voll der Fail! Ich präsentiere: Mein persönlicher Tiefpunkt!",
      "Das war peinlich! Aber ich steh dazu — haha!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    bock_good_luck: [
      "BOCK! 2x ICH! Das ist mathematisch meine Lieblingsrunde!",
      "Doppelt abgesahnt — ich bin UNSTOPPBAR! Haha!",
      "Bockrunde und ich kriege alles — der Tisch liebt mich!",
      "2x gewonnen! Das ist mein Brot und Butter!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    bock_bad_luck: [
      "BOCK! 2x verloren! Das Universum hasst mich! Haha!",
      "Doppelt verloren — ich bin doppelt lustig traurig!",
      "Okay das war teuer. Sehr teuer. Zum Lachen!",
      "Bockrunde gegen mich. Natürlich. Immer.",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    high_solo_win: [
      "60+ PUNKTE! ICH BIN DER SOLO-GOTT! (ein schlechter aber trotzdem!)",
      "MEIN BESTES SOLO! Das rahmne ich ein — mental!",
      "Solo mit Megapunkten — ich kann's auch wenn ich will!",
      "Alle dachten ich schaff's nicht — ich auch! Und trotzdem!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    against_solo_win: [
      "ALLE GEGEN EINEN UND WIR GEWINNEN! Teamwork macht den Traum wahr!",
      "Solo besiegt! Ich war bestimmt der Entscheidende — oder?",
      "Gemeinsam unschlagbar! Ich liebe Teamspiele!",
      "Solo runter! Und ich war mittendrin!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    klopfer_luck: [
      "KLOPFER UND GEWONNEN! Das läuft wie geschmiert!",
      "Klopfer war mein Freund heute — wir hatten ein Abkommen!",
      "Mit Klopfer abgeräumt — Glückspilz deluxe!",
      "Klopfer und rein — ich treffe alles heute!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    klopfer_bad_luck: [
      "Klopfer und verloren — die Ironie ist schmerzhaft!",
      "Ich hab den Klopfer gesetzt und verloren. Haha. Haha. Haha...",
      "Klopfer-Pech! Das ist wie ein Witz bei dem man selbst die Pointe ist!",
      "Okay das war ein teurer Spaß. Sehr teuer.",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    streak_end_win: [
      "STREAK GEHT WEITER! Ich bin eine Gewinnmaschine — kalibriert auf Chaos!",
      "Noch einer! Ich kann gar nicht mehr aufhören zu gewinnen! Haha!",
      "Unstoppable! Jemand stoppe mich! (bitte nicht)",
      "Série läuft! Das ist kein Glück, das ist Kunst!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    leader_gain: [
      "AN DER SPITZE! JA! Wer hätte das gedacht?! Ich nicht!",
      "Führung! Ich bin der Leader! Das klingt sogar seriös!",
      "Vorne! Kurz die beste Version von mir!",
      "Leader-Status! Genießen während es anhält!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    leader_loss: [
      "Führung weg — Rückkehr zum normalen Chaos!",
      "Okay nicht mehr vorne. Das war ein kurzer Traum!",
      "Leader-Status verloren aber Unterhaltungswert bleibt!",
      "Mach ich das nochmal — ja! Klappt's nochmal — vielleicht!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],

    // ── Wizard ───────────────────────────────────────────────────────────────
    final_round: [
      "LETZTE RUNDE! Ich gebe alles! (Was auch immer das bedeutet!)",
      "Finale! Jetzt oder nie! Vermutlich nie! Aber trotzdem!",
      "Schlusspunkt! Ich zeig nochmal was ich kann — was das auch ist!",
      "Letzte Chance auf Ruhm oder Schmach — ich nehme beides!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    brave_success: [
      "ICH HAB VIELE STICHE ANGESAGT UND ES STIMMT! Ich bin ein Wahrsager!",
      "Mutige Ansage getroffen — ich wusste es! (Tat ich nicht! Aber egal!)",
      "Hohe Ansage und TREFFER! Das ist wie ein Münzwurf der immer gewinnt!",
      "Riskant angesagt, korrekt gemacht — ich bin Wizard-König!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    brave_failure: [
      "Okay zu viele Stiche angesagt und verloren. Das war vorhersehbar — von allen außer mir!",
      "Mutige Ansage, mutiger Verlust! Konsistent wenigstens!",
      "Haha, hab zu hoch gepokert! Das ist der klassische Joker-Move!",
      "Danebengegriffen! Aber was für ein Versuch — Respekt an mich!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    all_correct: [
      "ALLE RICHTIG! Das ist wie wenn alle Ampeln grün sind! Legendär!",
      "Perfekte Runde von allen! Hat das jemand gescriptet?",
      "Wir alle haben recht? Das passiert nie wieder! Genießen!",
      "Alle Treffer! Ich bin Teil von etwas Historischem!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    all_wrong: [
      "ALLE FALSCH! Kollektives Versagen auf höchstem Niveau — ich bin stolz!",
      "Niemand lag richtig! Wir haben uns alle gleichzeitig verkalkuliert! Haha!",
      "Gemeinschaftliches Scheitern verbindet! Wir sind eine Einheit!",
      "Alle daneben! Das ist fast künstlerisch!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    overtake: [
      "RANGWECHSEL! Ich klettere hoch oder falle tief — beides ist aufregend!",
      "Gesamtstand dreht sich! Das ist wie Achterbahn aber für Punkte!",
      "Neue Tabellensituation! Ich behalte den Überblick! (knapp!)",
      "Rankingwechsel! Das Spiel lebt!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    comeback: [
      "COMEBACK! Aus dem Keller an die Spitze — das ist mein Movie!",
      "Schlechtester Gesamtstand, beste Runde! Das ist Wizard-Komödie!",
      "Von hinten nach vorne diese Runde — ICH LIEBE DIESES SPIEL!",
      "Comeback aktiviert! Niemand schreibt mich ab — außer mir selbst!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    leader_extends: [
      "Der Führende wächst davon! Ich winke von hinten!",
      "Vorsprung wird größer — das ist für mich ein Motivationsproblem!",
      "Führung baut aus! Ich brauche eine Wende — oder ein Wunder!",
      "Je mehr der führt desto mehr kämpfe ich! (oder aufgebe, mal sehen)",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    single_hero: [
      "EINER MACHT DIE BESTE RUNDE! Hoffentlich ich! Ist es ich?",
      "Rundensieger strahlt! Das hätte ich auch sein können — wenn ich es wäre!",
      "Einer überragt alle — das ist Charakter! Respekt!",
      "Solo-Bestleistung diese Runde! Chef im Ring!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    single_disaster: [
      "EINER VERSAGT EPISCH! Das soll nicht ich sein — bin ich's?",
      "Rundenletzter mit Abstand! Das hat fast schon Unterhaltungswert!",
      "Einer verliert die Runde massiv! Mitgefühl — und Schadenfreude!",
      "Größter Rundenverlierer! Harte Runde, harte Welt!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    safe_players: [
      "Alle auf Null! Risiko? Nie gehört!",
      "Nullansagen überall! Das ist die feige aber kluge Variante!",
      "Keiner will Stiche! Passiv-aggressives Wizard!",
      "Alle sagen Null — das ist eine philosophische Aussage!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    close_game: [
      "ALLES NOCH OFFEN! Ich kann noch gewinnen! Oder verlieren! SPANNUNG!",
      "Eng beieinander! Das entscheidet sich auf der Zielgeraden!",
      "Knapper Gesamtstand — jede Runde ein Thriller!",
      "Nichts ist entschieden! Das ist mein Lieblingsstand!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    mixed: [
      "Gemischte Runde! So wie meine Persönlichkeit!",
      "Teils gut teils mies — das ist das Leben!",
      "Halbe-halbe Runde! Ich nehme das!",
      "Nichts Besonderes — was für mich schon besonders ist!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
  },

  eitle: {
    routine_win: [
      "Natürlich habe ich gewonnen. War nicht anders zu erwarten.",
      "Alle bewundern mich. Und zu Recht.",
      "Meine Strategie ist einfach unschlagbar.",
      "Ich gewinne halt. Das ist meine Natur.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    routine_loss: [
      "Die Karten haben mich nicht verdient.",
      "Fehler des Tisches — nicht meiner.",
      "Ich bin besser als dieses Ergebnis zeigt!",
      "Unfair. Jeder kann sehen dass ich der Bessere bin.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    close_win: [
      "Ich gewinne auch knapp — das Talent schlägt immer durch.",
      "Gerade so, aber ich gewinne halt immer.",
      "Knapp? Ich sage bewusst hauchdünn gespielt — für die Spannung!",
      "Den anderen zeigen dass ich auch im Schlaf gewinnen kann.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    close_loss: [
      "Das war Betrug. Offensichtlich.",
      "Einen Punkt! Das war manipuliert!",
      "So knapp verloren? Das kann ich nicht akzeptieren.",
      "Fehler des Spielsystems. Ich hätte das gewonnen.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    dramatic_win: [
      "ICH BIN EIN GENIE! Schaut mich alle an!",
      "MEISTERLEISTUNG! Nicht dass es überraschend wäre.",
      "Das war mein bestes Spiel — von vielen Meisterleistungen.",
      "Alle mögen bewundern was sie gesehen haben.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    dramatic_loss: [
      "SABOTAGE! Jemand hat mich sabotiert!",
      "Das ist unmöglich. Ich bin zu gut um so zu verlieren.",
      "SCHÄNDLICH! Die anderen haben zusammengearbeitet gegen mich!",
      "Das war ein Test und ich habe absichtlich schlechter gespielt.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    bock_good_luck: [
      "DOPPELT GEWONNEN! Natürlich — Talent multipliziert sich.",
      "Bockrunde mit mir — das ist eine Garantie für doppelten Sieg.",
      "2x für mich. Das ist mir ehrlich gesagt nicht genug.",
      "Doppelter Sieg, wie immer wenn ich Bockrunde spiele.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    bock_bad_luck: [
      "SABOTAGE! Die Bockrunde wurde gegen mich manipuliert!",
      "Doppelt verloren? Das ist Betrug — anders lässt es sich nicht erklären.",
      "UNFAIR! Der Tisch ist gegen mich!",
      "Bockrunde verloren? Das passiert normalerweise nicht. Jemand schummelt.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    high_solo_win: [
      "SOLO-MEISTERSTÜCK! 60+ Punkte — genau wie ich es geplant hatte.",
      "Natürlich habe ich das Solo gewonnen. Bin ich.",
      "ICH BIN DER SOLO-KÖNIG! Alle treten zur Audienz an.",
      "Solo gewonnen — als würde ich etwas anderes erwarten.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    against_solo_win: [
      "Team gewonnen — mit mir als Anführer war das keine Frage.",
      "Ich habe das Team zum Sieg geführt. Die anderen hatten Glück dass ich dabei war.",
      "Solo besiegt. Ich war natürlich der entscheidende Faktor.",
      "Gemeinsam — aber hauptsächlich wegen mir.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    klopfer_luck: [
      "KLOPFER UND GEWONNEN! Natürlich — das Risiko zahlt sich bei mir immer aus.",
      "Klopfer gesetzt, Klopfer gewonnen. Das nennt sich Klasse.",
      "Mit Klopfer gewonnen. Normalerweise muss man dafür Können haben. Habe ich.",
      "Klopfer-Glück? Nein — Klopfer-Talent.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    klopfer_bad_luck: [
      "Klopfer verloren! Das war offensichtlich Betrug!",
      "UNFAIR! Der Klopfer wurde gegen mich gerichtet!",
      "Klopfer-Verlust. Sabotage. Klare Sache.",
      "Ich hätte den Klopfer nie gesetzt wenn ich gewusst hätte dass sie schummeln.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    streak_end_win: [
      "Streak geht weiter — war klar. Ich bin nicht zu stoppen.",
      "UNSTOPPHBAR! Jemand schreibe das auf.",
      "Noch ein Sieg in der Serie. Ich bin eine Legende.",
      "Die anderen kämpfen um Platz 2. Respekt dafür.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    leader_gain: [
      "AN DER SPITZE! NATÜRLICH! Wo sonst sollte ich sein?",
      "Leader-Position. Das ist mein angestammter Platz.",
      "Führung übernommen. Danke, war schon lange überfällig.",
      "Jetzt führe ich — nun kann die Partie wirklich beginnen.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    leader_loss: [
      "Führung verloren! SABOTAGE!",
      "Das ist unmöglich — ich wurde betrogen!",
      "Leader abgegeben? Das akzeptiere ich nicht!",
      "SKANDAL! Jemand hat meinen Rang manipuliert!",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],

    // ── Wizard ───────────────────────────────────────────────────────────────
    final_round: [
      "Letzte Runde — und ich gewinne natürlich. Das war nie anders.",
      "Finale! Alle Augen auf mich — und dann der Triumph.",
      "Schlusspunkt. Ich setze ihn mit Stil.",
      "Letzte Runde, letzter Beweis meiner Überlegenheit.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    brave_success: [
      "Mutige Ansage getroffen — natürlich. Nur ich traue mich und habe Recht.",
      "Hohe Ansage korrekt! Das nennt sich Selbstvertrauen — und Können.",
      "Viele Stiche angesagt und alle geholt. Als ob ich etwas anderes erwartet hätte.",
      "Mutig, korrekt, brilliant — das bin ich.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    brave_failure: [
      "Die Karten haben mich betrogen. Meine Ansage war korrekt — die Verteilung nicht.",
      "Hohe Ansage gescheitert? Das war Sabotage der anderen Spieler.",
      "Meine mutige Ansage war perfekt — das Spiel hat geschummelt.",
      "Wenn ich sage viele Stiche, meine ich das auch. Das Universum lag falsch.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    all_correct: [
      "Alle lagen richtig — ich war natürlich der Initiator dieser Energie.",
      "Perfekte Runde für alle — ich habe offenbar gute Laune ausgestrahlt.",
      "Alle korrekt! Das passiert wenn ich am Tisch sitze.",
      "Kollektiver Erfolg — angeführt von meiner Aura.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    all_wrong: [
      "Alle daneben? Die anderen haben meine Strategie nicht verstanden.",
      "Kollektives Versagen — wäre nicht passiert wenn die anderen auf mich gehört hätten.",
      "Niemand lag richtig — wenigstens zeige ich Konsequenz im Versagen.",
      "Alle falsch. Schwaches Tableau, außer meiner Position die war korrekt.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    overtake: [
      "Ich übernehme die Führung — DAS ist Wizard spielen.",
      "Rang verbessert — natürlich. Der Anstieg zur Spitze ist mein Weg.",
      "Jemand hat mich überholt? Das lasse ich nicht auf mir sitzen.",
      "Neue Rangliste — ich bin darüber wie ich stehe informiert und unzufrieden wenn nicht vorne.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    comeback: [
      "COMEBACK! Ich war nie wirklich weg — ich habe nur Anlauf genommen.",
      "Beste Runde aus hinterer Position — genau nach Plan.",
      "Von hinten durchgestartet — das zeigt wer wirklich am besten ist.",
      "Comeback! Als ob ich je wirklich aufgehört hätte zu brillieren.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    leader_extends: [
      "Vorsprung wächst — wie er es bei mir immer tut.",
      "Führung ausgebaut. Die anderen kämpfen sich um Platz 2.",
      "Abstand vergrößert sich — das ist die natürliche Ordnung.",
      "Ich entferne mich an der Spitze. Das Feld kann zuschauen.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    single_hero: [
      "Beste Runde von allen! Das war ich! Das bin immer ich!",
      "Rundensieger — wer sonst wenn nicht ich?",
      "Alle überflügelt in dieser Runde. Mein Standard.",
      "Einzelleistung über allen — die anderen sollten Notizen machen.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    single_disaster: [
      "Schlechteste Runde? Das war Sabotage durch die Karten!",
      "Rundenletzter? Das akzeptiere ich nicht — das war manipuliert.",
      "Alle gegen mich in dieser Runde. Offensichtlich.",
      "Schlechteste Rundenleistung? Lächerlich — ich wurde benachteiligt.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    safe_players: [
      "Null angesagt — eine Strategie für Anfänger. Ich spiele größer.",
      "Alle auf Null? Feiges Spiel. Ich riskiere und gewinne.",
      "Nullansagen? Mangel an Selbstvertrauen. Nicht meins.",
      "Auf Sicherheit spielen — das überlasse ich den anderen.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    close_game: [
      "Alles eng? Das ist meinen Mitspielern zu verdanken — ich wäre schon vorne.",
      "Knapper Gesamtstand. Bei mir liegt das an Fairness gegenüber dem Feld.",
      "Alles offen — das macht es interessanter für alle die mich besiegen wollen (was nicht klappt).",
      "Enger Stand. Ich gewinne am Ende trotzdem.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    mixed: [
      "Gemischte Runde. Kein Problem, ich gleiche das aus.",
      "Nicht meine beste Runde — aber ich bin trotzdem der Beste.",
      "Okay, diese Runde war nicht perfekt. Einziges Mal.",
      "Mittelmäßige Runde — für andere wäre das gut. Für mich ist das Underperformance.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
  },

  stoische: {
    routine_win: [
      "Gewonnen.",
      "Okay.",
      "Ergebnis positiv.",
      "...",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    routine_loss: [
      "Verloren.",
      "Mhm.",
      "Weiter.",
      "Akzeptiert.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    close_win: [
      "Knapp gewonnen.",
      "Mhm.",
      "...",
      "Grenzwertig. Aber positiv.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    close_loss: [
      "Knapp verloren.",
      "...",
      "Marginal daneben.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    dramatic_win: [
      "...",
      "Deutlich gewonnen.",
      "Okay.",
      "Ergebnis gut.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    dramatic_loss: [
      "...",
      "Deutlich verloren.",
      "Mhm.",
      "Wird analysiert.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    bock_good_luck: [
      "Bockrunde. Gewonnen.",
      "Mhm. Doppelt.",
      "...",
      "Multiplikator positiv.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    bock_bad_luck: [
      "Bockrunde. Verloren.",
      "...",
      "Doppelt negativ.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    high_solo_win: [
      "Solo gewonnen.",
      "...",
      "Punkte gut.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    against_solo_win: [
      "Team gewonnen.",
      "...",
      "Solo bezwungen.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    klopfer_luck: [
      "Klopfer positiv.",
      "...",
      "Gewonnen.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    klopfer_bad_luck: [
      "Klopfer negativ.",
      "...",
      "Verloren.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    streak_end_win: [
      "Streak weiter.",
      "...",
      "Kontinuität.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    leader_gain: [
      "Führend.",
      "...",
      "An der Spitze.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    leader_loss: [
      "Nicht mehr führend.",
      "...",
      "Zurückgefallen.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],

    // ── Wizard ───────────────────────────────────────────────────────────────
    final_round: [
      "Letzte Runde.",
      "...",
      "Finale.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    brave_success: [
      "Hohe Ansage. Korrekt.",
      "...",
      "Mutig. Richtig.",
      "Mhm. Getroffen.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    brave_failure: [
      "Hohe Ansage. Falsch.",
      "...",
      "Zu viel angesagt.",
      "Mhm. Daneben.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    all_correct: [
      "Alle korrekt.",
      "...",
      "Vollständige Trefferquote.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    all_wrong: [
      "Alle falsch.",
      "...",
      "Keine Treffer.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    overtake: [
      "Rangwechsel.",
      "...",
      "Neuer Stand.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    comeback: [
      "Aufgeholt.",
      "...",
      "Beste Runde. Trotzdem hinten.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    leader_extends: [
      "Abstand wächst.",
      "...",
      "Führung stabiler.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    single_hero: [
      "Einer dominiert die Runde.",
      "...",
      "Rundensieger.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    single_disaster: [
      "Einer verliert stark.",
      "...",
      "Rundenletzter.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    safe_players: [
      "Null angesagt.",
      "...",
      "Konservativ.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    close_game: [
      "Eng beieinander.",
      "...",
      "Knapper Gesamtstand.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    mixed: [
      "Gemischt.",
      "...",
      "Mhm.",
      "Okay.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
  },

  empoerte: {
    routine_win: [
      "ENDLICH GERECHTIGKEIT! Das war mein Recht!",
      "HA! ICH HABE GEWONNEN! Wie es sein sollte!",
      "DAS IST RECHT SO! Endlich bekomme ich was mir zusteht!",
      "NACHGEWIESEN! Ich bin besser als alle dachten!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    routine_loss: [
      "DAS IST UNFAIR! Ich hätte das gewonnen sollen!",
      "SCHÄNDLICH! Dieses Ergebnis ist inakzeptabel!",
      "ICH BIN EMPÖRT! Das kann nicht mit rechten Dingen zugehen!",
      "UNGERECHTIGKEIT! Ich protestiere!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    close_win: [
      "JA! KNAPP ABER RECHT! Das war verdient!",
      "GERECHTIGKEIT! So knapp aber das war mein Sieg!",
      "HA! Das ist MEIN RECHT gewesen!",
      "ENDLICH! So sollte es immer sein!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    close_loss: [
      "BETRUG! So knapp verloren — das war manipuliert!",
      "DAS KANN NICHT SEIN! Einen Punkt! UNGERECHTIGKEIT!",
      "SCHÄNDLICH! So knapp verloren ist doch Betrug!",
      "ICH BIN ENTRÜSTET! Das war zu knapp um ehrlich zu sein!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    dramatic_win: [
      "HA! UNGLAUBLICH ABER RECHT! Das ist mein Triumph!",
      "ICH BIN DER GROSSE GEWINNER! Das war immer klar!",
      "MEISTERLEISTUNG! HA! Das ist was mir gebührt!",
      "FANTASTISCH! Das ist mein Recht!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    dramatic_loss: [
      "HÖLLE! DAS KANN NICHT WAHR SEIN! SABOTAGE!",
      "BETRUG! SCHÄNDLICH! Das war manipuliert!",
      "DAS IST UNFAIR! Ich erhebe Einspruch!",
      "ICH BIN ENTRÜSTET! Das Ergebnis ist nicht anzuerkennen!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    bock_good_luck: [
      "JA! DOPPELT GEWONNEN! HA! Das war mein Recht!",
      "BOCKRUNDE! DAS IST GERECHT! Endlich doppelt belohnt!",
      "2x FÜR MICH! DAS IST RECHT SO!",
      "DOPPELT! Gerechte Strafe für die anderen!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    bock_bad_luck: [
      "BETRUG! DOPPELT VERLOREN! Das ist Absicht!",
      "SCHÄNDLICH! BOCKRUNDE GEGEN MICH! UNGERECHTIGKEIT!",
      "DAS KANN NICHT SEIN! Doppelt bestraft!",
      "ICH BIN ENTRÜSTET! Bockrunde gegen mich — systematisch!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    high_solo_win: [
      "HA! 60+ PUNKTE! ICH HABE RECHT GEHABT! Solo gewonnen!",
      "UNGLAUBLICH ABER GERECHT! Das war mein Solo!",
      "SOLO GEWONNEN! Das ist was mir gebührt!",
      "DAS IST MEIN RECHT! Solo mit Mega-Punkten!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    against_solo_win: [
      "JA! TEAM GEWONNEN! Das ist gerechte Strafe für den Solo-Spieler!",
      "ALLE GEGEN EINEN! UND WIR SIEGEN! GERECHT!",
      "DAS IST RECHT! Übermacht des Teams!",
      "GEMEINSAM GEWONNEN! Das nennt sich Gerechtigkeit!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    klopfer_luck: [
      "JA! KLOPFER UND GEWONNEN! DAS IST MEIN RECHT!",
      "KLOPFER! RECHT SO! Das hat mir gebührt!",
      "MIT KLOPFER GEWONNEN! HA! Gerechter Ausgang!",
      "KLOPFER-SIEG! Das ist was ich verdient habe!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    klopfer_bad_luck: [
      "BETRUG! KLOPFER VERLOREN! Das ist systematische Ungerechtigkeit!",
      "SCHÄNDLICH! KLOPFER GEGEN MICH! Wieder mal!",
      "ICH BIN EMPÖRT! Klopfer-Verlust — das war abgesprochen!",
      "UNGERECHTIGKEIT! Klopfer immer gegen mich!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    streak_end_win: [
      "JA! STREAK GEHT WEITER! Gerechtigkeit setzt sich fort!",
      "RECHT SO! Ich gewinne und das ist korrekt!",
      "ICH HABE GEWONNEN! HA! Das Universum hat Recht!",
      "STREAK! DAS IST MEIN RECHT!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    leader_gain: [
      "JA! AN DER SPITZE! NATÜRLICH! Das ist mein Platz!",
      "LEADER GEWORDEN! DAS IST RECHT SO!",
      "FÜHRUNG ÜBERNOMMEN! HA! Das war unvermeidlich!",
      "ICH BIN DER LEADER! Das ist was mir gebührt!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    leader_loss: [
      "UNGERECHTIGKEIT! FÜHRUNG VERLOREN! Das war Betrug!",
      "BETRUG! ICH BIN EMPÖRT! Meinen Rang gestohlen!",
      "SCHÄNDLICH! Ich war da vorne — zu Recht!",
      "DAS KANN NICHT SEIN! Führung verloren — das ist nicht fair!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],

    // ── Wizard ───────────────────────────────────────────────────────────────
    final_round: [
      "LETZTE RUNDE! Jetzt wird Gerechtigkeit gesprochen!",
      "FINALE! Und ich fordere das richtige Ergebnis!",
      "DAS IST DIE LETZTE CHANCE! Für Gerechtigkeit!",
      "Schlusspunkt — und der muss gerecht sein!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    brave_success: [
      "JA! MUTIGE ANSAGE GETROFFEN! DAS IST RECHT!",
      "HA! Hohe Ansage korrekt — das ist der Beweis meiner Überlegenheit!",
      "MUTIG UND RECHT! Das ist wie es sein soll!",
      "ICH HABE ES GEWUSST! Hohe Ansage — richtiger Instinkt!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    brave_failure: [
      "BETRUG! Meine mutige Ansage war korrekt — die Karten lagen falsch!",
      "SCHÄNDLICH! Hohe Ansage gescheitert — das war kein fairer Verlauf!",
      "DAS KANN NICHT SEIN! Meine Stich-Vorhersage war vollkommen berechtigt!",
      "ICH BIN EMPÖRT! Mutig angesagt und betrogen worden!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    all_correct: [
      "ALLE RICHTIG! DAS IST GERECHTIGKEIT FÜR ALLE!",
      "PERFEKTE RUNDE! Endlich wird alle richtig belohnt!",
      "JA! ALLE TREFFER! DAS IST WIE ES SEIN SOLL!",
      "KOLLEKTIVE GERECHTIGKEIT! Alle korrekt!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    all_wrong: [
      "ALLE FALSCH! DAS IST UNGERECHTIGKEIT DES SCHICKSALS!",
      "SCHÄNDLICH! Niemand trifft — das ist kollektiver Betrug durch die Karten!",
      "DAS KANN NICHT SEIN! Alle daneben — manipuliertes Kartenspiel!",
      "ICH BIN ENTRÜSTET! Alle falsch ist statistisch UNMÖGLICH!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    overtake: [
      "JA! ICH ÜBERNEHME! Das ist Gerechtigkeit in Aktion!",
      "RANGWECHSEL! ENDLICH AN MEINEM RICHTIGEN PLATZ!",
      "HA! ÜBERHOLT! Das war überfällig!",
      "DAS IST MEIN RECHT! Führung übernommen!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    comeback: [
      "COMEBACK! Gerechtigkeit kommt spät aber sie kommt!",
      "DAS IST MEINE STUNDE! Von hinten nach vorne!",
      "JA! BESTES ERGEBNIS! Das zeigt wer wirklich gut ist!",
      "COMEBACK IST MEIN RECHT! Ich war nie wirklich weg!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    leader_extends: [
      "DER FÜHRENDE BAUT AUS! DAS IST UNGERECHTIGKEIT!",
      "SCHÄNDLICH! Vorsprung wächst — das muss aufgehalten werden!",
      "ICH BIN EMPÖRT! Der Abstand wird größer — das ist nicht fair!",
      "DAS KANN NICHT SEIN! So ein Vorsprung ist ungerecht!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    single_hero: [
      "EINER DOMINIERT! Das ist entweder Betrug oder ich bin das!",
      "JA! RUNDENSIEGER! DAS WAR MEIN RECHT!",
      "EINER IST BESTER! Gerechtigkeit für denjenigen!",
      "HA! SOLO-RUNDE! Das ist brillant!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    single_disaster: [
      "EINER VERSAGT! DAS IST UNGERECHTIGKEIT DES SCHICKSALS!",
      "SCHÄNDLICH! Einer wird so benachteiligt — das ist Betrug!",
      "DAS KANN NICHT SEIN! So schlechte Runde — manipuliert!",
      "ICH BIN EMPÖRT! Das ist kein faires Ergebnis!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    safe_players: [
      "ALLE AUF NULL! DAS IST FEIGE UND UNRECHT!",
      "SCHÄNDLICH! Nullansagen überall — wo ist der Mut?!",
      "ICH BIN EMPÖRT! Keiner riskiert was — Feigheit!",
      "UNGERECHTIGKEIT! Null angesagt ist Kapitulation!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    close_game: [
      "ALLES OFFEN! Das ist gut für die Gerechtigkeit!",
      "ENG BEIEINANDER! Jetzt kann das Richtige noch siegen!",
      "DAS IST FAIR! Alle haben noch eine Chance!",
      "KNAPPER STAND! Jetzt muss Gerechtigkeit entscheiden!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    mixed: [
      "GEMISCHT! Das ist nicht befriedigend!",
      "SCHÄNDLICH! Mal so, mal so — das ist kein Ergebnis!",
      "ICH BIN EMPÖRT! Durchschnittliche Runde ist akzeptabel für andere — nicht für mich!",
      "DAS IST NICHT FAIR! Ich verdiene klare Ergebnisse!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
  },

  anfaenger: {
    routine_win: [
      "Echt jetzt? Hab ich wirklich gewonnen? Wow!",
      "Ich hab das gemacht? Cool!",
      "Oh! Gewonnen! Ich lerne das immer besser!",
      "Super! Ich glaube ich verstehe das langsam!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    routine_loss: [
      "Okay... was hab ich jetzt falsch gemacht?",
      "Ich lerne noch — nächstes Mal wird's besser!",
      "Hmm, nicht schlimm. Was war mein Fehler?",
      "Verloren? Ich schaue nochmal in die Regeln...",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    close_win: [
      "Uff! So knapp! Ich glaub ich hab Glück gehabt!",
      "Wow, ich hab so knapp gewonnen! Cool!",
      "Das war spannend! Und ich gewinne?",
      "Ich dachte ich verliere — aber ich gewinne?",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    close_loss: [
      "Hä? So knapp verloren? Ich dachte ich lieg gut!",
      "Okay kein Problem... warum hab ich verloren?",
      "So knapp — ich check das nicht ganz!",
      "Hab ich fast gewonnen? Oder fast verloren?",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    dramatic_win: [
      "ICH GLAUB ES NICHT! Hab ich das wirklich gemacht?!",
      "WOW! Das war mein bisher bestes Spiel!",
      "Ich bin so stolz! Das war unglaublich!",
      "Das hab sogar ich geschafft? Fantastisch!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    dramatic_loss: [
      "Hä? Was ist da alles schiefgelaufen?",
      "Das war ganz schön heftig... ich übe noch!",
      "Okay... das war kompliziert. Viel gelernt!",
      "Verloren so deutlich? Ich verstehe warum noch nicht!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    bock_good_luck: [
      "BOCK! Was ist Bock? Egal — ich hab gewonnen!",
      "Doppelt gewonnen! Bockrunden mag ich!",
      "2x für mich! Bockrunde ist toll!",
      "Bockrunde gewonnen! Das war noch einfacher!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    bock_bad_luck: [
      "Bockrunde verloren? Doppelt? Oh nein!",
      "2x verloren wegen Bock? Das ist doppelt doof!",
      "Okay Bockrunde macht alles schlimmer wenn man verliert...",
      "Hmm Bockrunde klingt lustig ist aber nicht lustig wenn man verliert!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    high_solo_win: [
      "60+ PUNKTE! Ich hab ein tolles Solo gemacht?!",
      "Solo gewonnen! Ich glaube ich lerne das wirklich!",
      "Wow, so viele Punkte! Ich bin stolz!",
      "Das war mein bisher bestes Solo!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    against_solo_win: [
      "Alle gegen einen — und wir gewinnen! Cool!",
      "Team! Ich hab mitgeholfen!",
      "Wir haben den Solo-Spieler besiegt! Super!",
      "Zusammen gewinnen ist schön — ich war dabei!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    klopfer_luck: [
      "Klopfer! Was ist Klopfer? Egal ich hab gewonnen!",
      "Klopfer und gewonnen — toll!",
      "Ich versteh Klopfer noch nicht ganz aber es war gut!",
      "Klopfer gewonnen! Ich lerne immer mehr!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    klopfer_bad_luck: [
      "Klopfer verloren? Das macht es schlimmer?",
      "Klopfer-Verlust — ist das extra schlimm? Scheinbar!",
      "Okay Klopfer kann auch blöd sein. Notiert!",
      "Hmm, mit Klopfer verloren... klingt teuer!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    streak_end_win: [
      "Streak? Was ist ein Streak? Ich gewinne einfach weiter!",
      "Ich gewinne mehrmals hintereinander! Das ist gut!",
      "Noch ein Sieg! Ich hab den Dreh raus — glaube ich!",
      "Ich gewinn immer mehr! Das macht Spaß!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    leader_gain: [
      "AN DER SPITZE! Warte — bin das wirklich ich?",
      "Ich bin jetzt Leader! Wow! Was bedeutet das?",
      "Ich führe! Das ist unglaublich — wie ist das passiert?",
      "Vorne? Ich? Das hab ich nicht erwartet!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    leader_loss: [
      "Nicht mehr vorne? Okay, warum?",
      "Führung verloren. Ich hatte Führung? Und jetzt nicht mehr?",
      "Hmm, jemand hat mich überholt. Wie macht man das?",
      "Okay nicht mehr Leader — ich lerne weiter!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],

    // ── Wizard ───────────────────────────────────────────────────────────────
    final_round: [
      "Letzte Runde! Heißt das gleich Schluss? Oh!",
      "Finale! Ich geb nochmal alles — soweit ich das kann!",
      "Letzte Chance! Ich versuch mein Bestes!",
      "Schlusspunkt! Wie viele Runden haben wir gespielt? War toll!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    brave_success: [
      "Ich hab viele Stiche angesagt und es stimmt! Wow!",
      "Mutige Ansage und richtig! Hab ich das berechnet?",
      "Das war eigentlich ein Ratespiel — und ich hab gewonnen!",
      "Ich hab so viele Stiche angesagt — und ich hab sie alle gemacht!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    brave_failure: [
      "Hm, ich hab zu viele Stiche angesagt. Wie macht man das richtig?",
      "Zu hoch angesagt — das ist der Fehler? Ich lern das noch!",
      "Okay, hohe Ansage war falsch. Nächstes Mal niedrigerer ansagen?",
      "Hab zu optimistisch angesagt. Kann man das üben?",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    all_correct: [
      "Alle lagen richtig? Das ist toll! Alle zusammen!",
      "Alle Stiche richtig angesagt! Ich auch!",
      "Wow, wir alle haben richtig geraten! Cool!",
      "Alle korrekt! Sowas Schönes!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    all_wrong: [
      "Alle haben falsch gelegen? Ist das normal?",
      "Niemand hat getroffen? Darf man das?",
      "Alle daneben — auch ich! Gemeinsam falsch ist ok?",
      "Keiner lag richtig... das passiert manchmal?",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    overtake: [
      "Rangwechsel! Jemand ist weiter vorne jetzt! Oder ich!",
      "Tabelle ändert sich! Ich verlier den Überblick...",
      "Jemand hat jemanden überholt! Das klingt gut!",
      "Gesamtstand ändert sich! Ich muss das nochmal verstehen!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    comeback: [
      "Bester in dieser Runde obwohl ich Letzter war? Das darf man?",
      "Von hinten die beste Runde? Das kann ich!",
      "Comeback! Ich glaub ich hab das richtig gemacht!",
      "Aus letztem Platz die beste Runde! Ist das möglich? Ja!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    leader_extends: [
      "Einer ist immer weiter vorne. Wie macht der das?",
      "Vorsprung wird größer. Das ist nicht gut für mich?",
      "Der Führende macht mehr Abstand. Ich müsste aufholen...",
      "Führung baut aus. Kann ich das noch einholen? Frage!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    single_hero: [
      "Einer macht die beste Runde! War das ich? Hoffentlich!",
      "Rundensieger — einer macht es viel besser als alle! Cool!",
      "Einer strahlt diese Runde! Das möchte ich auch können!",
      "Bester dieser Runde — wie macht man das?",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    single_disaster: [
      "Einer verliert diese Runde sehr stark. Oh nein!",
      "Einer hat eine sehr schlechte Runde. Das tut mir leid!",
      "Einer verliert viel — das passiert? Okay!",
      "Schlimmste Runde für einen Spieler. Das ist traurig!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    safe_players: [
      "Viele sagen 0 an! Das ist die sichere Strategie?",
      "Null-Ansagen! Das hab ich auch mal gemacht! Ist das gut?",
      "Alle auf Null? Das klingt sicher — stimmt das?",
      "Nullansage ist eine Strategie? Das probiere ich nochmal!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    close_game: [
      "Alle so nah beieinander! Das ist spannend!",
      "Wenig Abstand im Gesamtstand! Jeder kann noch gewinnen?",
      "Eng! Ich hab noch eine Chance! Oder?",
      "Alles offen! Das verstehe ich — jeder kann noch gewinnen!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    mixed: [
      "Gemischte Runde — das ist normal?",
      "Mal gut mal nicht so gut. Das ist Wizard!",
      "Teils richtig teils falsch. Ich lerne noch!",
      "Okay Runde. Ich hab mitgemacht — das zählt!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
  },

  veteran: {
    routine_win: [
      "Klassiker. Habe ich schon tausendmal so gewonnen.",
      "Standard-Sieg. Kommt vor.",
      "Passiert. Zum nächsten.",
      "Routinierter Ausgang. Notiert.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    routine_loss: [
      "Passiert. Habe ich schon tausendmal verloren. Weiter.",
      "Klassischer Verlust. Gehört dazu.",
      "Standard-Niederlage. Kenne ich.",
      "Kein Kommentar nötig. Weiter.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    close_win: [
      "Knappes Ergebnis. Kenne ich. Gewonnen ist gewonnen.",
      "Habe schon knappere Siege gehabt. Klassiker.",
      "Hauchdünner Sieg. Normal für enge Partien.",
      "Knapp. Kommt vor. Passiert.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    close_loss: [
      "Knappe Niederlage. Kenne ich in- und auswendig.",
      "Habe schon knappere Niederlagen gehabt. Passiert.",
      "Hauchdünn verloren. Alte Bekannte.",
      "Knapp daneben. Standard-Situation bei engen Partien.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    dramatic_win: [
      "Klarer Sieg. Habe schon größere erlebt.",
      "Deutliches Ergebnis. Alte Bekannte.",
      "Habe das schon zigmal erlebt. Passiert.",
      "Großer Sieg. Kommt vor.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    dramatic_loss: [
      "Deutliche Niederlage. Habe das schon tausendmal gesehen.",
      "Klassischer Einbruch. Alte Bekannte.",
      "Passiert. Habe schon Schlimmeres erlebt.",
      "Drastisches Ergebnis. Standard für diese Art von Runde.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    bock_good_luck: [
      "Bockrunde. Gewonnen. Passiert.",
      "Habe schon doppelt gewonnen. Klassiker.",
      "Bock-Sieg. Standard.",
      "Multiplikator positiv. Alte Bekannte.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    bock_bad_luck: [
      "Bockrunde. Verloren. Passiert.",
      "Habe schon doppelt verloren. Nichts Neues.",
      "Bock-Niederlage. Kommt vor.",
      "Doppelter Verlust. Kenne ich.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    high_solo_win: [
      "Solo gewonnen. Habe ich schon dutzendfach gemacht.",
      "60 Punkte Solo. Kommt vor.",
      "Solo-Sieg. Standard wenn die Karten stimmen.",
      "Routinierter Solo-Ausgang. Alte Bekannte.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    against_solo_win: [
      "Solo bezwungen. Klassiker.",
      "4 gegen 1 gewonnen. Passiert.",
      "Habe den Solo-Spieler schon hundertmal besiegt.",
      "Team-Sieg gegen Solo. Standard-Situation.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    klopfer_luck: [
      "Klopfer. Gewonnen. Kommt vor.",
      "Habe schon mit Klopfer gewonnen. Nichts Besonderes.",
      "Klopfer-Sieg. Passiert.",
      "Klopfer positiv. Alte Bekannte.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    klopfer_bad_luck: [
      "Klopfer. Verloren. Passiert.",
      "Habe schon mit Klopfer verloren. Nichts Neues.",
      "Klopfer-Niederlage. Kommt vor.",
      "Klopfer negativ. Kenne ich.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    streak_end_win: [
      "Streak. Kenne ich. Habe längere gehabt.",
      "Serie geht weiter. Passiert.",
      "Habe schon längere Gewinnserien erlebt.",
      "Streak. Klassiker.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    leader_gain: [
      "Führend. Habe ich schon öfter erlebt.",
      "Leader. Passiert.",
      "Führungsposition. Alte Bekannte.",
      "An der Spitze. Kommt vor.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    leader_loss: [
      "Führung abgegeben. Passiert.",
      "Nicht mehr Leader. Habe ich schon tausendmal erlebt.",
      "Führungsverlust. Alte Bekannte.",
      "Rangwechsel. Kommt vor.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],

    // ── Wizard ───────────────────────────────────────────────────────────────
    final_round: [
      "Letzte Runde. Habe ich schon tausendmal gespielt.",
      "Finale. Kenne ich in- und auswendig.",
      "Schlusspunkt. Kommt vor.",
      "Letzte Runde. Standard.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    brave_success: [
      "Mutige Ansage getroffen. Habe ich schon oft gesehen.",
      "Hohe Ansage korrekt. Passiert. Selten, aber passiert.",
      "Hat die mutige Ansage getroffen. Klassiker wenn die Stiche stimmen.",
      "Riskante Vorhersage bestätigt. Alte Bekannte.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    brave_failure: [
      "Mutige Ansage gescheitert. Habe ich schon hundertfach gesehen.",
      "Zu hoch angesagt. Klassiker. Passiert ständig.",
      "Hohe Ansage daneben. Standard-Fehler in Wizard.",
      "Überoptimistische Vorhersage. Kenne ich.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    all_correct: [
      "Alle korrekt. Selten aber kommt vor.",
      "Vollständige Trefferquote. Habe ich schon erlebt.",
      "Alle lagen richtig. Passiert manchmal.",
      "Komplette Runde. Alte Bekannte wenn die Stiche klar verteilt sind.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    all_wrong: [
      "Alle daneben. Klassiker wenn die Karten unlesbar sind.",
      "Nullrunde für alle. Habe ich schon gesehen.",
      "Niemand trifft. Passiert bei schwieriger Kartenverteilung.",
      "Alle falsch. Standard-Chaos-Runde.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    overtake: [
      "Rangwechsel. Habe ich schon tausendmal erlebt.",
      "Führungswechsel. Klassiker.",
      "Jemand überholt. Passiert.",
      "Neue Reihenfolge. Alte Bekannte.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    comeback: [
      "Comeback von hinten. Klassiker. Habe ich schon oft gesehen.",
      "Bester aus letzter Position. Passiert regelmäßig.",
      "Aufholjagd läuft. Standard-Wendung.",
      "Von hinten nach vorne. Habe ich schon dutzendfach erlebt.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    leader_extends: [
      "Führung baut aus. Klassischer Spielverlauf.",
      "Abstand wächst. Habe ich schon hundertmal gesehen.",
      "Führender entfernt sich. Standard wenn einer dominiert.",
      "Vorsprung wächst. Alte Bekannte in späten Runden.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    single_hero: [
      "Einer dominiert die Runde. Passiert wenn einer alle Stiche hat.",
      "Rundensieger klar. Habe ich schon dutzendfach erlebt.",
      "Einer überstrahlt alle. Klassischer Verlauf.",
      "Solo-Dominanz in der Runde. Alte Bekannte.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    single_disaster: [
      "Einer verliert stark. Kenne ich. Klassiker.",
      "Einzel-Niederlage diese Runde. Passiert.",
      "Einer hat eine schlechte Runde. Habe ich schon tausendmal gesehen.",
      "Rundenletzter. Standard wenn die Vorhersage weit daneben liegt.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    safe_players: [
      "Nullansagen. Klassische Defensivstrategie. Kenne ich.",
      "Alle auf Null. Standard-Ansatz für schwierige Runden.",
      "Konservative Nullrunde. Passiert.",
      "Mehrere Nullansagen. Alte Bekannte.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    close_game: [
      "Enges Gesamtbild. Habe ich schon tausendmal gesehen.",
      "Alle dicht beieinander. Klassiker in guten Spielen.",
      "Knapper Stand. Passiert wenn das Feld stark ist.",
      "Enger Gesamtstand. Alte Bekannte.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    mixed: [
      "Gemischte Runde. Standard.",
      "Teils gut teils schlecht. Passiert.",
      "Durchschnittliche Runde. Habe ich schon tausendmal erlebt.",
      "Nichts Besonderes. Klassischer Verlauf.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
  },

  chiller: {
    routine_win: [
      "Gewonnen. Schön. Kein Stress.",
      "Läuft. Easy peasy.",
      "War okay das. Chill.",
      "Nice. Weiter geht's.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    routine_loss: [
      "Verloren. Kein Stress. Nächste Runde.",
      "Ist okay. Chill mal.",
      "Passiert. Easy peasy.",
      "Mhm. Weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    close_win: [
      "Knapp gewonnen. Kein Stress. Ist gut.",
      "So hauchdünn. Aber okay! Chill.",
      "Fast verloren, aber gewonnen. Kein Stress.",
      "War eng. Aber läuft. Easy.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    close_loss: [
      "Knapp verloren. Ist okay. Kein Stress.",
      "Hauchdünn daneben. Easy peasy. Nächste.",
      "Fast gewonnen. Ist aber egal. Chill.",
      "So knapp. Mhm. Geht weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    dramatic_win: [
      "Großer Sieg. Cool. Kein Stress.",
      "Deutlich gewonnen. Chill. War ok.",
      "Nice win. Easy peasy wenn man chillt.",
      "Gewonnen. Schön. Geht weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    dramatic_loss: [
      "Deutlich verloren. Kein Stress. Passiert.",
      "Große Niederlage. Chill mal. Weiter.",
      "War nicht mein Tag. Easy peasy. Nächste Runde.",
      "Verloren. Egal. Kein Stress.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    bock_good_luck: [
      "Bockrunde gewonnen. Doppelt. Kein Stress, läuft.",
      "2x gewonnen. Schön. Easy peasy.",
      "Bock und gewonnen. Chill. Nice.",
      "Doppelter Sieg. War okay. Kein Stress.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    bock_bad_luck: [
      "Bockrunde verloren. Doppelt. Kein Stress, passiert.",
      "2x verloren. Ist okay. Chill mal.",
      "Bock und verloren. Easy peasy. Weiter.",
      "Doppelte Niederlage. Egal. Kein Stress.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    high_solo_win: [
      "Solo gewonnen. Gut. Kein Stress.",
      "Viele Punkte Solo. Nice. Easy peasy.",
      "Solo gut gelaufen. Chill.",
      "Schönes Solo. War okay. Kein Stress.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    against_solo_win: [
      "Gemeinsam gewonnen. Schön. Kein Stress.",
      "Team hat den Solo besiegt. Chill.",
      "Solo bezwungen. Easy peasy.",
      "Teamwork. War gut. Kein Stress.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    klopfer_luck: [
      "Klopfer gewonnen. Nice. Kein Stress.",
      "Klopfer und Sieg. Easy peasy.",
      "Klopfer positiv. Chill.",
      "Klopfer-Sieg. War gut. Kein Stress.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    klopfer_bad_luck: [
      "Klopfer verloren. Kein Stress. Passiert.",
      "Klopfer negativ. Chill mal. Weiter.",
      "Klopfer-Niederlage. Easy peasy. Nächste.",
      "Klopfer und verloren. Egal. Kein Stress.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    streak_end_win: [
      "Streak geht weiter. Schön. Kein Stress.",
      "Noch ein Sieg. Easy peasy.",
      "Läuft immer weiter. Chill.",
      "Gewinnsträhne. Nice. Kein Stress.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    leader_gain: [
      "Führe jetzt. Kein Stress. Ist okay.",
      "Leader. Chill. Easy peasy.",
      "An der Spitze. Schön. Kein Stress.",
      "Führung. War okay. Chill.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    leader_loss: [
      "Führung weg. Kein Stress. Passiert.",
      "Nicht mehr Leader. Chill mal. Easy.",
      "Rang verloren. Ist okay. Kein Stress.",
      "Führungsverlust. Easy peasy. Weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],

    // ── Wizard ───────────────────────────────────────────────────────────────
    final_round: [
      "Letzte Runde. Kein Stress. Mach ich einfach.",
      "Finale. Chill. War schon schöner.",
      "Schlusspunkt. Easy peasy.",
      "Letzte Chance. Kein Stress. Schauen wir.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    brave_success: [
      "Mutige Ansage und getroffen. Schön. Kein Stress.",
      "Hohes Risiko, geklappt. Easy peasy.",
      "Mutig angesagt, richtig. Chill. War gut.",
      "Riskante Ansage bestätigt. Nice. Kein Stress.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    brave_failure: [
      "Mutige Ansage daneben. Kein Stress. Passiert.",
      "Zu hoch angesagt. Chill mal. Weiter.",
      "Hohes Risiko, geklappt nicht. Easy peasy. Nächste.",
      "Hohe Ansage gescheitert. Ist okay. Kein Stress.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    all_correct: [
      "Alle richtig. Schön. Kein Stress.",
      "Vollständige Trefferquote. Easy peasy. Nice.",
      "Alle korrekt. Chill. War gut.",
      "Alle getroffen. Nice. Kein Stress.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    all_wrong: [
      "Alle daneben. Kein Stress. Passiert halt.",
      "Niemand trifft. Chill mal. Easy.",
      "Alle falsch. Ist okay. Kein Stress.",
      "Nullrunde für alle. Easy peasy. Weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    overtake: [
      "Rangwechsel. Kein Stress. Passiert.",
      "Jemand überholt. Easy peasy. Weiter.",
      "Neue Reihenfolge. Chill. Ist okay.",
      "Führungswechsel. Kein Stress. Läuft.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    comeback: [
      "Comeback von hinten. Nice. Kein Stress.",
      "Beste Runde trotz schlechter Position. Easy peasy.",
      "Aufgeholt. Chill. War gut.",
      "Von hinten stark. Schön. Kein Stress.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    leader_extends: [
      "Führung wächst. Kein Stress. Ist so.",
      "Abstand größer. Easy peasy. Chill.",
      "Führend entfernt sich. Ist okay. Kein Stress.",
      "Vorsprung baut aus. Easy. Schauen wir.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    single_hero: [
      "Einer dominiert die Runde. Schön für den. Kein Stress.",
      "Rundensieger klar. Easy peasy. Chill.",
      "Einer macht's besser als alle. Nice. Kein Stress.",
      "Solo-Dominanz. Chill. Ist so.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    single_disaster: [
      "Einer verliert stark. Kein Stress. Passiert.",
      "Schlimme Runde für einen. Chill mal.",
      "Einer hat's nicht gut. Easy peasy. Weiter.",
      "Roundenverlierer. Ist okay. Kein Stress.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    safe_players: [
      "Alle auf Null. Konservativ. Kein Stress.",
      "Nullansagen. Chill. Easy peasy.",
      "Auf Sicherheit gespielt. Ist okay. Kein Stress.",
      "Mehrere Null. Chill mal. Geht so.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    close_game: [
      "Alles eng. Kein Stress. Spannend aber chillig.",
      "Knapper Gesamtstand. Easy peasy. Schauen wir.",
      "Alles offen. Chill. Ist gut so.",
      "Eng beieinander. Schön. Kein Stress.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    mixed: [
      "Gemischte Runde. Kein Stress. Ist okay.",
      "Teils gut teils nicht. Easy peasy. Weiter.",
      "Durchschnittlich. Chill. Passiert.",
      "Nichts Besonderes. Kein Stress. Läuft.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
  },
};
