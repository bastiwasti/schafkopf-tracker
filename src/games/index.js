import schafkopfPlugin from "./schafkopf/plugin.js";
import wizardPlugin from "./wizard/plugin.js";
import skatPlugin from "./skat/plugin.js";
import wattenPlugin from "./watten/plugin.js";

export const GAME_PLUGINS = {
  schafkopf: schafkopfPlugin,
  wizard: wizardPlugin,
  skat: skatPlugin,
  watten: wattenPlugin,
  // To add a new game: import its plugin here and add an entry
};

export default GAME_PLUGINS;
