import { useState, useEffect } from "react";
import styles from "./styles.js";
import AvatarPicker from "./AvatarPicker.jsx";
import { PERSONALITIES } from "../games/schafkopf/commentary.js";

const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

function VoicePicker({ value, onChange }) {
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    if (!hasSpeech) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  if (!hasSpeech || voices.length === 0) {
    return <p style={{ fontSize: 11, color: "#7a6840", fontStyle: "italic", margin: "4px 0" }}>Keine Stimmen verfügbar</p>;
  }

  return (
    <select
      style={styles.voiceSelect}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">— Standard (System) —</option>
      {voices.map((v) => (
        <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
      ))}
    </select>
  );
}

function PlayerForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [avatar, setAvatar] = useState(initial?.avatar ?? "🃏");
  const [characterType, setCharacterType] = useState(initial?.character_type ?? "dramatic");
  const [voiceName, setVoiceName] = useState(initial?.voice_name ?? null);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const isEdit = !!initial;
    const id = initial?.id ?? crypto.randomUUID();
    const method = isEdit ? "PATCH" : "POST";
    const url = isEdit ? `/api/players/${id}` : "/api/players";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: trimmed, avatar, character_type: characterType, voice_name: voiceName }),
    });

    if (res.status === 409) {
      setError("Name bereits vergeben");
      return;
    }
    if (res.ok) {
      const player = await res.json();
      onSave(player);
    }
  };

  return (
    <div style={{ ...styles.newSessionForm, marginBottom: 12 }}>
      {showPicker && (
        <AvatarPicker
          value={avatar}
          onChange={setAvatar}
          onClose={() => setShowPicker(false)}
        />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <button
          style={{ fontSize: 40, background: "none", border: "2px solid #d4c49a", borderRadius: 12, padding: "6px 10px", cursor: "pointer" }}
          onClick={() => setShowPicker(true)}
          title="Avatar wählen"
        >
          {avatar}
        </button>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Name</label>
          <input
            style={styles.input}
            placeholder="Spielername…"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
          {error && <p style={{ fontSize: 12, color: "#9d0208", margin: "4px 0 0", fontStyle: "italic" }}>{error}</p>}
        </div>
      </div>

      <label style={styles.label}>Charakter & Kommentar-Stil</label>
      <div style={styles.personalityChipRow}>
        {Object.entries(PERSONALITIES).map(([key, p]) => (
          <button
            key={key}
            style={{ ...styles.personalityChip, ...(characterType === key ? styles.personalityChipActive : {}) }}
            onClick={() => setCharacterType(key)}
          >
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      <label style={styles.label}>Stimme</label>
      <VoicePicker value={voiceName} onChange={setVoiceName} />

      <div style={{ display: "flex", gap: 8 }}>
        <button
          style={{ ...styles.btnConfirm, flex: 1, marginTop: 0, opacity: name.trim() ? 1 : 0.5 }}
          onClick={handleSubmit}
          disabled={!name.trim()}
        >
          {initial ? "Speichern" : "Spieler anlegen"}
        </button>
        <button style={{ ...styles.btnSecondary, padding: "12px 16px" }} onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}

export default function PlayerManager({ onBack, onPlayersChanged }) {
  const [players, setPlayers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  const fetchPlayers = () =>
    fetch("/api/players").then((r) => r.json()).then(setPlayers);

  useEffect(() => { fetchPlayers(); }, []);

  const handleSave = () => {
    fetchPlayers().then(onPlayersChanged);
    setShowForm(false);
    setEditingPlayer(null);
  };

  const handleDelete = async (player) => {
    if (!confirm(`„${player.name}" wirklich löschen? Der Name bleibt in bestehenden Runden gespeichert.`)) return;
    const res = await fetch(`/api/players/${player.id}`, { method: "DELETE" });
    if (res.ok) fetchPlayers().then(onPlayersChanged);
  };

  const handleEdit = (player) => {
    setShowForm(false);
    setEditingPlayer(player);
  };

  return (
    <div style={styles.container}>
      <div style={styles.sessionHeader}>
        <button style={styles.backBtn} onClick={onBack}>← Runden</button>
        <div style={{ flex: 1 }}>
          <div style={styles.sessionTitle}>Spieler</div>
          <div style={styles.sessionSubtitle}>Spieler verwalten · Avatar · Charakter · Stimme</div>
        </div>
      </div>

      {!showForm && !editingPlayer && (
        <button
          style={{ ...styles.btnPrimary, width: "100%", marginBottom: 16 }}
          onClick={() => setShowForm(true)}
        >
          ＋ Neuer Spieler
        </button>
      )}

      {showForm && (
        <PlayerForm
          initial={null}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingPlayer && (
        <PlayerForm
          initial={editingPlayer}
          onSave={handleSave}
          onCancel={() => setEditingPlayer(null)}
        />
      )}

      {players.length === 0 && !showForm && (
        <p style={styles.emptyMsg}>Noch keine Spieler angelegt. Leg gleich los!</p>
      )}

      <div style={styles.playerManagerList}>
        {players.map((p) => (
          <div key={p.id} style={styles.playerManagerRow}>
            <div style={styles.playerManagerAvatar}>{p.avatar}</div>
            <div style={styles.playerManagerInfo}>
              <span style={styles.playerManagerName}>{p.name}</span>
              <span style={styles.playerManagerMeta}>
                {PERSONALITIES[p.character_type]?.icon ?? "🎙️"} {PERSONALITIES[p.character_type]?.label ?? "Dramatischer Stadion-Reporter"}
                {" · "}
                {p.voice_name ? p.voice_name : "Standard-Stimme"}
              </span>
            </div>
            <div style={styles.playerManagerActions}>
              <button style={styles.playerManagerBtn} onClick={() => handleEdit(p)}>✏️</button>
              <button style={styles.playerManagerBtnDelete} onClick={() => handleDelete(p)}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
