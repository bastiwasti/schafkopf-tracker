import { useState, useEffect } from "react";
import { GAME_PLUGINS } from "../games/index.js";
import styles from "./styles.js";

function ArchivedSessionCard({ session: s, onRestore, onDelete }) {
  return (
    <div style={styles.archiveCard}>
      <div style={styles.archiveCardTitle}>{s.name}</div>
      <div style={styles.archiveCardMeta}>
        {GAME_PLUGINS[s.game_type]?.label ?? s.game_type}
        {" · "}
        {s.players.join(", ")}
        {" · "}
        {s.game_count} {s.game_count === 1 ? "Spiel" : "Spiele"}
        {" · "}
        Archiviert {new Date(s.archived_at).toLocaleDateString("de-DE")}
      </div>
      <div style={styles.archiveCardActions}>
        <button style={styles.btnRestore} onClick={() => onRestore(s.id)}>↩ Wiederherstellen</button>
        <button style={styles.btnDanger} onClick={() => onDelete(s.id)}>🗑 Endgültig löschen</button>
      </div>
    </div>
  );
}

function ArchivedGameCard({ game: g, onRestore, onDelete }) {
  return (
    <div style={{ ...styles.archiveCard, padding: "10px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
        <span style={styles.historyRound}>#{g.seq}</span>
        <span style={{ fontSize: 14, fontWeight: 800 }}>{g.type}</span>
        <span style={styles.spielwertBadge}>{(g.spielwert || 0).toFixed(2)} €</span>
        <span style={{
          ...styles.historyResult,
          background: g.won ? "#2d6a4f" : "#9d0208",
        }}>
          {g.won ? "Gewonnen" : "Verloren"}
        </span>
        <span style={{ fontSize: 11, color: "#7a6840", fontStyle: "italic", marginLeft: "auto" }}>
          {new Date(g.archived_at).toLocaleDateString("de-DE")}
        </span>
      </div>
      <div style={{ fontSize: 13, marginBottom: 8 }}>
        <strong>{g.player}</strong>
        {g.partner && <span> mit {g.partner}</span>}
        {g.schneider && <span style={styles.badge}>Schneider</span>}
        {g.schwarz && <span style={styles.badge}>Schwarz</span>}
        {g.laufende > 0 && <span style={styles.badge}>{g.laufende} Laufende</span>}
      </div>
      <div style={styles.archiveCardActions}>
        <button style={styles.btnRestore} onClick={() => onRestore(g.id, g.session_id)}>↩ Wiederherstellen</button>
        <button style={styles.btnDanger} onClick={() => onDelete(g.id, g.session_id)}>🗑 Endgültig löschen</button>
      </div>
    </div>
  );
}

export default function ArchiveView({ onBack, onSessionRestored }) {
  const [archivedSessions, setArchivedSessions] = useState([]);
  const [archivedGames, setArchivedGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/sessions/archived").then((r) => r.json()),
      fetch("/api/sessions/archived/games").then((r) => r.json()),
    ]).then(([sessions, games]) => {
      setArchivedSessions(sessions);
      setArchivedGames(games);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRestoreSession = async (id) => {
    const res = await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived_at: null }),
    });
    if (res.ok) {
      setArchivedSessions((prev) => prev.filter((s) => s.id !== id));
      onSessionRestored();
    }
  };

  const handleDeleteSession = async (id) => {
    if (!confirm("Runde endgültig löschen? Das kann nicht rückgängig gemacht werden.")) return;
    const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (res.ok) setArchivedSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleRestoreGame = async (gameId, sessionId) => {
    const res = await fetch(`/api/sessions/${sessionId}/games/${gameId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived_at: null }),
    });
    if (res.ok) setArchivedGames((prev) => prev.filter((g) => g.id !== gameId));
  };

  const handleDeleteGame = async (gameId, sessionId) => {
    if (!confirm("Spiel endgültig löschen?")) return;
    const res = await fetch(`/api/sessions/${sessionId}/games/${gameId}`, { method: "DELETE" });
    if (res.ok) setArchivedGames((prev) => prev.filter((g) => g.id !== gameId));
  };

  // Group archived games by session
  const gamesBySession = archivedGames.reduce((acc, g) => {
    if (!acc[g.session_id]) acc[g.session_id] = { name: g.session_name, games: [] };
    acc[g.session_id].games.push(g);
    return acc;
  }, {});

  return (
    <div style={styles.container}>
      <div style={styles.sessionHeader}>
        <button style={styles.backBtn} onClick={onBack}>← Runden</button>
        <div style={{ flex: 1 }}>
          <div style={styles.sessionTitle}>Archiv</div>
          <div style={styles.sessionSubtitle}>Archivierte Runden und Spiele</div>
        </div>
      </div>

      {loading && <p style={styles.emptyMsg}>Laden…</p>}

      {!loading && (
        <>
          <div style={styles.archiveSection}>Archivierte Runden</div>
          {archivedSessions.length === 0 ? (
            <p style={styles.emptyMsg}>Keine archivierten Runden.</p>
          ) : (
            archivedSessions.map((s) => (
              <ArchivedSessionCard
                key={s.id}
                session={s}
                onRestore={handleRestoreSession}
                onDelete={handleDeleteSession}
              />
            ))
          )}

          <div style={styles.archiveSection}>Archivierte Spiele</div>
          {Object.keys(gamesBySession).length === 0 ? (
            <p style={styles.emptyMsg}>Keine archivierten Spiele.</p>
          ) : (
            Object.entries(gamesBySession).map(([sessionId, { name, games }]) => (
              <div key={sessionId}>
                <div style={styles.archiveGroupHeader}>{name}</div>
                {games.map((g) => (
                  <ArchivedGameCard
                    key={g.id}
                    game={g}
                    onRestore={handleRestoreGame}
                    onDelete={handleDeleteGame}
                  />
                ))}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
