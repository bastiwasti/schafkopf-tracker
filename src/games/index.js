import schafkopfPlugin from "./schafkopf/plugin.js";
import wattenPlugin from "./watten/plugin.js";
import doppelkopfPlugin from "./doppelkopf/plugin.js";
import skatPlugin from "./skat/plugin.js";
import wizardPlugin from "./wizard/plugin.js";

export { createPlugin } from "./shared/createPlugin.js";

export const GAME_PLUGINS = {
  schafkopf: schafkopfPlugin,
  watten: wattenPlugin,
  doppelkopf: doppelkopfPlugin,
  skat: skatPlugin,
  wizard: wizardPlugin,
};

export default GAME_PLUGINS;
