import { useState, useEffect } from "react";
import { GAME_PLUGINS } from "../games/index.js";
import styles from "./styles.js";
import AvatarPicker from "./AvatarPicker.jsx";

const SKAT_VARIANTS = [
  { id: "skat", label: "Skat", playerCount: 3 },
  { id: "skat_4er", label: "Skat 4er", playerCount: 4 },
  { id: "ramsch_3er", label: "Ramsch 3er", playerCount: 3 },
  { id: "ramsch_5er", label: "Ramsch 5er", playerCount: 5 },
];

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
  const [schafkopfOptions, setSchafkopfOptions] = useState({ geier: false, farbwenz: false });
  const [doppelkopfSoloValue, setDoppelkopfSoloValue] = useState(3);
  const [selectedNames, setSelectedNames] = useState([]);
  const [stake, setStake] = useState(GAME_PLUGINS[gameType]?.defaultStake ?? 0.50);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [localPlayers, setLocalPlayers] = useState(registeredPlayers);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [targetScore, setTargetScore] = useState(13);
  const [kinderkartenOptions, setKinderkartenOptions] = useState({
    with_trump: true,
    ober_trump: false,
    unter_trump: false,
    card_count: 5
  });
  const [hasUserModifiedName, setHasUserModifiedName] = useState(false);

  const formatDateForSession = () => {
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());
  };

  const generateDefaultName = () => {
    const date = formatDateForSession();
    const game = GAME_PLUGINS[gameType]?.label || "Spiel";
    return `${date} - ${game}`;
  };

  useEffect(() => {
    if (!hasUserModifiedName) {
      setName(generateDefaultName());
    }
  }, [gameType, hasUserModifiedName]);

  useEffect(() => {
    if (!hasUserModifiedName) {
      setName(generateDefaultName());
    }
  }, []);

  const handleNameChange = (e) => {
    setName(e.target.value);
    setHasUserModifiedName(true);
  };

  // Sync if parent registry changes (e.g. quick-add)
  const allPlayers = localPlayers.length >= registeredPlayers.length ? localPlayers : registeredPlayers;

  const togglePlayer = (name) => {
    if (gameType === 'watten') {
      if (team1Players.includes(name)) {
        setTeam1Players(prev => prev.filter(n => n !== name));
      } else if (team2Players.includes(name)) {
        setTeam2Players(prev => prev.filter(n => n !== name));
      } else if (team1Players.length < 2) {
        setTeam1Players(prev => [...prev, name]);
      } else if (team2Players.length < 2) {
        setTeam2Players(prev => [...prev, name]);
      }
    } else {
      setSelectedNames((prev) =>
        prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
      );
    }
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

  const generateId = () => {
    try {
      return crypto.randomUUID();
    } catch {
      return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
  };

  const handleSubmit = async () => {
    if (gameType === 'watten') {
      if (!name.trim() || team1Players.length !== 2 || team2Players.length !== 2) {
        return;
      }
    } else {
      const minPlayers = currentPlugin?.playerCount?.min || 2;
      const maxPlayers = currentPlugin?.playerCount?.max || 10;
      if (!name.trim() || selectedNames.length < minPlayers || selectedNames.length > maxPlayers) {
        return;
      }
    }

    const id = generateId();

    const body = {
      id,
      name: name.trim(),
      game_type: gameType,
      players: gameType === 'watten' ? [...team1Players, ...team2Players] : selectedNames,
      stake,
    };

    if (gameType === "watten") {
      body.target_score = targetScore;
      body.team1_players = team1Players;
      body.team2_players = team2Players;
    } else if (gameType === "schafkopf") {
      body.schafkopf_options = schafkopfOptions;
    } else if (gameType === "doppelkopf") {
      body.doppelkopf_options = { solo_value: doppelkopfSoloValue };
    } else if (gameType === "kinderkarten") {
      body.kinderkarten_options = kinderkartenOptions;
    }

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const session = await res.json();
        setName(generateDefaultName());
        setGameType("schafkopf");
        setSchafkopfOptions({ geier: false, farbwenz: false });
        setDoppelkopfSoloValue(3);
        setKinderkartenOptions({ with_trump: true, ober_trump: false, unter_trump: false, card_count: 5 });
        setStake(GAME_PLUGINS.schafkopf?.defaultStake ?? 0.50);
        setSelectedNames([]);
        setTeam1Players([]);
        setTeam2Players([]);
        setTargetScore(13);
        setHasUserModifiedName(false);
        onCreated(session);
      }
    } catch (error) {
      console.error("Fetch error", error);
    }
  };

  const pluginEntries = Object.values(GAME_PLUGINS);
  const currentPlugin = GAME_PLUGINS[gameType];
  const canSubmit = gameType === 'watten'
    ? name.trim().length > 0 && team1Players.length === 2 && team2Players.length === 2
    : name.trim().length > 0 &&
      selectedNames.length >= (currentPlugin?.playerCount?.min || 2) &&
      selectedNames.length <= (currentPlugin?.playerCount?.max || 10);

  return (
    <div style={styles.newSessionForm}>
      <h3 style={{ ...styles.formTitle, marginBottom: 16 }}>Neue Runde</h3>

      <label style={styles.label}>Name</label>
      <input
        style={styles.input}
        placeholder="z.B. Freitagsrunde"
        value={name}
        onChange={handleNameChange}
      />

      <label style={styles.label}>Spiel</label>
      <div style={styles.chipRow}>
         {pluginEntries.map((p) => (
           <button
             key={p.id}
              style={{ ...styles.chip, ...(gameType === p.id ? styles.chipActive : {}) }}
              onClick={() => {
                 setGameType(p.id);
                 setStake(p.defaultStake ?? GAME_PLUGINS.schafkopf?.defaultStake ?? 0.50);
                 setSchafkopfOptions({ geier: false, farbwenz: false });
                 setKinderkartenOptions({ with_trump: true, ober_trump: false, unter_trump: false, card_count: 5 });
                 if (p.id === 'watten') {
                   setTeam1Players([]);
                   setTeam2Players([]);
                   setSelectedNames([]);
                 } else {
                   setSelectedNames([]);
                   setTeam1Players([]);
                   setTeam2Players([]);
                 }
               }}
           >{p.label}</button>
           ))}
         </div>

      {gameType === 'schafkopf' && (
        <div style={{ margin: "8px 0 4px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>Optionale Modi:</span>
          <label style={styles.checkLabel}>
            <input
              type="checkbox"
              checked={schafkopfOptions.geier}
              onChange={(e) => setSchafkopfOptions((o) => ({ ...o, geier: e.target.checked }))}
            />
            <span style={styles.checkText}>Geier</span>
          </label>
          <label style={styles.checkLabel}>
            <input
              type="checkbox"
              checked={schafkopfOptions.farbwenz}
              onChange={(e) => setSchafkopfOptions((o) => ({ ...o, farbwenz: e.target.checked }))}
            />
            <span style={styles.checkText}>Farbwenz</span>
          </label>
        </div>
      )}

      {gameType === 'doppelkopf' && (
        <div style={{ margin: "8px 0 4px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>Einsatz (Normal):</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button style={styles.btnSmall} onClick={() => setStake(s => Math.max(0.25, parseFloat((s - 0.25).toFixed(2))))}>−</button>
            <span style={{ fontWeight: 600, minWidth: 40, textAlign: "center" }}>{stake.toFixed(2)} €</span>
            <button style={styles.btnSmall} onClick={() => setStake(s => parseFloat((s + 0.25).toFixed(2)))}>+</button>
          </div>
          <span style={{ fontSize: 12, color: "#666", fontWeight: 600, marginLeft: 8 }}>Solo-Wert:</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button style={styles.btnSmall} onClick={() => setDoppelkopfSoloValue(v => Math.max(1, v - 1))}>−</button>
            <span style={{ fontWeight: 600, minWidth: 24, textAlign: "center" }}>{doppelkopfSoloValue}</span>
            <button style={styles.btnSmall} onClick={() => setDoppelkopfSoloValue(v => v + 1)}>+</button>
          </div>
        </div>
      )}

      {gameType === 'kinderkarten' && (
        <div style={{ margin: "8px 0 4px", display: "flex", flexDirection: "column", gap: 12, padding: "12px", background: "#fdf6e3", borderRadius: 8, border: "1px solid #d4c49a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <label style={styles.checkLabel}>
              <input
                type="checkbox"
                checked={kinderkartenOptions.with_trump}
                onChange={(e) => setKinderkartenOptions((o) => ({ ...o, with_trump: e.target.checked }))}
              />
              <span style={styles.checkText}>Mit Trumpf</span>
            </label>
            <label style={styles.checkLabel}>
              <input
                type="checkbox"
                checked={kinderkartenOptions.ober_trump}
                onChange={(e) => setKinderkartenOptions((o) => ({ ...o, ober_trump: e.target.checked }))}
              />
              <span style={styles.checkText}>Ober Trumpf</span>
            </label>
            <label style={styles.checkLabel}>
              <input
                type="checkbox"
                checked={kinderkartenOptions.unter_trump}
                onChange={(e) => setKinderkartenOptions((o) => ({ ...o, unter_trump: e.target.checked }))}
              />
              <span style={styles.checkText}>Unter Trumpf</span>
            </label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>Karten pro Spieler:</span>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(count => (
              <button
                key={count}
                style={{ ...styles.chip, ...(kinderkartenOptions.card_count === count ? styles.chipActive : {}) }}
                onClick={() => setKinderkartenOptions((o) => ({ ...o, card_count: count }))}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      )}

      <label style={styles.label}>
        {gameType === 'watten' ? 'Spieler zuweisen' : 'Spieler auswählen'}
      </label>
      {currentPlugin?.playerHint && (
        <p style={{ fontSize: 11, color: "#8b6914", margin: "4px 0 8px", fontStyle: "italic" }}>
          {currentPlugin.playerHint}
        </p>
      )}

      {gameType !== 'watten' && (
        <>
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
          {selectedNames.length > 0 && selectedNames.length < (currentPlugin?.playerCount?.min || 2) && (
            <p style={{ fontSize: 11, color: "#9d6b00", margin: "4px 0 0", fontStyle: "italic" }}>
              Mindestens {currentPlugin?.playerCount?.min || 2} Spieler erforderlich.
            </p>
          )}
          {selectedNames.length > (currentPlugin?.playerCount?.max || 10) && (
            <p style={{ fontSize: 11, color: "#9d0208", margin: "4px 0 0", fontStyle: "italic" }}>
              Maximal {currentPlugin?.playerCount?.max || 10} Spieler erlaubt.
            </p>
          )}
        </>
      )}

      {showQuickAdd ? (
        <QuickAddPlayer onAdded={handleQuickAdd} />
      ) : (
        <button style={styles.playerChipNew} onClick={() => setShowQuickAdd(true)}>
          ＋ Neuer Spieler
        </button>
      )}

      {gameType === 'watten' && (
        <>
          <div style={styles.playerChipRow}>
            {allPlayers.map((p) => {
              const inTeam1 = team1Players.includes(p.name);
              const inTeam2 = team2Players.includes(p.name);
              return (
                <button
                  key={p.id}
                  style={{
                    ...styles.playerChip,
                    ...(inTeam1 || inTeam2 ? styles.playerChipActive : {}),
                    ...(inTeam1 ? { background: '#2d6a4f', color: '#ffffff' } : {}),
                    ...(inTeam2 ? { background: '#c7a008', color: '#ffffff' } : {})
                  }}
                  onClick={() => togglePlayer(p.name)}
                >
                  <span>{p.avatar}</span>
                  <span>{p.name}</span>
                  {inTeam1 && <span style={{ fontSize: 10 }}>T1</span>}
                  {inTeam2 && <span style={{ fontSize: 10 }}>T2</span>}
                </button>
              );
            })}
          </div>

          {(team1Players.length !== 2 || team2Players.length !== 2) && (team1Players.length > 0 || team2Players.length > 0) && (
            <p style={{ fontSize: 11, color: "#9d0208", margin: "4px 0 0", fontStyle: "italic" }}>
              Watten benötigt genau 2 Spieler pro Team.
            </p>
          )}

          <div style={{ display: "flex", gap: 16, marginBottom: 16, marginTop: 12 }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: 14, fontWeight: "bold", color: "#2c1810", marginBottom: 8 }}>Team 1</h4>
              <div style={{
                background: team1Players.length === 2 ? "#2d6a4f" : "#e8dcc5",
                color: team1Players.length === 2 ? "#ffffff" : "#2c1810",
                padding: "12px 16px",
                borderRadius: 8,
                minHeight: "80px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}>
                {team1Players.length === 0 && <span style={{ fontSize: 12, opacity: 0.6 }}>Spieler auswählen</span>}
                {team1Players.map((name) => (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      style={{ ...styles.chip, ...styles.chipActive, padding: "4px 12px", fontSize: 13 }}
                      onClick={() => setTeam1Players(prev => prev.filter(n => n !== name))}
                    >
                      {allPlayers.find(p => p.name === name)?.avatar ?? "🃏"} {name}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: 14, fontWeight: "bold", color: "#2c1810", marginBottom: 8 }}>Team 2</h4>
              <div style={{
                background: team2Players.length === 2 ? "#2d6a4f" : "#e8dcc5",
                color: team2Players.length === 2 ? "#ffffff" : "#2c1810",
                padding: "12px 16px",
                borderRadius: 8,
                minHeight: "80px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}>
                {team2Players.length === 0 && <span style={{ fontSize: 12, opacity: 0.6 }}>Spieler auswählen</span>}
                {team2Players.map((name) => (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      style={{ ...styles.chip, ...styles.chipActive, padding: "4px 12px", fontSize: 13 }}
                      onClick={() => setTeam2Players(prev => prev.filter(n => n !== name))}
                    >
                      {allPlayers.find(p => p.name === name)?.avatar ?? "🃏"} {name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <label style={styles.label}>Zielpunktzahl</label>
          <div style={styles.chipRow}>
            {[13, 15].map(score => (
              <button
                key={score}
                style={{ ...styles.chip, ...(targetScore === score ? styles.chipActive : {}) }}
                onClick={() => setTargetScore(score)}
              >{score} Punkte</button>
            ))}
          </div>
        </>
      )}

      {(() => {
        const HintComponent = GAME_PLUGINS[gameType]?.SessionCreationHint;
        const playerCount = gameType === 'watten' ? team1Players.length + team2Players.length : selectedNames.length;
        return HintComponent ? <HintComponent playerCount={playerCount} /> : null;
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

          const playerText = s.game_type === 'watten'
            ? `T1: ${parseArray(s.watten_team1_players).join("+")} | T2: ${parseArray(s.watten_team2_players).join("+")}`
            : s.players.join(", ");

          return (
            <div key={s.id} style={{ ...styles.sessionCard, ...(isCompletedWizard ? { opacity: 0.7 } : {}) }} onClick={() => onSessionSelect(s.id)}>
              <div style={styles.sessionCardLeft}>
                <span style={styles.sessionName}>{s.name}</span>
                {isCompletedWizard && <span style={{ marginLeft: 8, fontSize: 11, color: "#9d0208" }}>✓</span>}
                <span style={styles.sessionMeta}>
                  {plugin?.label ?? s.game_type}
                  {" · "}
                  {playerText}
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
