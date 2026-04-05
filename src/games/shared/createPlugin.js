/**
 * Factory-Funktion für Spiel-Plugins.
 *
 * Setzt sinnvolle Defaults für alle optionalen Felder.
 * Ein neues Spiel braucht mindestens: id, label, description, defaultStake, SessionComponent
 *
 * @param {object} config - Plugin-Konfiguration (game-spezifisch)
 * @returns {object} Vollständiges Plugin-Objekt mit Defaults
 */
export function createPlugin(config) {
  return {
    // UI
    showStake: false,
    playerCount: null,           // { min, max } oder null
    playerHint: null,            // Erklärungstext im Session-Erstellungsformular
    // Components (null = nicht vorhanden)
    FormComponent: null,
    HistoryCardComponent: null,
    RulesComponent: null,
    // Logic (null = nicht implementiert)
    buildCommentary: null,
    calcBalances: null,
    makeDefaultForm: null,
    // Display
    getSessionMeta: (s) => `${s.game_count} ${s.game_count === 1 ? "Spiel" : "Spiele"}`,
    getArchiveConfirm: () => "Runde ins Archiv verschieben?",
    // Game-specific overrides
    ...config,
  };
}
