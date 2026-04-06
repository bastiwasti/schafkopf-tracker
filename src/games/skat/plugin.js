import { calcSpielwert, calcBalances, FARB_GRAND_TYPES } from "./logic.js";
import GameForm from "./GameForm.jsx";
import GameCard from "./GameCard.jsx";
import SkatSession from "./SkatSession.jsx";
import { createPlugin } from "../shared/createPlugin.js";

function makeDefaultForm(players) {
  const active = players.length > 3 ? players.slice(0, 3) : players;
  return {
    game_type: "Karo",
    declarer: active[0] ?? "",
    mit_ohne: "mit",
    spitzen: 1,
    schneider: false,
    schwarz: false,
    re: false,
    bock: false,
    hirsch: false,
    won: true,
    active_players: active,
    ramsch_points: Object.fromEntries(active.map(p => [p, 0])),
  };
}

const skatPlugin = createPlugin({
  id: "skat",
  label: "Skat",
  description: "Klassischer Skat · 3 Spieler · DSV-Regeln",
  defaultStake: 0.50,
  showStake: false,
  playerCount: { min: 3 },
  playerHint: "Mindestens 3 Spieler. Bei 4+ sitzt pro Spiel einer aus.",
  gameTypes: FARB_GRAND_TYPES,
  makeDefaultForm,
  calcSpielwert,
  calcBalances,
  FormComponent: GameForm,
  HistoryCardComponent: GameCard,
  SessionComponent: SkatSession,
});

export default skatPlugin;
