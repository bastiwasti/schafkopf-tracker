import { GAME_TYPES, calcSpielwert, resolveGame, calcBalances } from "./logic.js";
import GameForm from "./GameForm.jsx";
import HistoryCard from "./HistoryCard.jsx";
import RulesBox from "../../components/RulesBox.jsx";

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

const schafkopfPlugin = {
  id: "schafkopf",
  label: "Schafkopf",
  description: "Bayerisches Kartenspiel · Dreier · 50 Cent",
  defaultStake: 0.50,
  gameTypes: GAME_TYPES,
  makeDefaultForm,
  calcSpielwert,
  resolveGame,
  calcBalances,
  FormComponent: GameForm,
  HistoryCardComponent: HistoryCard,
  RulesComponent: RulesBox,
};

export default schafkopfPlugin;
