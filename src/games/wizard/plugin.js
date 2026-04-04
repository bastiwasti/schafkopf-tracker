import { getRoundCount, calcBalances, makeDefaultRound } from "./logic.js";
import ScoreSheet from "./ScoreSheet.jsx";
import RulesBox from "./RulesBox.jsx";

function makeDefaultForm(players) {
  return makeDefaultRound(players);
}

const wizardPlugin = {
  id: "wizard",
  label: "Wizard",
  description: "Stich-basiertes Kartenspiel · Vorhersage-Punkte",
  defaultStake: 0,
  showStake: false,
  getRoundCount,
  makeDefaultForm,
  calcBalances,
  FormComponent: null,
  HistoryCardComponent: null,
  RulesComponent: RulesBox,
  SessionComponent: ScoreSheet,
  getSessionMeta: (s) => `${s.game_count} ${s.game_count === 1 ? "Runde" : "Runden"}`,
  getArchiveConfirm: () => "Runde ins Archiv verschieben?",
};

export default wizardPlugin;
