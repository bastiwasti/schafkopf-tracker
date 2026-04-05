import { getRoundCount, calcBalances, makeDefaultRound } from "./logic.js";
import ScoreSheet from "./ScoreSheet.jsx";
import RulesBox from "./RulesBox.jsx";
import { createPlugin } from "../shared/createPlugin.js";

const wizardPlugin = createPlugin({
  id: "wizard",
  label: "Wizard",
  description: "Stich-basiertes Kartenspiel · Vorhersage-Punkte",
  defaultStake: 0,
  playerCount: { min: 3, max: 6 },
  playerHint: "Wähle 3 bis 6 Spieler. Alle spielen jede Runde gleichzeitig mit.",
  getRoundCount,
  makeDefaultForm: makeDefaultRound,
  calcBalances,
  RulesComponent: RulesBox,
  SessionComponent: ScoreSheet,
  getSessionMeta: (s) => `${s.game_count} ${s.game_count === 1 ? "Runde" : "Runden"}`,
});

export default wizardPlugin;
