import BockBar from "../../components/BockBar.jsx";
import GameSessionContainer from "../shared/GameSessionContainer.jsx";
import { GAME_PLUGINS } from "../index.js";
import { buildFullCommentary } from "./commentary.js";

export default function SchafkopfSession({ session, registeredPlayers = [], onBack, onSessionUpdated }) {
  const plugin = GAME_PLUGINS[session.game_type];
  const { history, bock, stake } = session;
  const { players } = session;

  const handleBockChange = async (newBock) => {
    const res = await fetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bock: newBock }),
    });
    if (res.ok) onSessionUpdated({ ...session, bock: newBock });
  };

  const onSubmitGame = async (form, { bock, stake }) => {
    const isSolo = form.type !== "Sauspiel";
    const { changes, spielwert } = plugin.resolveGame({ ...form, bock, players, stake });
    const payload = {
      type: form.type,
      player: form.player,
      partner: isSolo ? null : form.partner,
      won: form.won,
      schneider: form.schneider,
      schwarz: form.schwarz,
      laufende: form.laufende,
      bock,
      klopfer: form.klopfer,
      spielwert,
      changes,
    };
    const res = await fetch(`/api/sessions/${session.id}/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok ? res.json() : null;
  };

  const onUpdateGame = async (gameId, form, { bock: _unused, stake }) => {
    const editingGame = session.history?.find((g) => g.id === gameId);
    const gameBock = editingGame?.bock ?? bock;
    const isSolo = form.type !== "Sauspiel";
    const { changes, spielwert } = plugin.resolveGame({ ...form, bock: gameBock, players, stake });
    const payload = {
      type: form.type,
      player: form.player,
      partner: isSolo ? null : form.partner,
      won: form.won,
      schneider: form.schneider,
      schwarz: form.schwarz,
      laufende: form.laufende,
      bock: gameBock,
      klopfer: form.klopfer,
      spielwert,
      changes,
    };
    const res = await fetch(`/api/sessions/${session.id}/games/${gameId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok ? res.json() : null;
  };

  const onArchiveGame = async (gameId) => {
    const res = await fetch(`/api/sessions/${session.id}/games/${gameId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived_at: new Date().toISOString() }),
    });
    return res.ok ? res.json() : null;
  };

  const onUndoGame = async () => {
    await fetch(`/api/sessions/${session.id}/games/last`, { method: "DELETE" });
  };

  const makeEditForm = (game) => ({
    type: game.type,
    player: game.player,
    partner: game.partner ?? players.find((p) => p !== game.player),
    won: game.won,
    schneider: game.schneider,
    schwarz: game.schwarz,
    laufende: game.laufende,
    klopfer: game.klopfer,
  });

  return (
    <GameSessionContainer
      session={session}
      registeredPlayers={registeredPlayers}
      onSessionUpdated={onSessionUpdated}
      initialHistory={history}
      onSubmitGame={onSubmitGame}
      onUpdateGame={onUpdateGame}
      onArchiveGame={onArchiveGame}
      onUndoGame={onUndoGame}
      makeDefaultForm={plugin.makeDefaultForm}
      makeEditForm={makeEditForm}
      calcBalances={plugin.calcBalances}
      buildCommentary={buildFullCommentary}
      FormComponent={plugin.FormComponent}
      HistoryCardComponent={plugin.HistoryCardComponent}
      RulesComponent={plugin.RulesComponent}
      topSlot={<BockBar bock={bock} onBockChange={handleBockChange} />}
      gameContext={{ bock, stake, sessionOptions: typeof session.schafkopf_options === 'string' ? JSON.parse(session.schafkopf_options) : (session.schafkopf_options || {}) }}
      formatBalance={plugin.formatBalance}
    />
  );
}
