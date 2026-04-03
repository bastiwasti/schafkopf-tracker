import { useState } from "react";
import { GAME_PLUGINS } from "../games/index.js";
import styles from "./styles.js";
import AvatarPicker from "./AvatarPicker.jsx";

function QuickAddPlayer({ onAdded }) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🃏");
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = crypto.randomUUID();
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: trimmed, avatar }),
    });
    if (res.status === 409) { setError("Name bereits vergeben"); return; }
    if (res.ok) {
      const player = await res.json();
      onAdded(player);
      setName("");
      setAvatar("🃏");
      setError("");
    }
  };

  return (
    <div style={{ background: "#fdf6e3", border: "1.5px dashed #8b6914", borderRadius: 12, padding: 14, marginTop: 8 }}>
      {showPicker && (
        <AvatarPicker value={avatar} onChange={setAvatar} onClose={() => setShowPicker(false)} />
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          style={{ fontSize: 28, background: "none", border: "1.5px solid #d4c49a", borderRadius: 8, padding: "4px 8px", cursor: "pointer" }}
          onClick={() => setShowPicker(true)}
        >
          {avatar}
        </button>
        <input
          style={{ ...styles.input, flex: 1 }}
          placeholder="Neuer Spieler…"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          autoFocus
        />
        <button style={{ ...styles.chip, ...styles.chipActive, flexShrink: 0 }} onClick={handleAdd}>＋</button>
      </div>
      {error && <p style={{ fontSize: 12, color: "#9d0208", margin: "6px 0 0", fontStyle: "italic" }}>{error}</p>}
    </div>
  );
}

function NewSessionForm({ registeredPlayers, onCreated, onPlayersChanged }) {
  const [name, setName] = useState("");
  const [gameType, setGameType] = useState("schafkopf");
  const [selectedNames, setSelectedNames] = useState([]);
  const [stake, setStake] = useState(GAME_PLUGINS[gameType]?.defaultStake ?? 0.50);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [localPlayers, setLocalPlayers] = useState(registeredPlayers);

  // Sync if parent registry changes (e.g. quick-add)
  const allPlayers = localPlayers.length >= registeredPlayers.length ? localPlayers : registeredPlayers;

  const togglePlayer = (name) => {
    setSelectedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleQuickAdd = (player) => {
    setLocalPlayers((prev) => {
      const exists = prev.some((p) => p.id === player.id);
      return exists ? prev : [...prev, player];
    });
    setSelectedNames((prev) => prev.includes(player.name) ? prev : [...prev, player.name]);
    setShowQuickAdd(false);
    onPlayersChanged();
  };

  const handleSubmit = async () => {
    if (!name.trim() || selectedNames.length < 2) return;
    const id = crypto.randomUUID();
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: name.trim(), game_type: gameType, players: selectedNames, stake }),
    });
    if (res.ok) {
      const session = await res.json();
      onCreated(session);
    }
  };

  const pluginEntries = Object.values(GAME_PLUGINS);
  const canSubmit = name.trim().length > 0 && selectedNames.length >= 2;

  return (
    <div style={styles.newSessionForm}>
      <h3 style={{ ...styles.formTitle, marginBottom: 16 }}>Neue Runde</h3>

      <label style={styles.label}>Name</label>
      <input
        style={styles.input}
        placeholder="z.B. Freitagsrunde"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label style={styles.label}>Spiel</label>
      <div style={styles.chipRow}>
        {pluginEntries.map((p) => (
          <button
            key={p.id}
            style={{ ...styles.chip, ...(gameType === p.id ? styles.chipActive : {}) }}
            onClick={() => { setGameType(p.id); setStake(p.defaultStake); }}
          >{p.label}</button>
        ))}
      </div>

      <label style={styles.label}>Spieler</label>
      {allPlayers.length === 0 ? (
        <p style={{ fontSize: 12, color: "#9d6b00", fontStyle: "italic", margin: "4px 0 8px" }}>
          Noch keine Spieler im Register. Lege unten einen an oder gehe zu „Spieler verwalten".
        </p>
      ) : (
        <div style={styles.playerChipRow}>
          {allPlayers.map((p) => {
            const isSelected = selectedNames.includes(p.name);
            return (
              <button
                key={p.id}
                style={{ ...styles.playerChip, ...(isSelected ? styles.playerChipActive : {}) }}
                onClick={() => togglePlayer(p.name)}
              >
                <span>{p.avatar}</span>
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {showQuickAdd ? (
        <QuickAddPlayer onAdded={handleQuickAdd} />
      ) : (
        <button style={styles.playerChipNew} onClick={() => setShowQuickAdd(true)}>
          ＋ Neuer Spieler
        </button>
      )}

      {selectedNames.length > 0 && selectedNames.length < 2 && (
        <p style={{ fontSize: 11, color: "#9d6b00", margin: "8px 0 0", fontStyle: "italic" }}>
          Mindestens 2 Spieler erforderlich.
        </p>
      )}

      {GAME_PLUGINS[gameType]?.defaultStake !== 0 && (
        <>
          <label style={{ ...styles.label, marginTop: 14 }}>Einsatz (€)</label>
          <input
            style={{ ...styles.input, width: 100 }}
            type="number"
            min="0.01"
            step="0.01"
            value={stake}
            onChange={(e) => setStake(parseFloat(e.target.value) || 0.50)}
          />
        </>
      )}

      {(() => {
        const HintComponent = GAME_PLUGINS[gameType]?.SessionCreationHint;
        return HintComponent ? <HintComponent playerCount={selectedNames.length} /> : null;
      })()}

      <button
        style={{ ...styles.btnConfirm, opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? "pointer" : "not-allowed" }}
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        Runde starten
      </button>
    </div>
  );
}

export default function SessionList({ sessions, registeredPlayers, onSessionSelect, onSessionCreated, onSessionDeleted, onManagePlayers, onManageArchive, onPlayersChanged }) {
  const [showNew, setShowNew] = useState(false);

  const handleCreated = (session) => {
    setShowNew(false);
    onSessionCreated(session);
  };

  const handleArchive = async (e, id) => {
    e.stopPropagation();
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    
    const plugin = GAME_PLUGINS[session.game_type];
    const confirmMsg = plugin?.getArchiveConfirm?.(session);
    
    if (confirmMsg === null) {
      alert("Kann nicht archiviert werden.");
      return;
    }
    
    if (!confirm(confirmMsg)) return;
    
    const res = await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived_at: new Date().toISOString() }),
    });
    if (res.ok) onSessionDeleted(id);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Spielrunden</h1>
        <p style={styles.subtitle}>Wähle eine Runde oder erstelle eine neue</p>
      </div>

      <button
        style={{ ...styles.btnPrimary, width: "100%", marginBottom: 8 }}
        onClick={() => setShowNew(!showNew)}
      >
        {showNew ? "✕ Abbrechen" : "＋ Neue Runde"}
      </button>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button style={{ ...styles.btnSecondary, flex: 1 }} onClick={onManagePlayers}>
          👥 Spieler
        </button>
        <button style={{ ...styles.btnSecondary, flex: 1 }} onClick={onManageArchive}>
          📦 Archiv
        </button>
      </div>

      {showNew && (
        <NewSessionForm
          registeredPlayers={registeredPlayers}
          onCreated={handleCreated}
          onPlayersChanged={onPlayersChanged}
        />
      )}

      {sessions.length === 0 && !showNew && (
        <p style={styles.emptyMsg}>Noch keine Runden. Erstelle eine neue!</p>
      )}

      <div style={styles.sessionList}>
        {sessions.map((s) => {
          const plugin = GAME_PLUGINS[s.game_type];
          const metaText = plugin?.getSessionMeta?.(s) ?? `${s.game_count} Spiele`;
          const isCompletedWizard = s.game_type === "wizard" && s.wizard_status === "completed";
          
          return (
            <div key={s.id} style={{ ...styles.sessionCard, ...(isCompletedWizard ? { opacity: 0.7 } : {}) }} onClick={() => onSessionSelect(s.id)}>
              <div style={styles.sessionCardLeft}>
                <span style={styles.sessionName}>{s.name}</span>
                {isCompletedWizard && <span style={{ marginLeft: 8, fontSize: 11, color: "#9d0208" }}>✓</span>}
                <span style={styles.sessionMeta}>
                  {plugin?.label ?? s.game_type}
                  {" · "}
                  {s.players.join(", ")}
                  {" · "}
                  {metaText}
                </span>
              </div>
              <button style={styles.sessionDelete} onClick={(e) => handleArchive(e, s.id)}>📦</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
