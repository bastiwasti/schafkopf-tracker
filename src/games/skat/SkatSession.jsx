import { GAME_PLUGINS } from "../index.js";
import GameSessionContainer from "../shared/GameSessionContainer.jsx";

export default function SkatSession({ session, registeredPlayers = [], onBack, onSessionUpdated }) {
  const plugin = GAME_PLUGINS[session.game_type];
  const { players, skat_bock_level: bockLevel, stake } = session;

  const fetchHistory = async () => {
    const res = await fetch(`/api/sessions/${session.id}/skat`);
    return res.ok ? res.json() : [];
  };

  const onSubmitGame = async (form) => {
    const res = await fetch(`/api/sessions/${session.id}/skat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, bock: bockLevel }),
    });
    return res.ok ? res.json() : null;
  };

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

  const makeEditForm = (game) => ({
    game_type: game.game_type,
    declarer: game.declarer,
    partner: game.partner,
    contra: game.contra,
    won: !!game.won,
    schneider: !!game.schneider,
    schwarz: !!game.schwarz,
    laufende: game.laufende,
    kontra_multiplier: game.kontra_multiplier,
    bock: game.bock,
  });

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
      makeDefaultForm={plugin.makeDefaultForm}
      makeEditForm={makeEditForm}
      calcBalances={plugin.calcBalances}
      FormComponent={plugin.FormComponent}
      HistoryCardComponent={plugin.HistoryCardComponent}
      gameContext={{ bock: bockLevel, stake }}
    />
  );
}
