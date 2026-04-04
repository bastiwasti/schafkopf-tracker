import { useState, useEffect } from "react";
import styles from "../../components/styles.js";
import WattenRoundForm from "./WattenRoundForm.jsx";
import WattenScoreboard from "./WattenScoreboard.jsx";
import WattenSessionHistory from "./WattenSessionHistory.jsx";

export default function WattenSession({ session, registeredPlayers = [], onBack, onSessionUpdated }) {
  const [showForm, setShowForm] = useState(false);
  const [rounds, setRounds] = useState([]);
  const [games, setGames] = useState([]);
  const [form, setForm] = useState({ winning_team: 'team1', points: 2, is_machine: false, is_spannt_played: false, tricks_team1: 0, tricks_team2: 0 });

  const { team1_players, team2_players, watten_target_score: targetScore } = session;

  useEffect(() => {
    loadRounds();
    loadGames();
  }, [session.id]);

  const loadRounds = async () => {
    const res = await fetch(`/api/sessions/${session.id}/watten/rounds`);
    if (res.ok) {
      const loadedRounds = await res.json();
      setRounds(loadedRounds);
    }
  };

  const loadGames = async () => {
    const res = await fetch(`/api/sessions/${session.id}/watten/games`);
    if (res.ok) {
      const loadedGames = await res.json();
      setGames(loadedGames);
    }
  };

  const activeRounds = rounds.filter(r => !r.archived_at);

  const { team1_score, team2_score } = activeRounds.reduce((acc, r) => {
    if (r.winning_team === 'team1') acc.team1_score += r.points;
    if (r.winning_team === 'team2') acc.team2_score += r.points;
    return acc;
  }, { team1_score: 0, team2_score: 0 });

  const isTeam1Gespannt = team1_score >= (targetScore || 15) - 2;
  const isTeam2Gespannt = team2_score >= (targetScore || 15) - 2;
  const isGespannt = isTeam1Gespannt || isTeam2Gespannt;

  const handleAddRound = async () => {
    const res = await fetch(`/api/sessions/${session.id}/watten/rounds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const newRound = await res.json();
      setRounds([...rounds, newRound]);
      setShowForm(false);
      setForm({ winning_team: 'team1', points: 2, is_machine: false, is_spannt_played: false, tricks_team1: 0, tricks_team2: 0 });
      onSessionUpdated({ ...session, game_count: (session.game_count || 0) + 1 });
      loadGames();
    }
  };

  const handleUndo = async () => {
    const res = await fetch(`/api/sessions/${session.id}/watten/rounds/last`, {
      method: "DELETE",
    });

    if (res.ok) {
      setRounds(rounds.slice(0, -1));
      loadGames();
      onSessionUpdated({ ...session, game_count: Math.max(0, (session.game_count || 0) - 1) });
    }
  };

  const toggleForm = () => {
    if (showForm) {
      setShowForm(false);
      setForm({ winning_team: 'team1', points: 2, is_machine: false, is_spannt_played: false, tricks_team1: 0, tricks_team2: 0 });
    } else {
      setShowForm(true);
    }
  };

  return (
    <div>
      <button style={styles.btnBack} onClick={onBack}>← Zurück</button>

      <div style={{ marginBottom: 16 }}>
        <h2 style={styles.sessionTitle}>{session.name}</h2>
        <p style={styles.sessionInfo}>
          Team 1: {(team1_players || []).join(" + ")} vs Team 2: {(team2_players || []).join(" + ")}
        </p>
      </div>

      {isGespannt && (
        <div style={{
          background: "#8b6914",
          color: "#fdf6e3",
          padding: "12px 16px",
          borderRadius: 8,
          marginBottom: 16,
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 14,
        }}>
          GESPANNT! {isTeam1Gespannt ? "Team 1" : "Team 2"} ist 2 Punkte vor Ziel
        </div>
      )}

      <WattenScoreboard
        team1_players={team1_players || []}
        team2_players={team2_players || []}
        team1_score={team1_score}
        team2_score={team2_score}
        targetScore={targetScore || 15}
        isGespannt={isGespannt}
      />

      <div style={styles.actions}>
        <button style={styles.btnPrimary} onClick={toggleForm}>
          {showForm ? "✕ Abbrechen" : "＋ Neue Runde"}
        </button>
        {activeRounds.length > 0 && !showForm && (
          <button style={styles.btnUndo} onClick={handleUndo}>↩ Rückgängig</button>
        )}
      </div>

      {showForm && (
        <WattenRoundForm
          form={form}
          onFormChange={setForm}
          team1_players={team1_players || []}
          team2_players={team2_players || []}
          isGespannt={isGespannt}
          onSubmit={handleAddRound}
          onCancel={toggleForm}
        />
      )}

      <WattenSessionHistory games={games} />
    </div>
  );
}
