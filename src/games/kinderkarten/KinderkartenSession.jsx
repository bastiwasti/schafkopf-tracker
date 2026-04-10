import { useState } from "react";
import { GAME_PLUGINS } from "../index.js";
import GameSessionContainer from "../shared/GameSessionContainer.jsx";
import KinderkartenForm from "./KinderkartenForm.jsx";
import KinderkartenHistoryCard from "./KinderkartenHistoryCard.jsx";
import { calculateBalances } from "./logic.js";

export default function KinderkartenSession({ session, registeredPlayers = [], onBack, onSessionUpdated }) {
  const [wonCounts, setWonCounts] = useState({});
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    const res = await fetch(`/api/sessions/${session.id}/kinderkarten-rounds`);
    if (res.ok) {
      return await res.json();
    }
    return [];
  };

  const calcBalancesAndWonCounts = (newHistory) => {
    calculateBalances(newHistory, session.players);

    const newWonCounts = {};
    session.players.forEach(p => newWonCounts[p] = 0);
    newHistory.forEach(r => {
      if (r.winners && Array.isArray(r.winners)) {
        r.winners.forEach(winner => {
          if (newWonCounts[winner] !== undefined) {
            newWonCounts[winner]++;
          }
        });
      }
    });
    setWonCounts(newWonCounts);
  };

  const makeDefaultForm = (players) => ({
    trick_counts: Object.fromEntries(players.map(p => [p, 0])),
  });

  const makeEditForm = (round) => ({
    trick_counts: round.trick_counts,
  });

  const onSubmitGame = async (form) => {
    const res = await fetch(`/api/sessions/${session.id}/kinderkarten-rounds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const newRound = await res.json();
      const newHistory = [...history, newRound];
      setHistory(newHistory);
      calcBalancesAndWonCounts(newHistory);
      return newRound;
    }
    return null;
  };

  const onUpdateGame = async (gameId, form) => {
    const res = await fetch(`/api/sessions/${session.id}/kinderkarten-rounds/${gameId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const updated = await res.json();
      const newHistory = history.map(h => h.id === updated.id ? updated : h);
      setHistory(newHistory);
      calcBalancesAndWonCounts(newHistory);
      return updated;
    }
    return null;
  };

  const onArchiveGame = async (gameId) => {
    const res = await fetch(`/api/sessions/${session.id}/kinderkarten-rounds/${gameId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived_at: new Date().toISOString() }),
    });

    if (res.ok) {
      const archived = await res.json();
      const newHistory = history.map(h => h.id === archived.id ? { ...h, archived_at: archived.archived_at } : h);
      setHistory(newHistory);
      calcBalancesAndWonCounts(newHistory);
      return archived;
    }
    return null;
  };

  const onUndoGame = async () => {
    const res = await fetch(`/api/sessions/${session.id}/kinderkarten-rounds/last`, {
      method: "DELETE",
    });

    if (res.ok) {
      const newHistory = history.filter(h => !h.archived_at).slice(0, -1);
      setHistory(newHistory);
      calcBalancesAndWonCounts(newHistory);
      return { success: true };
    }
    return null;
  };

  const plugin = GAME_PLUGINS[session.game_type];

  const buildCommentaryWrapper = (round, players, personality, sessionHistory) => {
    if (!plugin.buildCommentary) return null;
    return plugin.buildCommentary(
      round,
      players ?? registeredPlayers,
      personality ?? 'dramatic',
      sessionHistory ?? history,
      session.game_type,
    );
  };

  const kinderkartenOptions = session.kinderkarten_options || {};

  const middleSlot = (
    <div style={{
      background: "#fdf6e3",
      border: "1px solid #d4c49a",
      borderRadius: 8,
      padding: "12px 16px",
      margin: "16px 0",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#2c1810" }}>Spiel-Optionen:</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#666" }}>
          <strong>{kinderkartenOptions.card_count || 5}</strong> Karten pro Spieler
        </span>
        {kinderkartenOptions.with_trump && (
          <span style={{ fontSize: 13, color: "#2d6a4f" }}>Mit Trumpf</span>
        )}
        {kinderkartenOptions.ober_trump && (
          <span style={{ fontSize: 13, color: "#2d6a4f" }}>Ober Trumpf</span>
        )}
        {kinderkartenOptions.unter_trump && (
          <span style={{ fontSize: 13, color: "#2d6a4f" }}>Unter Trumpf</span>
        )}
      </div>
    </div>
  );

  return (
    <GameSessionContainer
      session={session}
      registeredPlayers={registeredPlayers}
      onBack={onBack}
      onSessionUpdated={onSessionUpdated}
      fetchHistory={fetchHistory}
      onSubmitGame={onSubmitGame}
      onUpdateGame={onUpdateGame}
      onArchiveGame={onArchiveGame}
      onUndoGame={onUndoGame}
      makeDefaultForm={makeDefaultForm}
      makeEditForm={makeEditForm}
      calcBalances={calculateBalances}
      buildCommentary={buildCommentaryWrapper}
      FormComponent={(props) => <KinderkartenForm {...props} session={session} />}
      HistoryCardComponent={(props) => <KinderkartenHistoryCard {...props} players={session.players} />}
       formatBalance={(v) => `${v}`}
       wonCounts={wonCounts}
       lowestWins={false}
       gameContext={{ game_type: session.game_type }}
       middleSlot={middleSlot}
       onHistoryChange={(newHistory) => {
         setHistory(newHistory);
         calcBalancesAndWonCounts(newHistory);
       }}
     />
  );
}
