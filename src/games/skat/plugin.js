import { GAME_TYPES, calcSpielwert, resolveGame, calcBalances } from "./logic.js";
import GameForm from "./GameForm.jsx";
import GameCard from "./GameCard.jsx";
import SkatSession from "./SkatSession.jsx";
import { createPlugin } from "../shared/createPlugin.js";

function makeDefaultForm(players) {
  return {
    game_type: "Grand",
    declarer: players[0] ?? "",
    partner: players[1] ?? "",
    contra: players[2] ?? "",
    won: true,
    schneider: false,
    schwarz: false,
    laufende: 0,
    kontra_multiplier: 1,
  };
}

const skatPlugin = createPlugin({
  id: "skat",
  label: "Skat",
  description: "Klassischer Skat · 3 Spieler · DSV-Regeln",
  defaultStake: 0.50,
  showStake: true,
  playerCount: { min: 3, max: 3 },
  playerHint: "Genau 3 Spieler erforderlich. Einer spielt alleine, zwei spielen gemeinsam gegen ihn.",
  gameTypes: GAME_TYPES,
  makeDefaultForm,
  calcSpielwert,
  resolveGame,
  calcBalances,
  FormComponent: GameForm,
  HistoryCardComponent: GameCard,
  SessionComponent: SkatSession,
});

export default skatPlugin;
