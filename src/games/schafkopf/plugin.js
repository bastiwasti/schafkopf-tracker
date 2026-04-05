import { GAME_TYPES, calcSpielwert, resolveGame, calcBalances } from "./logic.js";
import GameForm from "./GameForm.jsx";
import HistoryCard from "./HistoryCard.jsx";
import RulesBox from "../../components/RulesBox.jsx";
import SchafkopfSession from "./SchafkopfSession.jsx";
import { buildFullCommentary } from "./commentary.js";
import { createPlugin } from "../shared/createPlugin.js";

function makeDefaultForm(players) {
  return {
    type: "Sauspiel",
    player: players[0] ?? "",
    partner: players[1] ?? "",
    won: true,
    schneider: false,
    schwarz: false,
    laufende: 0,
    klopfer: [],
  };
}

const schafkopfPlugin = createPlugin({
  id: "schafkopf",
  label: "Schafkopf",
  description: "Bayerisches Kartenspiel · 3-4 Spieler · 50 Cent",
  defaultStake: 0.50,
  showStake: true,
  playerCount: { min: 3, max: 4 },
  gameTypes: GAME_TYPES,
  makeDefaultForm,
  calcSpielwert,
  resolveGame,
  calcBalances,
  FormComponent: GameForm,
  HistoryCardComponent: HistoryCard,
  RulesComponent: RulesBox,
  SessionComponent: SchafkopfSession,
  buildCommentary: buildFullCommentary,
});

export default schafkopfPlugin;
