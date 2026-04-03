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
    routine_win: [
      "Das war super! 😊",
      "Ich schaff das!",
      "Kein Problem!",
      "Läuft bei mir!",
      "Gutes Spiel!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    routine_loss: [
      "Kein Problem, nächstes Mal!",
      "Erfahrung gesammelt!",
      "Wird schon wieder besser!",
      "Nicht schlimm!",
      "Lernen wir draus!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    close_win: [
      "Uff, das war knapp!",
      "Gerade so reingeholt!",
      "Ein Hauch von Glück!",
      "Wow, das war spannend!",
      "Knapp, aber gewonnen!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    close_loss: [
      "So knapp! Nächstes Mal klappt's!",
      "Punkt davor gewesen, aber okay!",
      "Fast! Ich bleib positiv!",
      "Keine Sorge, das schaffen wir!",
      "So ein Hauch!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    dramatic_win: [
      "JA! WAS FÜR EIN SPIEL!",
      "UNGLAUBLICH! Das war mein Moment!",
      "ICH GLAUB ES NICHT! So gut!",
      "PERFEKT! Eines meiner besten Spiele!",
      "SENSATIONELL! Ich bin so stolz!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    dramatic_loss: [
      "Wow, das war heftig! Aber weiter geht's!",
      "Okay, das war eine Lektion!",
      "Puh, das tut weh, aber ich bleib positiv!",
      "Schockierend, aber ich lerne!",
      "Harte Nuss, aber ich bleib zuversichtlich!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    bock_good_luck: [
      "BOCK! DOPPELT GEWONNEN! 🎉",
      "Doppeltes Glück! Unglaublich!",
      "BOCKRUNDE! Das lief perfekt!",
      "JA! Die Bockrunde war mein Freund!",
      "2x für mich! Das ist mein Tag!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    bock_bad_luck: [
      "Puh, Bockrunde verloren. Aber das ist okay!",
      "Doppelt verloren, aber ich bleib positiv!",
      "Bock! Nächstes Mal klappt's besser!",
      "Das war teuer, aber kein Problem!",
      "Okay, das war eine Bockrunde. Weiter!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    high_solo_win: [
      "60+ Punkte Solo! TRAUMHAFT!",
      "MEIN BESTES SOLO! Unglaublich!",
      "ICH BIN DER KÖNIG! 😄",
      "Solo mit 60+ Punkten! Ich liebe dieses Spiel!",
      "Solo-Meister! Das war genial!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    against_solo_win: [
      "Alle gegen einen - und GEWONNEN!",
      "Teamwork! Wir haben es geschafft!",
      "Gemeinsam sind wir stark! 💪",
      "Solo geschlagen! Großartig!",
      "Zusammen gegen den Solo-Spieler gewonnen!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    klopfer_luck: [
      "Klopfer und gewonnen! GLÜCKSPILZ!",
      "KLOPFER! Das ist perfekt gelaufen!",
      "Mit Klopfer gewonnen! Unglaublich!",
      "Klopfer war mein Freund heute!",
      "Klopfer-Glück! Ich liebe es!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    klopfer_bad_luck: [
      "Klopfer und verloren. Aber kein Problem!",
      "Puh, Klopfer gegen mich. Weiter geht's!",
      "Klopfer-Pech, aber ich bleib positiv!",
      "Okay, das war ein Klopfer. Nächstes Mal!",
      "Klopfer war heute nicht mein Freund. So what!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    streak_end_win: [
      "Weiterhin gut! 🎉",
      "Auf jeden Fall! Ich bleib dran!",
      "Streak geht weiter! Super!",
      "Ich hab den Dreh raus!",
      "Noch einer! Ich kann gar nicht mehr aufhören zu gewinnen!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    leader_gain: [
      "Ich bin jetzt vorne! 🌟",
      "AN DER SPITZE! Das fühlt sich gut an!",
      "Leader! Ich mach weiter so!",
      "Führung übernommen! Großartig!",
      "Ich bin jetzt der Leader! Weiter geht's!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
    leader_loss: [
      "Führung verloren, aber kein Problem!",
      "Okay, Leader abgegeben. Ich hol's mir zurück!",
      "Nicht mehr Leader, aber ich bleib zuversichtlich!",
      "Führung weg - kommt wieder!",
      "Ich bleib positiv, ich komm zurück!",
      ...PLAYER_PERSONALITIES.optimist.catchphrases
    ],
  },

  pessimist: {
    routine_win: [
      "Wunder über Wunder...",
      "Habe ich mir nicht träumen lassen",
      "Endlich mal was Gutes",
      "Zufall, sicherlich",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    routine_loss: [
      "Wie erwartet...",
      "Das passiert ja ständig",
      "Nicht überraschend",
      "Typisch für mich",
      "Ich wusste es",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    close_win: [
      "Das war Glück, reinste Glück",
      "Hätte auch schiefgehen können",
      "Einmal Glück gehabt",
      "Das war knapp, zu knapp",
      "Rein zufällig gewonnen",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    close_loss: [
      "Hätte ich gewusst",
      "Punkt davor, natürlich",
      "Typisch, so knapp verloren",
      "Das passiert mir ständig",
      "Zufall? Ja, für die anderen",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    dramatic_win: [
      "Endlich mal was Positives",
      "Ich glaube es nicht, wirklich nicht",
      "Das kann man nicht erwarten",
      "Wahrscheinlich das letzte Mal",
      "Einmal im Leben passiert so was",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    dramatic_loss: [
      "Natürlich, das musste ja passieren",
      "Schlimmste Befürchtung bestätigt",
      "Wie ich es gedacht habe",
      "Das ist mein Standard",
      "Nicht überraschend",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    bock_good_luck: [
      "Das war definitiv Zufall",
      "Bockrunde gewonnen - wie selten",
      "Wird nicht wieder passieren",
      "Einmal im Jahr vielleicht",
      "Kurioses Glück",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    bock_bad_luck: [
      "Klar, Bockrunde verloren",
      "Wie erwartet, doppelter Schmerz",
      "Klarer Fall von Unglück",
      "So ist es halt",
      "Nicht überraschend",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    high_solo_win: [
      "Das war sicher ein Fehler",
      "Wahrscheinlich hat mir jemand geholfen",
      "Kann man nicht erwarten",
      "Wird nie wieder passieren",
      "Glück im Spiel",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    against_solo_win: [
      "Zahlen, nicht Können",
      "4 gegen 1, klar dass es geht",
      "Nicht mein Verdienst",
      "Nächstes Mal ist der Solo wieder dran",
      "Statistisch wahrscheinlich",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    klopfer_luck: [
      "Klopfer und gewonnen - muss ein Fehler sein",
      "War sicher Zufall",
      "Gibt's nicht, ist passiert",
      "Das war nicht fair",
      "Nichts als Glück",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    klopfer_bad_luck: [
      "Klar, Klopfer gegen mich",
      "Das ist zu erwarten",
      "Klopfer sind immer gegen mich",
      "Wie gedacht",
      "Kein Wunder",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    streak_end_win: [
      "Wird bald vorbei sein",
      "Dauert nicht mehr lange",
      "Glück muss irgendwann ausgehen",
      "Nächstes Mal verlier ich wieder",
      "Kein Grund zur Freude",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    leader_gain: [
      "Hält nicht lange",
      "Führe ich jetzt, verliere ich gleich",
      "Führung ist stressig",
      "Ich will eigentlich nicht vorne sein",
      "Nächste Runde bin ich wieder weg",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
    leader_loss: [
      "So ist es richtig",
      "Führung ist mir nicht angenehm",
      "Endlich wieder hinten",
      "Besser so, weniger Stress",
      "Wie erwartet",
      ...PLAYER_PERSONALITIES.pessimist.catchphrases
    ],
  },

  stratege: {
    routine_win: [
      "Alles nach Plan.",
      "Die Statistik war auf meiner Seite.",
      "Erwartetes Ergebnis.",
      "Logisch durchgezogen.",
      "Kalkulation korrekt.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    routine_loss: [
      "Fehler in der Kalkulation.",
      "Die Zahlen sprechen.",
      "Nicht optimal, aber akzeptabel.",
      "Abweichung erfasst.",
      "Analyse zeigt Verbesserungsbedarf.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    close_win: [
      "Minimale Varianz.",
      "Grenzwertige Situation gelöst.",
      "Stochastisch knapp, aber erfolgreich.",
      "Marginaler Sieg.",
      "Der Faktor Zufall war positiv.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    close_loss: [
      "Marginaler Verlust.",
      "Varianz negativ.",
      "Grenzwert nicht erreicht.",
      "Statistischer Ausreißer.",
      "Minimaler Abstand zum Erfolg.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    dramatic_win: [
      "Perfekte Ausführung der Strategie.",
      "Höchste Punktzahl erreicht.",
      "Alle Parameter optimal.",
      "Strategisches Meisterstück.",
      "Maximaler Erfolg.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    dramatic_loss: [
      "Strategisches Desaster.",
      "Alle Parameter negativ.",
      "Katastrophale Abweichung.",
      "Analyse zeigt vollständiges Versagen.",
      "Maximaler Verlust.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    bock_good_luck: [
      "Multiplikator positiv genutzt.",
      "Bock-Faktor erfolgreich angewendet.",
      "2x-Strategie erfolgreich.",
      "Optimale Nutzung des Multiplikators.",
      "Doppelter Gewinn kalkuliert.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    bock_bad_luck: [
      "Multiplikator negativ.",
      "Doppelter Verlust kalkuliert.",
      "Bock-Faktor negativ ausgefallen.",
      "Strategie hat nicht funktioniert.",
      "2x-Verlust statistisch erwartet.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    high_solo_win: [
      "Solo-Strategie perfekt ausgeführt.",
      "60+ Punkte kalkuliert und erreicht.",
      "Maximaler Solo-Erfolg.",
      "Strategisches Solo-Meisterstück.",
      "Punktzahl liegt über dem Durchschnitt.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    against_solo_win: [
      "Gegen-Solo-Strategie erfolgreich.",
      "Team-Strategie funktioniert.",
      "4-gegen-1-Ansatz optimal.",
      "Kooperative Strategie erfolgreich.",
      "Gemeinsame Verteidigung funktioniert.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    klopfer_luck: [
      "Klopfer-Strategie positiv.",
      "Klopfer-Einsatz profitabel.",
      "Zusätzlicher Faktor genutzt.",
      "Klopfer-Auszahlung erfolgreich.",
      "Strategisch klug, Klopfer zu setzen.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    klopfer_bad_luck: [
      "Klopfer-Strategie negativ.",
      "Klopfer-Einsatz nicht profitabel.",
      "Zusätzlicher Faktor negativ.",
      "Klopfer-Auszahlung negativ.",
      "Strategisch nicht optimal, Klopfer zu setzen.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    streak_end_win: [
      "Streak fortgesetzt.",
      "Erfolgsrate stabil.",
      "Statischer Trend positiv.",
      "Gewinnrate konstant hoch.",
      "Erfolgs-Kette fortgesetzt.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    leader_gain: [
      "Führungsposition übernommen.",
      "Punktzahl ist führend.",
      "Statistisch führend.",
      "Leader-Status erreicht.",
      "Top-Position.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
    leader_loss: [
      "Führungsposition abgegeben.",
      "Punktzahl wurde überholt.",
      "Statistisch nicht mehr führend.",
      "Leader-Status verloren.",
      "Position angepasst.",
      ...PLAYER_PERSONALITIES.stratege.catchphrases
    ],
  },

  joker: {
    routine_win: [
      "Zufall oder Genie? 🎲",
      "Haha, bin ich gut!",
      "Gefällt mir!",
      "Boah, das ging einfach!",
      "Total easy!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    routine_loss: [
      "Die Karten waren heute komisch 😅",
      "Haha, okay, wer lacht hier?",
      "War nicht mein Tag, aber egal!",
      "Nix zu machen, weiter geht's!",
      "Mist, aber kein Stress!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    close_win: [
      "BOAH! So knapp! 😂",
      "Herzstillstand! Aber gewonnen!",
      "Uff, das war knappes Ding!",
      "Wow, fast drüber! Aber gewonnen!",
      "Knapp drüber! Das war Spaß!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    close_loss: [
      "Haha, so knapp! Lustig!",
      "Mist, aber lustig!",
      "Herzstillstand, aber verloren! 😆",
      "Uff, knapp drüber! Haha!",
      "So ein Hauch! Lachhaft!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    dramatic_win: [
      "ICH BIN EIN GOTT! 🎉",
      "UNGlaublich! Ich liebe mich!",
      "BESTES SPIEL MEINES LEBENS! 😄",
      "Kann gar nicht mehr atmen! So gut!",
      "ICH GLAUB ES NICHT! Ich bin genial!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    dramatic_loss: [
      "OMG! Das ist zum Totlachen! 😆",
      "Das war peinlich! Aber lustig!",
      "Schock! Aber haha!",
      "Voll der Fail! Aber ich lach!",
      "Ganz schön dramatisch! Lustig!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    bock_good_luck: [
      "BOCK! 2x MICH! HAHA! 🎉",
      "Doppelt gewonnen! Ich liebe es!",
      "BOCKRUNDE! Ich bin unstopphbar!",
      "JA! Die Bockrunde liebt mich!",
      "2x für mich! Das ist mein Leben!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    bock_bad_luck: [
      "BOCK! 2x verloren! Haha! 😂",
      "Doppelter Verlust! Aber lustig!",
      "Bock! Das war zum Totlachen!",
      "Ja, das war teuer! Haha!",
      "Bockrunde verloren! Ist okay!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    high_solo_win: [
      "60+ Punkte Solo! ICH BIN DER BESTE! 🏆",
      "SOLO MEISTER! Unglaublich!",
      "ICH GLAUB NICHT MEINEN AUGEN! 🤩",
      "Solo mit 60+ Punkten! Ich bin genial!",
      "MEIN BESTES SOLO! 😎",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    against_solo_win: [
      "ALLE GEGEN EINEN UND GEWONNEN! 🎊",
      "Teamwork! Wir sind die Besten!",
      "Gemeinsam sind wir stark! 💪",
      "Solo geschlagen! JA! 🎉",
      "Zusammen gewinnen ist schön!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    klopfer_luck: [
      "Klopfer und gewonnen! GLÜCKSPILZ! 🍀",
      "KLOPFER! Das ist perfekt! 😄",
      "Mit Klopfer gewonnen! Ich liebe es!",
      "Klopfer war mein Freund! JA!",
      "Klopfer-Glück! Ich bin so glücklich!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    klopfer_bad_luck: [
      "Klopfer und verloren. Haha! 😂",
      "Puh, Klopfer gegen mich. Aber lustig!",
      "Klopfer-Pech! Aber ich lach!",
      "Okay, das war ein Klopfer. Haha!",
      "Klopfer war heute nicht mein Freund. Lustig!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    streak_end_win: [
      "Streak geht weiter! UNSTOPPHBAR! 🔥",
      "Ich hab den Dreh raus! JA!",
      "Noch einer! Ich kann gar nicht! 🤩",
      "Streak ist unendlich! Haha!",
      "Ich bin auf Roll! Weiter so!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    leader_gain: [
      "AN DER SPITZE! JA! 🌟",
      "Ich bin jetzt vorne! Unglaublich!",
      "Leader! Ich mach weiter! JA!",
      "Führung übernommen! BESTES GEFÜHL!",
      "Ich bin jetzt der Leader! WOOHOO!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
    leader_loss: [
      "Führung verloren. Aber okay! 😊",
      "Okay, Leader abgegeben. Hol es mir! JA!",
      "Nicht mehr Leader! Aber kein Stress!",
      "Führung weg - kommt zurück! Haha!",
      "Ich bleib positiv! JA!",
      ...PLAYER_PERSONALITIES.joker.catchphrases
    ],
  },

  eitle: {
    routine_win: [
      "Natürlich, ich bin der Beste!",
      "Alle bewundern mich.",
      "Perfekt wie immer.",
      "Meine Strategie ist unschlagbar.",
      "Wie erwartet, ich gewinne.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    routine_loss: [
      "Schuld der Karten!",
      "Unfair! Ich bin besser als das!",
      "Die Karten haben mich nicht verdient.",
      "Fehler des Tisches.",
      "Nicht mein Fehler.",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    close_win: [
      "Gerade so - aber ich gewinne immer!",
      "Knapp, aber immer noch der Beste!",
      "Ich gewinne auch knapp!",
      "Fast nicht, aber doch gewonnen!",
      "Ich mache es immer!",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    close_loss: [
      "Das ist geschummelt!",
      "Punkt davor! Ungerecht!",
      "Das war knapp - sollte ich gewonnen haben!",
      "Fehler des Spiels!",
      "Nicht fair!",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    dramatic_win: [
      "ICH BIN EIN GENIE! BESCHAUEN SICH MICH!",
      "MEISTERLEISTUNG! Bewundern Sie mich!",
      "DAS IST MEIN BESTES SPIEL!",
      "ICH BIN UNSCHLAGBAR!",
      "PERFEKT! Ich bin großartig!",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    dramatic_loss: [
      "SABOTAGE! Jemand hat mich sabotiert!",
      "UNGERECHTIGKEIT! Das ist unmöglich!",
      "SCHÄNDLICH! Ich bin besser!",
      "DAS KANN NICHT WAHR SEIN!",
      "HÖLLE! Das war unfair!",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    bock_good_luck: [
      "DOPPELT GEWONNEN! NATÜRLICH!",
      "BOCKRUNDE! Ich bin unbesiegbar!",
      "2x FÜR MICH! Ich bin der Beste!",
      "BOCK! Ich gewinne immer!",
      "Doppelter Sieg - wie erwartet!",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    bock_bad_luck: [
      "BOCK! DOPPELT VERLOREN! UNFAIR!",
      "Doppelter Verlust! Das ist Sabotage!",
      "Bock! Ungerecht!",
      "Das war Sabotage!",
      "Nicht fair! Ich bin besser!",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    high_solo_win: [
      "60+ PUNKTE SOLO! ICH BIN DER KÖNIG!",
      "MEIN BESTES SOLO! Bewundern Sie mich!",
      "ICH BIN DER SOLO-MEISTER!",
      "Solo mit 60+ Punkten! UNGLAUBLICH!",
      "ICH BIN GRANDIOS!",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    against_solo_win: [
      "ALLE GEGEN EINEN - UND ICH GEWONNE!",
      "Teamwork mit mir als Leader!",
      "Solo geschlagen! NATÜRLICH!",
      "Gemeinsam sind wir stark - besonders ich!",
      "Ich bin der Retter!",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    klopfer_luck: [
      "KLOPFER UND GEWONNEN! NATÜRLICH!",
      "Klopfer! Ich bin unbesiegbar!",
      "Mit Klopfer gewonnen! Perfekt!",
      "Klopfer war mein Freund! NATÜRLICH!",
      "Klopfer-Glück! Ich bin fantastisch!",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    klopfer_bad_luck: [
      "Klopfer und verloren! UNFAIR!",
      "Klopfer gegen mich! Ungerecht!",
      "Klopfer-Pech! Sabotage!",
      "Klopfer war heute nicht mein Freund! Ungerecht!",
      "Das ist nicht fair!",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    streak_end_win: [
      "STREAK GEHT WEITER! ICH BIN UNSTOPPHBAR!",
      "Ich hab den Dreh raus! NATÜRLICH!",
      "Noch einer! Ich gewinne immer!",
      "Streak ist unendlich! Ich bin genial!",
      "Ich bin auf Roll! Weiter!",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    leader_gain: [
      "AN DER SPITZE! NATÜRLICH!",
      "Ich bin jetzt vorne! Bewundern Sie mich!",
      "Leader! Ich bin der Beste!",
      "Führung übernommen! PERFECT!",
      "Ich bin jetzt der Leader! NATÜRLICH!",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
    leader_loss: [
      "Führung verloren! SABOTAGE!",
      "Leader abgegeben! Ungerecht!",
      "Nicht mehr Leader! Das ist unmöglich!",
      "Führung weg! Schuld des Tisches!",
      "Ich bin immer noch der Beste!",
      ...PLAYER_PERSONALITIES.eitle.catchphrases
    ],
  },

  stoische: {
    routine_win: [
      "...",
      "Okay.",
      "So ist es.",
      "Verstanden.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    routine_loss: [
      "Mhm.",
      "Akzeptiert.",
      "Weiter.",
      "Kein Problem.",
      "Okay.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    close_win: [
      "...",
      "Knapp.",
      "So ist es.",
      "Akzeptiert.",
      "Mhm.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    close_loss: [
      "Mhm.",
      "Knapp.",
      "Akzeptiert.",
      "Weiter.",
      "Okay.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    dramatic_win: [
      "...",
      "Okay.",
      "Verstanden.",
      "Mhm.",
      "So ist es.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    dramatic_loss: [
      "...",
      "Mhm.",
      "Akzeptiert.",
      "Weiter.",
      "Okay.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    bock_good_luck: [
      "Mhm.",
      "Doppelt.",
      "Okay.",
      "Verstanden.",
      "...",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    bock_bad_luck: [
      "Mhm.",
      "Doppelt.",
      "Akzeptiert.",
      "Weiter.",
      "Okay.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    high_solo_win: [
      "...",
      "Solo gewonnen.",
      "Okay.",
      "Mhm.",
      "Verstanden.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    against_solo_win: [
      "...",
      "Team gewonnen.",
      "Okay.",
      "Mhm.",
      "Akzeptiert.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    klopfer_luck: [
      "Mhm.",
      "Klopfer positiv.",
      "Okay.",
      "Verstanden.",
      "...",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    klopfer_bad_luck: [
      "...",
      "Klopfer negativ.",
      "Mhm.",
      "Weiter.",
      "Akzeptiert.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    streak_end_win: [
      "...",
      "Streak geht weiter.",
      "Okay.",
      "Mhm.",
      "Akzeptiert.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    leader_gain: [
      "...",
      "An der Spitze.",
      "Okay.",
      "Mhm.",
      "Verstanden.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
    leader_loss: [
      "Mhm.",
      "Führung verloren.",
      "Akzeptiert.",
      "Weiter.",
      "Okay.",
      ...PLAYER_PERSONALITIES.stoische.catchphrases
    ],
  },

  empoerte: {
    routine_win: [
      "ENDLICH GERECHTIGKEIT!",
      "HA! NACHGEWEISEN!",
      "ENDLICH!",
      "DAS IST RECHT SO!",
      "ICH HABE GEWONNEN!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    routine_loss: [
      "DAS IST UNFAIR!",
      "SCHÄNDLICH!",
      "ICH BIN EMPÖRT!",
      "DAS KANN NICHT SEIN!",
      "UNGERECHTIGKEIT!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    close_win: [
      "JA! KNAPP ABER RECHT!",
      "ENDLICH! SO SOLLTE ES SEIN!",
      "HA! ICH HABE GEWONNEN!",
      "DAS IST MEIN RECHT!",
      "GERECHTIGKEIT!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    close_loss: [
      "UNGERECHTIGKEIT!",
      "SCHÄNDLICH! KNAPP VERLOREN!",
      "DAS KANN NICHT SEIN!",
      "ICH BIN EMPÖRT!",
      "BETRUG!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    dramatic_win: [
      "HA! UNGLAUBLICH ABER RECHT!",
      "DAS IST MEIN RECHT!",
      "ICH BIN DER GROSSE GEWINNER!",
      "MEISTERLEISTUNG! HA!",
      "DAS IST FANTASTISCH!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    dramatic_loss: [
      "HÖLLE! DAS KANN NICHT WAHR SEIN!",
      "SCHÄNDLICH! UNGLAUBLICH!",
      "DAS IST UNFAIR!",
      "BETRUG! SABOTAGE!",
      "ICH BIN ENTRÜSTET!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    bock_good_luck: [
      "JA! DOPPELT GEWONNEN! HA!",
      "BOCKRUNDE! DAS IST RECHT!",
      "2x FÜR MICH! NATÜRLICH!",
      "BOCK! ICH HABE GEWONNEN!",
      "DOPPELT! HA!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    bock_bad_luck: [
      "BETRUG! DOPPELT VERLOREN!",
      "BOCK! UNGERECHTIGKEIT!",
      "SCHÄNDLICH! DOPPELT VERLOREN!",
      "DAS KANN NICHT SEIN!",
      "ICH BIN ENTRÜSTET!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    high_solo_win: [
      "HA! 60+ PUNKTE! ICH BIN DER BESTE!",
      "UNGLAUBLICH! ICH HABE RECHT!",
      "SOLO GEWONNEN! NATÜRLICH!",
      "ICH BIN EIN GENIE!",
      "DAS IST MEIN RECHT!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    against_solo_win: [
      "JA! TEAM GEWONNEN! NATÜRLICH!",
      "ALLE GEGEN EINEN - GEWONNEN!",
      "DAS IST RECHT! HA!",
      "TEAM SIEGT! ICH HABE GEWONNEN!",
      "GEMEINSAM GEWONNEN!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    klopfer_luck: [
      "JA! KLOPFER UND GEWONNEN!",
      "KLOPFER! DAS IST RECHT!",
      "MIT KLOPFER GEWONNEN! HA!",
      "DAS IST MEIN RECHT!",
      "KLOPFER GEWONNEN! NATÜRLICH!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    klopfer_bad_luck: [
      "BETRUG! KLOPFER VERLOREN!",
      "SCHÄNDLICH! UNGERECHTIGKEIT!",
      "KLOPFER VERLOREN! ICH BIN EMPÖRT!",
      "DAS KANN NICHT SEIN!",
      "UNGERECHTIGKEIT!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    streak_end_win: [
      "JA! STREAK GEHT WEITER!",
      "STREAK GEWINNEN! NATÜRLICH!",
      "ICH HABE GEWONNEN! HA!",
      "STREAK GEHT WEITER! DAS IST RECHT!",
      "ICH BIN UNSTOPPHBAR!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    leader_gain: [
      "JA! AN DER SPITZE! NATÜRLICH!",
      "LEADER GEWORDEN! ICH HABE RECHT!",
      "FÜHRUNG ÜBERNOMMEN! HA!",
      "ICH BIN DER LEADER! DAS IST MEIN RECHT!",
      "AN DER SPITZE!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
    leader_loss: [
      "UNGERECHTIGKEIT! FÜHRUNG VERLOREN!",
      "BETRUG! LEADER VERLOREN!",
      "SCHÄNDLICH! ICH BIN EMPÖRT!",
      "DAS KANN NICHT SEIN!",
      "ICH BIN ENTRÜSTET!",
      ...PLAYER_PERSONALITIES.empoerte.catchphrases
    ],
  },

  anfaenger: {
    routine_win: [
      "Echt jetzt? Wow!",
      "Ich hab das gemacht?",
      "Super! 😊",
      "Gefällt mir!",
      "Ich glaube es nicht!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    routine_loss: [
      "Okay, kein Problem!",
      "Egal, ich lerne noch!",
      "Nicht schlimm!",
      "Geht so weiter!",
      "Ich verstehe das noch nicht...",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    close_win: [
      "Uff! Das war spannend!",
      "Wow, knapp! Cool!",
      "Gefällt mir!",
      "Super spannend!",
      "Ich glaube nicht, dass ich gewonnen habe!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    close_loss: [
      "Hä? So knapp?",
      "Okay, kein Problem!",
      "Ganz knapp! Hmm!",
      "Kein Problem, ich lerne!",
      "Das war knapp!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    dramatic_win: [
      "ICH GLAUB ES NICHT! 🤩",
      "Wow, das war toll!",
      "Ich hab das wirklich gemacht?",
      "Unglaublich! Ich bin so stolz!",
      "Das war super!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    dramatic_loss: [
      "Hä? Was ist passiert?",
      "Okay, das war heftig!",
      "Ich verstehe das noch nicht...",
      "Hmm, das war schwierig!",
      "Kein Problem, ich lerne!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    bock_good_luck: [
      "BOCK! 2x GEWONNEN! 🎉",
      "Wow, doppelt gewonnen! Cool!",
      "Ich glaube nicht, dass das passiert ist!",
      "Bockrunde gewonnen! Super!",
      "2x für mich! Unglaublich!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    bock_bad_luck: [
      "BOCK! 2x verloren! Hmm!",
      "Doppelt verloren! Okay!",
      "Bockrunde verloren! Kein Problem!",
      "Ich lerne noch, ist okay!",
      "Doppelter Verlust, aber egal!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    high_solo_win: [
      "60+ PUNKTE! WOW! 🤩",
      "Ich hab ein Solo gemacht? Unglaublich!",
      "Solo mit 60+ Punkten! Ich bin stolz!",
      "Das war mein bestes Spiel!",
      "Ich glaube es nicht!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    against_solo_win: [
      "ALLE GEGEN EINEN UND GEWONNEN! 😊",
      "Teamwork! Cool!",
      "Solo geschlagen! Super!",
      "Gemeinsam gewonnen! Ich liebe es!",
      "Wir haben es geschafft!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    klopfer_luck: [
      "KLOPFER UND GEWONNEN! WOW! 🎉",
      "Klopfer! Unglaublich!",
      "Mit Klopfer gewonnen! Super!",
      "Klopfer war mein Freund! Cool!",
      "Das ist toll!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    klopfer_bad_luck: [
      "Klopfer und verloren. Hmm!",
      "Klopfer-Pech! Okay, kein Problem!",
      "Klopfer war heute nicht mein Freund. Egal!",
      "Ich lerne noch, ist okay!",
      "Klopfer verloren, aber egal!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    streak_end_win: [
      "Streak geht weiter! Cool! 😊",
      "Ich hab den Dreh raus!",
      "Noch einer! Super!",
      "Ich gewinne immer mehr!",
      "Das gefällt mir!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    leader_gain: [
      "AN DER SPITZE! WOW! 🌟",
      "Ich bin jetzt vorne! Unglaublich!",
      "Leader! Das ist cool!",
      "Führung übernommen! Super!",
      "Ich bin jetzt der Leader! Toll!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
    leader_loss: [
      "Führung verloren. Okay, kein Problem!",
      "Leader abgegeben. Ich lerne!",
      "Nicht mehr Leader. Egal!",
      "Führung weg. Kein Problem!",
      "Ich bleibe positiv!",
      ...PLAYER_PERSONALITIES.anfaenger.catchphrases
    ],
  },

  veteran: {
    routine_win: [
      "Klassiker.",
      "Passiert.",
      "Habe ich schon tausendmal gesehen.",
      "Alte Bekannte.",
      "Standard-Situation.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    routine_loss: [
      "Passiert.",
      "Habe ich schon tausendmal gesehen.",
      "Klassiker.",
      "Alte Bekannte.",
      "Standard-Situation.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    close_win: [
      "Klassiker.",
      "Passiert.",
      "Habe ich schon tausendmal gesehen.",
      "Alte Bekannte.",
      "Standard-Situation.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    close_loss: [
      "Passiert.",
      "Habe ich schon tausendmal gesehen.",
      "Klassiker.",
      "Alte Bekannte.",
      "Standard-Situation.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    dramatic_win: [
      "Alte Bekannte.",
      "Passiert.",
      "Habe ich schon tausendmal gesehen.",
      "Klassiker.",
      "Standard-Situation.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    dramatic_loss: [
      "Passiert.",
      "Habe ich schon tausendmal gesehen.",
      "Alte Bekannte.",
      "Klassiker.",
      "Standard-Situation.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    bock_good_luck: [
      "Bockrunde.",
      "Passiert.",
      "Habe ich schon tausendmal gesehen.",
      "Alte Bekannte.",
      "Standard-Situation.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    bock_bad_luck: [
      "Passiert.",
      "Habe ich schon tausendmal gesehen.",
      "Klassiker.",
      "Alte Bekannte.",
      "Standard-Situation.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    high_solo_win: [
      "Alte Bekannte.",
      "Passiert.",
      "Habe ich schon tausendmal gesehen.",
      "Klassiker.",
      "Standard-Situation.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    against_solo_win: [
      "Klassiker.",
      "Passiert.",
      "Habe ich schon tausendmal gesehen.",
      "Alte Bekannte.",
      "Standard-Situation.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    klopfer_luck: [
      "Klopfer.",
      "Passiert.",
      "Habe ich schon tausendmal gesehen.",
      "Alte Bekannte.",
      "Standard-Situation.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    klopfer_bad_luck: [
      "Passiert.",
      "Habe ich schon tausendmal gesehen.",
      "Klassiker.",
      "Alte Bekannte.",
      "Standard-Situation.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    streak_end_win: [
      "Streak.",
      "Passiert.",
      "Habe ich schon tausendmal gesehen.",
      "Klassiker.",
      "Standard-Situation.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    leader_gain: [
      "Leader.",
      "Passiert.",
      "Habe ich schon tausendmal gesehen.",
      "Klassiker.",
      "Standard-Situation.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
    leader_loss: [
      "Passiert.",
      "Habe ich schon tausendmal gesehen.",
      "Klassiker.",
      "Alte Bekannte.",
      "Standard-Situation.",
      ...PLAYER_PERSONALITIES.veteran.catchphrases
    ],
  },

  chiller: {
    routine_win: [
      "Kein Stress.",
      "Easy peasy.",
      "Ist okay.",
      "Chill mal.",
      "Geht so weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    routine_loss: [
      "Kein Stress.",
      "Ist okay.",
      "Chill mal.",
      "Easy peasy.",
      "Geht so weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    close_win: [
      "Knapp, aber kein Stress.",
      "Easy peasy.",
      "Chill mal.",
      "Ist okay.",
      "Geht so weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    close_loss: [
      "Knapp verloren, aber kein Stress.",
      "Chill mal.",
      "Easy peasy.",
      "Ist okay.",
      "Geht so weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    dramatic_win: [
      "Kein Stress.",
      "Easy peasy.",
      "Ist okay.",
      "Chill mal.",
      "Geht so weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    dramatic_loss: [
      "Kein Stress.",
      "Chill mal.",
      "Easy peasy.",
      "Ist okay.",
      "Geht so weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    bock_good_luck: [
      "Doppelt gewonnen. Kein Stress.",
      "Bockrunde gewonnen. Chill mal.",
      "2x gewonnen. Easy peasy.",
      "Ist okay.",
      "Geht so weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    bock_bad_luck: [
      "Doppelt verloren. Kein Stress.",
      "Chill mal.",
      "Easy peasy.",
      "Ist okay.",
      "Geht so weiter.",
      "Bockrunde verloren. Egal.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    high_solo_win: [
      "Solo gewonnen. Kein Stress.",
      "Easy peasy.",
      "Chill mal.",
      "Ist okay.",
      "Geht so weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    against_solo_win: [
      "Gemeinsam gewonnen. Kein Stress.",
      "Easy peasy.",
      "Chill mal.",
      "Ist okay.",
      "Geht so weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    klopfer_luck: [
      "Klopfer gewonnen. Kein Stress.",
      "Easy peasy.",
      "Chill mal.",
      "Ist okay.",
      "Geht so weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    klopfer_bad_luck: [
      "Klopfer verloren. Kein Stress.",
      "Chill mal.",
      "Easy peasy.",
      "Ist okay.",
      "Geht so weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    streak_end_win: [
      "Streak geht weiter. Kein Stress.",
      "Easy peasy.",
      "Chill mal.",
      "Ist okay.",
      "Geht so weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    leader_gain: [
      "Leader geworden. Kein Stress.",
      "Easy peasy.",
      "Chill mal.",
      "Ist okay.",
      "Geht so weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
    leader_loss: [
      "Führung verloren. Kein Stress.",
      "Chill mal.",
      "Easy peasy.",
      "Ist okay.",
      "Geht so weiter.",
      ...PLAYER_PERSONALITIES.chiller.catchphrases
    ],
  },
};
