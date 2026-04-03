import { useState, useEffect } from "react";
import styles from "../../styles.js";

export default function BaseSessionView({ session, registeredPlayers = [], onBack, onSessionUpdated, children }) {
  const [showForm, setShowForm] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showCommentatorSettings, setShowCommentatorSettings] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [pendingCommentary, setPendingCommentary] = useState(null);

  const { personality, voice, enabled, setPersonality, setVoice, setEnabled } = useCommentatorSettings();

  const { players, history, game_type } = session;
  const plugin = { id: game_type };
  const avatarMap = Object.fromEntries(registeredPlayers.map((p) => [p.name, p.avatar]));

  const activeHistory = history.filter((g) => !g.archived_at);
  const balances = {};

  players.forEach((p) => (balances[p] = 0));
  activeHistory.forEach((g) => {
    players.forEach((p) => {
      balances[p] += g.changes[p] || 0;
    });
  });

  const handleUndo = async () => {
    const res = await fetch(`/api/sessions/${session.id}/games/last`, { method: "DELETE" });
    if (res.ok) {
      const lastActive = [...activeHistory].pop();
      if (lastActive) {
        onSessionUpdated({
          ...session,
          history: history.filter((g) => g.id !== lastActive.id),
        });
      }
    }
  };

  return (
    <div style={styles.container}>
      {children({
        session,
        players,
        activeHistory,
        balances,
        showForm,
        setShowForm,
        showRules,
        setShowRules,
        showCommentatorSettings,
        setShowCommentatorSettings,
        editingGame,
        setEditingGame,
        pendingCommentary,
        setPendingCommentary,
        onUndo,
        avatarMap,
      })}
    </div>
  );
}
