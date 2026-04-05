import { useState, useEffect } from "react";
import styles from "./styles.js";
import AvatarPicker from "./AvatarPicker.jsx";
import { PLAYER_PERSONALITIES, PLAYER_REACTIONS } from "../games/shared/playerPersonalities.js";
import { pickRandom } from "../games/shared/commentary.js";

function buildAllTexts(characterType) {
  const pool = PLAYER_REACTIONS[characterType] ?? PLAYER_REACTIONS.optimist;
  return [...new Set(
    Object.values(pool)
      .filter(Array.isArray)
      .flat()
      .map((t) => (typeof t === "function" ? t() : t))
  )];
}

function PlayerTestOverlay({ name, avatar, characterType, voiceName, onClose }) {
  const allTexts = buildAllTexts(characterType);
  const [text, setText] = useState(() => pickRandom(allTexts));
  const pers = PLAYER_PERSONALITIES[characterType];

  const speak = (t) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(t);
    utter.lang = "de-DE";
    if (voiceName) {
      const voices = window.speechSynthesis.getVoices();
      utter.voice = voices.find((v) => v.name === voiceName) ?? null;
    }
    window.speechSynthesis.speak(utter);
  };

  useEffect(() => { speak(text); return () => window.speechSynthesis?.cancel(); }, [text]);

  const handleNext = () => {
    const next = pickRandom(allTexts.filter((t) => t !== text) || allTexts);
    setText(next);
  };

  return (
    <div style={styles.commentaryOverlay} onClick={onClose}>
      <div style={styles.commentaryCard} onClick={(e) => e.stopPropagation()}>
        <div style={styles.commentarySpeaker}>
          <div style={{ fontSize: 32, lineHeight: 1 }}>{avatar}</div>
          <div style={styles.commentarySpeakerInfo}>
            <div style={styles.commentarySpeakerName}>{name || "Spieler"}</div>
            <div style={styles.commentarySpeakerLabel}>{pers?.label ?? characterType}</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 18 }}>🔊</div>
        </div>
        <div style={{ ...styles.commentaryBubble, fontSize: 15, marginTop: 4 }}>
          {text}
        </div>
        <div style={styles.commentaryActions}>
          <button style={styles.btnSecondary} onClick={handleNext}>🔄 Nochmal</button>
          <button style={styles.btnCloseOverlay} onClick={onClose}>✕ Schließen</button>
        </div>
      </div>
    </div>
  );
}

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
  const [characterType, setCharacterType] = useState(initial?.character_type ?? "optimist");
  const [voiceName, setVoiceName] = useState(initial?.voice_name ?? null);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState("");
  const [testOverlay, setTestOverlay] = useState(false);

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
        {Object.entries(PLAYER_PERSONALITIES).map(([key, p]) => (
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

      <button
        style={{ ...styles.btnSecondary, width: "100%", marginBottom: 8 }}
        onClick={() => setTestOverlay(true)}
      >
        🎙️ Charakter & Stimme testen
      </button>

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

      {testOverlay && (
        <PlayerTestOverlay
          name={name}
          avatar={avatar}
          characterType={characterType}
          voiceName={voiceName}
          onClose={() => setTestOverlay(false)}
        />
      )}
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
    fetchPlayers().then(() => {
      setShowForm(false);
      setEditingPlayer(null);
      onPlayersChanged();
    });
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
                {PLAYER_PERSONALITIES[p.character_type]?.icon ?? "🌟"} {PLAYER_PERSONALITIES[p.character_type]?.label ?? "Der Optimist"}
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
