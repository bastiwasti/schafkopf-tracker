import WattenSession from "./WattenSession.jsx";
import { createPlugin } from "../shared/createPlugin.js";

const wattenPlugin = createPlugin({
  id: "watten",
  label: "Watten",
  description: "Bayerisches Kartenspiel · 4 Spieler · 2 vs 2",
  defaultStake: 0,
  playerHint: "Klicke auf Spieler, um sie Team 1 oder 2 zuzuweisen (je 2 Spieler pro Team).",
  SessionComponent: WattenSession,
  getSessionMeta: (s) => `${s.game_count} ${s.game_count === 1 ? "Runde" : "Runden"}`,
  getArchiveConfirm: () => "Watten-Runde ins Archiv verschieben?",
});

export default wattenPlugin;
