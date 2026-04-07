import RommeSession from "./RommeSession.jsx";
import { buildRommeCommentary } from "./commentary.js";
import { createPlugin } from "../shared/createPlugin.js";

const rommePlugin = createPlugin({
  id: "romme",
  label: "Romme",
  description: "Kartenspiel · 2-6 Spieler · Minus-Punkte",
  defaultStake: 0,
  playerCount: { min: 2, max: 6 },
  playerHint: "Wähle 2 bis 6 Spieler. Alle spielen jede Runde mit.",
  SessionComponent: RommeSession,
  buildCommentary: buildRommeCommentary,
  getSessionMeta: (s) => `${s.game_count} ${s.game_count === 1 ? "Runde" : "Runden"}`,
});

export default rommePlugin;
