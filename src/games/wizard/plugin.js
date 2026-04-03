import { getRoundCount, resolveRound, calcBalances, makeDefaultRound, getPredictionRange } from "./logic.js";
import RoundForm from "./RoundForm.jsx";
import ScoreSheet from "./ScoreSheet.jsx";
import HistoryCard from "./HistoryCard.jsx";
import RulesBox from "./RulesBox.jsx";

const wizardPlugin = {
  id: "wizard",
  label: "Wizard",
  description: "Stich-basiertes Kartenspiel · Vorhersage-Punkte",
  defaultStake: 0,  // Kein Einsatz bei Wizard
  
  // Wizard-spezifische Funktionen
  getRoundCount,
  resolveRound,
  calcBalances,
  makeDefaultRound,
  getPredictionRange,
  
  // React-Komponenten
  RoundFormComponent: RoundForm,
  ScoreSheetComponent: ScoreSheet,
  HistoryCardComponent: HistoryCard,
  RulesComponent: RulesBox,
};

export default wizardPlugin;
