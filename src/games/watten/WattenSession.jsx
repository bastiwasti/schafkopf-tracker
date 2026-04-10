import { useState, useEffect } from "react";
import styles from "../../components/styles.js";
import WattenRoundForm from "./WattenRoundForm.jsx";
import WattenScoreboard from "./WattenScoreboard.jsx";
import WattenSessionHistory from "./WattenSessionHistory.jsx";
import CommentaryOverlay from "../../components/CommentaryOverlay.jsx";
import CommentarySettingsPanel from "../../components/CommentarySettingsPanel.jsx";
import useCommentatorSettings from "../../hooks/useCommentatorSettings.js";
import { buildWattenCommentary } from "./commentary.js";

export default function WattenSession({ session, registeredPlayers = [], _onBack, onSessionUpdated }) {
  const [showForm, setShowForm] = useState(false);
  const [rounds, setRounds] = useState([]);
  const [games, setGames] = useState([]);
  const [form, setForm] = useState({ winning_team: 'team1', points: 2, is_machine: false, is_spannt_played: false, is_gegangen: false, tricks_team1: 0, tricks_team2: 0 });
  const [expandedGameId, setExpandedGameId] = useState(null);
  const [pendingCommentary, setPendingCommentary] = useState(null);
  const [showCommentatorSettings, setShowCommentatorSettings] = useState(false);
  const { personality, voice, enabled, setPersonality, setVoice, setEnabled } = useCommentatorSettings();

  const parseArray = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    }
    return [];
  };

  const team1_players = parseArray(session.watten_team1_players);
  const team2_players = parseArray(session.watten_team2_players);
  const targetScore = session.watten_target_score;

  const avatarMap = Object.fromEntries(registeredPlayers.map((p) => [p.name, p.avatar]));

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

  useEffect(() => {
    loadRounds();
    loadGames();
  }, [session.id]);

  // Aktives Game und Runden berechnen
  const activeGame = games.active;
  const activeRounds = activeGame ? (rounds.byGame && rounds.byGame[activeGame.id] ? rounds.byGame[activeGame.id] : []) : [];

  // Fallback für alte Runden ohne game_id (bis zur Migration)
  const legacyRounds = rounds.all ? rounds.all.filter(r => !r.game_id) : [];
  const displayRounds = activeRounds.length > 0 ? activeRounds : legacyRounds;

  const { team1_score, team2_score } = displayRounds.reduce((acc, r) => {
    if (r.winning_team === 'team1') acc.team1_score += r.points;
    if (r.winning_team === 'team2') acc.team2_score += r.points;
    return acc;
  }, { team1_score: 0, team2_score: 0 });

  // Bommerl berechnen
  const team1Bommel = games.completed ? games.completed.filter(g => g.bommerl_team === 'team1').length : 0;
  const team2Bommel = games.completed ? games.completed.filter(g => g.bommerl_team === 'team2').length : 0;

  const isTeam1Gespannt = team1_score >= (targetScore || 15) - 2;
  const isTeam2Gespannt = team2_score >= (targetScore || 15) - 2;
  const isGespannt = isTeam1Gespannt || isTeam2Gespannt;

  const isGameComplete = team1_score >= (targetScore || 15) || team2_score >= (targetScore || 15);

  const handleAddRound = async () => {
    // Scores und Spielende VOR dem API-Call berechnen (für Commentary)
    const newT1 = team1_score + (form.winning_team === 'team1' ? form.points : 0);
    const newT2 = team2_score + (form.winning_team === 'team2' ? form.points : 0);
    const tgt = targetScore || 15;
    const gameJustCompleted = newT1 >= tgt || newT2 >= tgt;
    const newT1Bommel = gameJustCompleted && form.winning_team === 'team2' ? team1Bommel + 1 : team1Bommel;
    const newT2Bommel = gameJustCompleted && form.winning_team === 'team1' ? team2Bommel + 1 : team2Bommel;

    const res = await fetch(`/api/sessions/${session.id}/watten/rounds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    console.log('Watten Round form before send:', form);

    if (res.ok) {
      await res.json();
      setShowForm(false);
      setForm({ winning_team: 'team1', points: isGespannt ? 3 : 2, is_machine: false, is_spannt_played: false, is_gegangen: false, tricks_team1: 0, tricks_team2: 0 });
      onSessionUpdated({ ...session, game_count: (session.game_count || 0) + 1 });

      // Commentary auslösen (alle Runden des aktuellen Spiels inkl. aktuelle)
      if (enabled) {
        setPendingCommentary({
          round: form,
          team1_score: newT1,
          team2_score: newT2,
          team1_score_before: team1_score,
          team2_score_before: team2_score,
          targetScore: tgt,
          team1_players,
          team2_players,
          team1Bommel: newT1Bommel,
          team2Bommel: newT2Bommel,
          gameJustCompleted,
          activeGameRounds: [...activeRounds, { ...form }],
        });
      }

      await loadGames();
      await loadRounds();
    }
  };

  const handleUndo = async () => {
    const res = await fetch(`/api/sessions/${session.id}/watten/rounds/last`, {
      method: "DELETE",
    });

    if (res.ok) {
      await loadGames();
      await loadRounds();
      onSessionUpdated({ ...session, game_count: Math.max(0, (session.game_count || 0) - 1) });
    }
  };

  const handleNewGame = async () => {
    const res = await fetch(`/api/sessions/${session.id}/watten/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      await loadGames();
      await loadRounds();
    }
  };

  const toggleForm = () => {
    if (showForm) {
      setShowForm(false);
      setForm({ winning_team: 'team1', points: isGespannt ? 3 : 2, is_machine: false, is_spannt_played: false, is_gegangen: false, tricks_team1: 0, tricks_team2: 0 });
    } else {
      setShowForm(true);
    }
  };

  const toggleGameExpand = (gameId) => {
    setExpandedGameId(expandedGameId === gameId ? null : gameId);
  };

  return (
    <div>
      {/* Commentary Overlay */}
      {pendingCommentary && (
        <CommentaryOverlay
          game={pendingCommentary}
          buildFn={buildWattenCommentary}
          registeredPlayers={registeredPlayers}
          commentatorPersonality={personality}
          commentatorVoice={voice}
          onClose={() => setPendingCommentary(null)}
        />
      )}

      {/* Kommentator-Einstellungen */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button
          style={{
            background: "none",
            border: "1px solid #d4c49a",
            borderRadius: 6,
            padding: "4px 10px",
            cursor: "pointer",
            fontSize: 16,
            color: personality ? "#8b6914" : "#aaa",
          }}
          onClick={() => setShowCommentatorSettings(s => !s)}
          title="Kommentator-Einstellungen"
        >
          🎙️
        </button>
      </div>
      {showCommentatorSettings && (
        <CommentarySettingsPanel
          personality={personality}
          voice={voice}
          enabled={enabled}
          onPersonality={setPersonality}
          onVoice={setVoice}
          onEnabled={setEnabled}
        />
      )}

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
          GESPANNT! {isTeam1Gespannt && isTeam2Gespannt ? "Beide Teams" : isTeam1Gespannt ? "Team 1" : "Team 2"} ist 2 Punkte vor Ziel
        </div>
      )}

      {/* Aktives Game Scoreboard + Historie */}
      {activeGame && (
        <div style={{
          display: "flex",
          gap: 16,
          marginBottom: 16,
          flexWrap: "wrap",
        }}>
          <div style={{
            flex: 1,
            minWidth: 300,
            background: "#fdf6e3",
            border: "2px solid #2c1810",
            borderRadius: 12,
            padding: 16,
          }}>
            <div style={{
              fontSize: 14,
              color: "#8b6914",
              marginBottom: 12,
              textAlign: "center",
              fontWeight: "bold",
            }}>
              Aktives Spiel #{activeGame.game_number}
            </div>

            <WattenScoreboard
              team1_players={team1_players || []}
              team2_players={team2_players || []}
              avatarMap={avatarMap}
              team1_score={team1_score}
              team2_score={team2_score}
              targetScore={targetScore || 15}
              isGespannt={isGespannt}
              team1Bommel={team1Bommel}
              team2Bommel={team2Bommel}
            />
          </div>

          <div style={{
            flex: 1,
            minWidth: 250,
            background: "#fdf6e3",
            border: "1px solid #d4c49a",
            borderRadius: 12,
            padding: 12,
          }}>
            <div style={{
              fontSize: 12,
              color: "#8b6914",
              marginBottom: 8,
              fontWeight: "bold",
            }}>
              Spiel-Historie
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {displayRounds.map((round, idx) => (
                <div key={round.id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 8px",
                  background: "#e8dcc5",
                  borderRadius: 4,
                  fontSize: 11,
                }}>
                  <div>
                    <span style={{ fontWeight: "bold" }}>#{idx + 1}</span>
                    <span style={{ marginLeft: 6 }}>
                      {round.winning_team === 'team1' ? team1_players.map(p => `${avatarMap[p] || "🃏"} ${p}`).join(" + ") : team2_players.map(p => `${avatarMap[p] || "🃏"} ${p}`).join(" + ")}
                    </span>
                    {round.is_machine && <span style={{ marginLeft: 4, color: "#8b6914" }}>🤖</span>}
                    {round.is_spannt_played && <span style={{ marginLeft: 4, color: "#8b6914" }}>🎯</span>}
                    {round.is_gegangen && <span style={{ marginLeft: 4, color: "#8b6914" }}>🏃</span>}
                  </div>
                  <div style={{ fontWeight: "bold", color: "#2c1810" }}>
                    +{round.points}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={styles.actions}>
        {!isGameComplete && (
          <button style={styles.btnPrimary} onClick={toggleForm}>
            {showForm ? "✕ Abbrechen" : "＋ Neues Spiel"}
          </button>
        )}
        {isGameComplete && (
          <button style={styles.btnPrimary} onClick={handleNewGame}>
            ＋ Neues Spiel
          </button>
        )}
        {activeRounds.length > 0 && !showForm && !isGameComplete && (
          <button style={styles.btnUndo} onClick={handleUndo}>↩ Rückgängig</button>
        )}
      </div>

      {showForm && (
        <WattenRoundForm
          form={form}
          onFormChange={setForm}
          team1_players={team1_players || []}
          team2_players={team2_players || []}
          avatarMap={avatarMap}
          isGespannt={isGespannt}
          team1_score={team1_score}
          team2_score={team2_score}
          targetScore={targetScore}
          onSubmit={handleAddRound}
          onCancel={toggleForm}
        />
      )}

      {/* History mit Bommerl-Counter und Accordions */}
      <WattenSessionHistory
        games={games.completed || []}
        roundsByGame={rounds.byGame || {}}
        team1_players={team1_players || []}
        team2_players={team2_players || []}
        avatarMap={avatarMap}
        team1Bommel={team1Bommel}
        team2Bommel={team2Bommel}
        expandedGameId={expandedGameId}
        onToggleGameExpand={toggleGameExpand}
      />
    </div>
  );
}
