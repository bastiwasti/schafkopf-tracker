import KinderkartenSession from "./KinderkartenSession.jsx";
import { buildKinderkartenCommentary } from "./commentary.js";
import { createPlugin } from "../shared/createPlugin.js";

const kinderkartenPlugin = createPlugin({
  id: "kinderkarten",
  label: "Kinderkarten",
  description: "Einfaches Kartenspiel · Punkte zählen nach oben",
  defaultStake: 0,
  playerCount: { min: 2, max: 8 },
  playerHint: "Wähle 2 bis 8 Spieler. Punkte basierend auf Stichen.",
  SessionComponent: KinderkartenSession,
  buildCommentary: buildKinderkartenCommentary,
  getSessionMeta: (s) => `${s.game_count} ${s.game_count === 1 ? "Runde" : "Runden"}`,
});

export default kinderkartenPlugin;
