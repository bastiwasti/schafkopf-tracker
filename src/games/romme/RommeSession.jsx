import { useState, useEffect } from "react";
import { GAME_PLUGINS } from "../index.js";
import GameSessionContainer from "../shared/GameSessionContainer.jsx";
import RommeForm from "./RommeForm.jsx";
import RommeHistoryCard from "./RommeHistoryCard.jsx";
import { calculateBalances } from "./logic.js";

export default function RommeSession({ session, registeredPlayers = [], onBack, onSessionUpdated }) {
  const [wonCounts, setWonCounts] = useState({});
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    const res = await fetch(`/api/sessions/${session.id}/romme-rounds`);
    if (res.ok) {
      return await res.json();
    }
    return [];
  };

  const calcBalancesAndWonCounts = (newHistory) => {
    const newBalances = calculateBalances(newHistory, session.players);

    const newWonCounts = {};
    session.players.forEach(p => newWonCounts[p] = 0);
    newHistory.forEach(r => {
      if (r.winner && newWonCounts[r.winner] !== undefined) {
        newWonCounts[r.winner]++;
      }
    });
    setWonCounts(newWonCounts);
  };

  const getPrevBalances = () => {
    if (history.length === 0) return null;
    
    const prevHistory = history.slice(0, -1);
    const prevBalances = {};
    session.players.forEach(p => prevBalances[p] = 0);
    prevHistory.forEach(r => {
      const rScores = r.scores || {};
      Object.entries(rScores).forEach(([player, score]) => {
        if (prevBalances[player] !== undefined) {
          prevBalances[player] -= score;
        }
      });
    });
    return prevBalances;
  };

  const makeDefaultForm = (players) => ({
    winner: players[0] ?? "",
    scores: Object.fromEntries(players.filter(p => p !== players[0]).map(p => [p, 0])),
  });

  const makeEditForm = (round) => ({
    winner: round.winner,
    scores: round.scores,
  });

  const onSubmitGame = async (form) => {
    const res = await fetch(`/api/sessions/${session.id}/romme-rounds`, {
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
    const res = await fetch(`/api/sessions/${session.id}/romme-rounds/${gameId}`, {
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
    const res = await fetch(`/api/sessions/${session.id}/romme-rounds/${gameId}`, {
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
    const res = await fetch(`/api/sessions/${session.id}/romme-rounds/last`, {
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

  const buildCommentaryWrapper = (round) => {
    const prevBalances = getPrevBalances();
    return plugin.buildCommentary(round, history, registeredPlayers, 'dramatic', prevBalances);
  };

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
      FormComponent={RommeForm}
      HistoryCardComponent={(props) => <RommeHistoryCard {...props} players={session.players} />}
      formatBalance={(v) => `${v}`}
      wonCounts={wonCounts}
      lowestWins={true}
      gameContext={{}}
      onHistoryChange={(newHistory) => {
        setHistory(newHistory);
        calcBalancesAndWonCounts(newHistory);
      }}
    />
  );
}
