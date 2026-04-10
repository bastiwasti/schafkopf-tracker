import { useState, useCallback } from "react";
import { GAME_PLUGINS } from "../index.js";
import GameSessionContainer from "../shared/GameSessionContainer.jsx";
import { buildFullCommentary } from "./commentary.js";

export default function SkatSession({ session, registeredPlayers = [], _onBack, onSessionUpdated }) {
  const plugin = GAME_PLUGINS[session.game_type];
  const [lastActivePlayers, setLastActivePlayers] = useState(null);

  const fetchHistory = async () => {
    const res = await fetch(`/api/sessions/${session.id}/skat`);
    return res.ok ? res.json() : [];
  };

  const onSubmitGame = async (form) => {
    if (form.active_players) setLastActivePlayers(form.active_players);
    const res = await fetch(`/api/sessions/${session.id}/skat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    return res.ok ? res.json() : null;
  };

  const makeDefaultForm = useCallback((ps) => {
    const base = plugin.makeDefaultForm(ps);
    if (ps.length > 3 && lastActivePlayers) {
      const valid = lastActivePlayers.filter(p => ps.includes(p));
      if (valid.length === 3) {
        base.active_players = valid;
        base.declarer = valid[0];
        base.ramsch_points = Object.fromEntries(valid.map(p => [p, 0]));
      }
    }
    return base;
  }, [plugin, lastActivePlayers]);

  const onUpdateGame = async (gameId, form) => {
    const res = await fetch(`/api/sessions/${session.id}/skat/${gameId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    return res.ok ? res.json() : null;
  };

  const onArchiveGame = async (gameId) => {
    const res = await fetch(`/api/sessions/${session.id}/skat/${gameId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived_at: new Date().toISOString() }),
    });
    return res.ok ? res.json() : null;
  };

  const onUndoGame = async () => {
    const res = await fetch(`/api/sessions/${session.id}/skat/last`, { method: "DELETE" });
    if (res.ok) {
      onSessionUpdated({ ...session, game_count: Math.max(0, (session.game_count || 0) - 1) });
    }
  };

  const makeEditForm = (game) => {
    const active = game.active_players
      ? (typeof game.active_players === "string" ? JSON.parse(game.active_players) : game.active_players)
      : session.players;
    return {
      game_type: game.game_type,
      declarer: game.declarer,
      mit_ohne: game.mit_ohne ?? "mit",
      spitzen: game.spitzen ?? 1,
      schneider: !!game.schneider,
      schwarz: !!game.schwarz,
      re: !!game.re,
      bock: !!game.bock,
      hirsch: !!game.hirsch,
      won: !!game.won,
      active_players: active,
      ramsch_points: typeof game.ramsch_points === "string"
        ? JSON.parse(game.ramsch_points)
        : (game.ramsch_points || Object.fromEntries(active.map(p => [p, 0]))),
    };
  };

  return (
    <GameSessionContainer
      session={session}
      registeredPlayers={registeredPlayers}
      onSessionUpdated={onSessionUpdated}
      fetchHistory={fetchHistory}
      onSubmitGame={onSubmitGame}
      onUpdateGame={onUpdateGame}
      onArchiveGame={onArchiveGame}
      onUndoGame={onUndoGame}
      makeDefaultForm={makeDefaultForm}
      makeEditForm={makeEditForm}
      calcBalances={plugin.calcBalances}
      FormComponent={plugin.FormComponent}
      HistoryCardComponent={plugin.HistoryCardComponent}
      buildCommentary={buildFullCommentary}
      gameContext={{}}
      formatBalance={(v) => `${v > 0 ? "+" : ""}${v} Punkte`}
    />
  );
}
