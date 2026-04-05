import BockBar from "../../components/BockBar.jsx";
import GameSessionContainer from "../shared/GameSessionContainer.jsx";
import { GAME_PLUGINS } from "../index.js";
import { buildFullCommentary } from "./commentary.js";

export default function DoppelkopfSession({ session, registeredPlayers = [], onBack, onSessionUpdated }) {
  const plugin = GAME_PLUGINS[session.game_type];
  const { history, bock, stake } = session;
  const { players } = session;
  const dkOptions = typeof session.doppelkopf_options === 'string'
    ? JSON.parse(session.doppelkopf_options)
    : (session.doppelkopf_options || {});
  const soloValue = dkOptions.solo_value ?? 3;

  const handleBockChange = async (newBock) => {
    const res = await fetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bock: newBock }),
    });
    if (res.ok) onSessionUpdated({ ...session, bock: newBock });
  };

  const onSubmitGame = async (form, { bock, stake }) => {
    const { changes, spielwert } = plugin.resolveGame({ ...form, bock, players, stake, soloValue });
    const payload = {
      type: form.type,
      player: form.player,
      partner: form.type === "Solo" ? null : form.partner,
      won: form.won,
      kontra: form.kontra,
      ansage: form.ansage ?? null,
      re_sonderpunkte: form.re_sonderpunkte,
      kontra_sonderpunkte: form.kontra_sonderpunkte,
      bock,
      schneider: false,
      schwarz: false,
      laufende: 0,
      klopfer: [],
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
    const { changes, spielwert } = plugin.resolveGame({ ...form, bock: gameBock, players, stake, soloValue });
    const payload = {
      type: form.type,
      player: form.player,
      partner: form.type === "Solo" ? null : form.partner,
      won: form.won,
      kontra: form.kontra,
      ansage: form.ansage ?? null,
      re_sonderpunkte: form.re_sonderpunkte,
      kontra_sonderpunkte: form.kontra_sonderpunkte,
      bock: gameBock,
      schneider: false,
      schwarz: false,
      laufende: 0,
      klopfer: [],
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
    kontra: game.kontra ?? false,
    ansage: game.ansage ?? null,
    re_sonderpunkte: game.re_sonderpunkte ?? { fuchs: 0, doppelkopf: 0, karlchen: 0 },
    kontra_sonderpunkte: game.kontra_sonderpunkte ?? { fuchs: 0, doppelkopf: 0, karlchen: 0 },
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
      topSlot={
        <>
          <BockBar bock={bock} onBockChange={handleBockChange} />
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#8b6914", fontStyle: "italic", margin: "4px 0 2px", paddingLeft: 2 }}>
            <span>Normal: <strong>{stake.toFixed(2)} €</strong></span>
            <span>·</span>
            <span>Solo: <strong>{soloValue.toFixed(2)} €</strong></span>
          </div>
        </>
      }
      gameContext={{ bock, stake, soloValue }}
    />
  );
}
