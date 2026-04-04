import { GAME_TYPES, calcSpielwert, resolveGame, calcBalances } from "./logic.js";
import GameForm from "./GameForm.jsx";
import GameCard from "./GameCard.jsx";
import SkatSession from "./SkatSession.jsx";

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

const skatPlugin = {
  id: "skat",
  label: "Skat",
  description: "Klassischer Skat · 3 Spieler · DSV-Regeln",
  defaultStake: 0.50,
  showStake: true,
  gameTypes: GAME_TYPES,
  makeDefaultForm,
  calcSpielwert,
  resolveGame,
  calcBalances,
  FormComponent: GameForm,
  HistoryCardComponent: GameCard,
  SessionComponent: SkatSession,
  getSessionMeta: (s) => `${s.game_count} ${s.game_count === 1 ? "Spiel" : "Spiele"}`,
  getArchiveConfirm: () => "Runde ins Archiv verschieben?",
};

export default skatPlugin;
