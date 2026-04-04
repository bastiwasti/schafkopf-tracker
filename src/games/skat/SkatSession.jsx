import { useState, useEffect } from "react";
import { GAME_PLUGINS } from "../index.js";
import Scoreboard from "../../components/Scoreboard.jsx";
import styles from "../../components/styles.js";
import GameForm from "./GameForm.jsx";
import GameCard from "./GameCard.jsx";
import { calcBalances, calculatePlayerPoints } from "./logic.js";

export default function SkatSession({ session, registeredPlayers = [], onBack, onSessionUpdated }) {
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [form, setForm] = useState(null);
  const [games, setGames] = useState([]);

  const plugin = GAME_PLUGINS[session.game_type];
  const { players, skat_bock_level: bock_level, stake } = session;

  useEffect(() => {
    loadGames();
  }, [session.id]);

  const loadGames = async () => {
    const res = await fetch(`/api/sessions/${session.id}/skat`);
    if (res.ok) {
      const loadedGames = await res.json();
      setGames(loadedGames);
    }
  };

  const activeHistory = games.filter((g) => !g.archived_at);

  const balances = calcBalances(activeHistory, players);

  const handleBockChange = async (newBock) => {
    const res = await fetch(`/api/sessions/${session.id}/skat/bock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bock: newBock }),
    });
    if (res.ok) {
      onSessionUpdated({ ...session, skat_bock_level: newBock });
    }
  };

  const handleAddGame = async () => {
    const res = await fetch(`/api/sessions/${session.id}/skat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const newGame = await res.json();
      setGames([...games, newGame]);
      setShowForm(false);
      setForm(null);
      onSessionUpdated({ ...session, game_count: (session.game_count || 0) + 1 });
    }
  };

  const handleEditGame = (game) => {
    setEditingGame(game);
    setForm({
      game_type: game.game_type,
      declarer: game.declarer,
      partner: game.partner,
      contra: game.contra,
      won: game.won,
      schneider: game.schneider,
      schwarz: game.schwarz,
      laufende: game.laufende,
      kontra_multiplier: game.kontra_multiplier,
      bock: game.bock,
    });
    setShowForm(true);
  };

  const handleUpdateGame = async () => {
    const res = await fetch(`/api/sessions/${session.id}/skat/${editingGame.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const updatedGames = games.map(g => g.id === editingGame.id ? { ...form, id: editingGame.id } : g);
      setGames(updatedGames);
      setShowForm(false);
      setEditingGame(null);
      setForm(null);
    }
  };

  const handleArchiveGame = async (gameId) => {
    const res = await fetch(`/api/sessions/${session.id}/skat/${gameId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived_at: new Date().toISOString() }),
    });

    if (res.ok) {
      const updatedGames = games.map(g => g.id === gameId ? { ...g, archived_at: new Date().toISOString() } : g);
      setGames(updatedGames);
    }
  };

  const handleUndo = async () => {
    const res = await fetch(`/api/sessions/${session.id}/skat/last`, {
      method: "DELETE",
    });

    if (res.ok) {
      const lastActive = [...activeHistory].pop();
      if (lastActive) {
        setGames(games.filter(g => g.id !== lastActive.id));
        onSessionUpdated({ ...session, game_count: Math.max(0, (session.game_count || 0) - 1) });
      }
    }
  };

  const toggleForm = () => {
    if (showForm) {
      setShowForm(false);
      setEditingGame(null);
      setForm(null);
    } else {
      setForm(plugin.makeDefaultForm(players));
      setShowForm(true);
    }
  };

  const handleFormSubmit = () => {
    if (editingGame) {
      handleUpdateGame();
    } else {
      handleAddGame();
    }
  };

  return (
    <div>
      <button style={styles.btnBack} onClick={onBack}>← Zurück</button>

      <div style={{ marginBottom: 16 }}>
        <h2 style={styles.sessionTitle}>{session.name}</h2>
        <p style={styles.sessionInfo}>{players.join(" · ")} · {stake.toFixed(2)} € pro Punkt</p>
      </div>

      {bock_level > 1 && (
        <div style={{
          background: "#9d0208",
          color: "#fdf6e3",
          padding: "12px 16px",
          borderRadius: 8,
          marginBottom: 16,
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 14,
        }}>
          BOCK ×{bock_level}
        </div>
      )}

      <Scoreboard
        players={players}
        balances={balances}
        history={activeHistory}
        registeredPlayers={registeredPlayers}
      />

      <div style={styles.actions}>
        <button style={styles.btnPrimary} onClick={toggleForm}>
          {showForm ? "✕ Abbrechen" : "＋ Neues Spiel"}
        </button>
        {activeHistory.length > 0 && !showForm && (
          <button style={styles.btnUndo} onClick={handleUndo}>↩ Rückgängig</button>
        )}
      </div>

      {showForm && form && (
        <GameForm
          form={form}
          onFormChange={setForm}
          players={players}
          stake={stake}
          bock={editingGame ? editingGame.bock : bock_level}
          onSubmit={handleFormSubmit}
          onCancel={toggleForm}
          submitLabel={editingGame ? "✓ Änderungen speichern" : undefined}
        />
      )}

      <div style={styles.historySection}>
        <h3 style={styles.historyTitle}>Historie</h3>
        {activeHistory.length === 0 && (
          <p style={styles.emptyMsg}>Noch keine Spiele eingetragen.</p>
        )}
        {[...activeHistory].reverse().map((game) => (
          <GameCard
            key={game.id}
            game={game}
            players={players}
            onEdit={handleEditGame}
            onArchive={handleArchiveGame}
          />
        ))}
      </div>
    </div>
  );
}
