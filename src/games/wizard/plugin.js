import { getRoundCount, resolveRound, calcBalances, makeDefaultRound, getPredictionRange } from "./logic.js";
import ScoreSheet from "./ScoreSheet.jsx";
import RulesBox from "./RulesBox.jsx";
import { buildWizardCommentary } from "./commentary.js";

const wizardPlugin = {
  id: "wizard",
  label: "Wizard",
  description: "Stich-basiertes Kartenspiel · Vorhersage-Punkte",
  defaultStake: 0,
  showStake: false,

  // Wizard-spezifische Funktionen
  getRoundCount,
  resolveRound,
  calcBalances,
  makeDefaultRound,
  getPredictionRange,

  // React-Komponenten
  ScoreSheetComponent: ScoreSheet,
  RulesComponent: RulesBox,
  SessionComponent: ScoreSheet,
  buildCommentary: buildWizardCommentary,
  getSessionMeta: (s) => s.wizard_status === "completed"
    ? "Beendet"
    : `${s.game_count}/${s.game_count_max || "?"} Runden`,
  getArchiveConfirm: (s) => s.wizard_status === "completed"
    ? null
    : "Wizard-Session ins Archiv verschieben?",
};

export default wizardPlugin;
