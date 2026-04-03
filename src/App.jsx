import { useState, useEffect } from "react";
import SessionList from "./components/SessionList.jsx";
import SessionView from "./components/SessionView.jsx";
import PlayerManager from "./components/PlayerManager.jsx";
import ArchiveView from "./components/ArchiveView.jsx";

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [registeredPlayers, setRegisteredPlayers] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [view, setView] = useState("sessions"); // 'sessions' | 'players' | 'session' | 'archive'

  const fetchSessions = () =>
    fetch("/api/sessions").then((r) => r.json()).then(setSessions).catch(console.error);

  const fetchPlayers = () =>
    fetch("/api/players").then((r) => r.json()).then(setRegisteredPlayers).catch(console.error);

  useEffect(() => {
    fetchSessions();
    fetchPlayers();
  }, []);

  const handleSessionSelect = async (id) => {
    const res = await fetch(`/api/sessions/${id}`);
    if (res.ok) {
      setActiveSession(await res.json());
      setView("session");
    }
  };

  const handleSessionCreated = (session) => {
    setSessions((prev) => [{ ...session, game_count: 0 }, ...prev]);
    handleSessionSelect(session.id);
  };

  const handleSessionDeleted = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSession?.id === id) {
      setActiveSession(null);
      setView("sessions");
    }
  };

  const handleSessionUpdated = (updated) => {
    setActiveSession(updated);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === updated.id
          ? { ...s, bock: updated.bock, game_count: updated.history.filter((g) => !g.archived_at).length }
          : s
      )
    );
  };

  const handleSessionRestored = () => {
    fetchSessions();
  };

  if (view === "session" && activeSession) {
    return (
      <SessionView
        session={activeSession}
        registeredPlayers={registeredPlayers}
        onBack={() => setView("sessions")}
        onSessionUpdated={handleSessionUpdated}
      />
    );
  }

  if (view === "players") {
    return (
      <PlayerManager
        onBack={() => setView("sessions")}
        onPlayersChanged={fetchPlayers}
      />
    );
  }

  if (view === "archive") {
    return (
      <ArchiveView
        onBack={() => setView("sessions")}
        onSessionRestored={handleSessionRestored}
      />
    );
  }

  return (
    <SessionList
      sessions={sessions}
      registeredPlayers={registeredPlayers}
      onSessionSelect={handleSessionSelect}
      onSessionCreated={handleSessionCreated}
      onSessionDeleted={handleSessionDeleted}
      onManagePlayers={() => setView("players")}
      onManageArchive={() => setView("archive")}
      onPlayersChanged={fetchPlayers}
    />
  );
}
