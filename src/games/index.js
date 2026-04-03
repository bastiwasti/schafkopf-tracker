import schafkopfPlugin from "./schafkopf/plugin.js";
import wizardPlugin from "./wizard/plugin.js";

export const GAME_PLUGINS = {
  schafkopf: schafkopfPlugin,
  wizard: wizardPlugin,
  // To add a new game: import its plugin here and add an entry
};

export default GAME_PLUGINS;
