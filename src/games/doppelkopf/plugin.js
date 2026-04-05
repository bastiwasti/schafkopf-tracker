import { GAME_TYPES, calcSpielwert, resolveGame, calcBalances } from "./logic.js";
import GameForm from "./GameForm.jsx";
import HistoryCard from "./HistoryCard.jsx";
import RulesBox from "./RulesBox.jsx";
import DoppelkopfSession from "./DoppelkopfSession.jsx";
import { buildFullCommentary } from "./commentary.js";
import { createPlugin } from "../shared/createPlugin.js";

function makeDefaultForm(players) {
  return {
    type: "Normal",
    player: players[0] ?? "",
    partner: players[1] ?? "",
    won: true,
    kontra: false,
    ansage: null,
    re_sonderpunkte: { fuchs: 0, doppelkopf: 0, karlchen: 0 },
    kontra_sonderpunkte: { fuchs: 0, doppelkopf: 0, karlchen: 0 },
  };
}

const doppelkopfPlugin = createPlugin({
  id: "doppelkopf",
  label: "Doppelkopf",
  description: "Deutsches Kartenspiel · 4 Spieler · 50 Cent",
  defaultStake: 1.00,
  showStake: true,
  playerCount: { min: 4, max: 4 },
  playerHint: "Genau 4 Spieler erforderlich. Normale Spiele: 2 Spieler gegen 2 Gegenspieler. Solo: 1 gegen 3.",
  gameTypes: GAME_TYPES,
  makeDefaultForm,
  calcSpielwert,
  resolveGame,
  calcBalances,
  FormComponent: GameForm,
  HistoryCardComponent: HistoryCard,
  RulesComponent: RulesBox,
  SessionComponent: DoppelkopfSession,
  buildCommentary: buildFullCommentary,
});

export default doppelkopfPlugin;
