import styles from "../../components/styles.js";
import { useEffect } from 'react';

export default function WattenRoundForm({ form, onFormChange, team1_players, team2_players, avatarMap = {}, isGespannt, team1_score, team2_score, targetScore, onSubmit, onCancel }) {
  const handleTeamChange = (team) => {
    onFormChange({ ...form, winning_team: team });
  };

  const handlePointsChange = (points) => {
    onFormChange({ ...form, points: parseInt(points) });
  };

  const handleGegangenChange = (isGegangen) => {
    if (!isTeamGespannt) {
      onFormChange({ ...form, is_gegangen: isGegangen, points: isGegangen ? 2 : form.points });
    } else {
      onFormChange({ ...form, is_gegangen: isGegangen });
    }
  };

  const handleMachineChange = (isMachine) => {
    if (!isTeamGespannt) {
      onFormChange({ ...form, is_machine: isMachine, points: isMachine ? 2 : form.points });
    } else {
      onFormChange({ ...form, is_machine: isMachine });
    }
  };

  const isMachine = form.is_machine || false;
  const isGegangen = form.is_gegangen || false;

  // Gespannt-Logik: Wenn ein Team >= targetScore - 2 hat, dann ist jedes Spiel automatisch 3 Punkte wert
  const isTeamGespannt = (team1_score >= (targetScore || 15) - 2) || (team2_score >= (targetScore || 15) - 2);

  // Wenn automatisch gespannt, dann Punkte auf 3 setzen
  useEffect(() => {
    if (isTeamGespannt && form.points !== 3) {
      onFormChange({ ...form, points: 3 });
    }
  }, [isTeamGespannt, form.points]);

  return (
    <div style={styles.gameForm}>
      <h3 style={styles.formTitle}>Neue Runde eintragen</h3>

      {/* Gespannt-Anzeige */}
      {isTeamGespannt && (
        <div style={{
          padding: 12,
          marginBottom: 16,
          background: "#f7dc6f",
          borderLeft: "4px solid #f39c12",
          borderRadius: 4,
          fontSize: 13,
          fontWeight: "bold",
          color: "#2c1810",
        }}>
          ⚠️ Gespannt! 🧱 Jedes Spiel ist automatisch 3 Punkte wert
        </div>
      )}

      <label style={styles.label}>Gewinner-Team</label>
      <div style={styles.chipRow}>
        <button
          style={{
            ...styles.chip,
            ...(form.winning_team === 'team1' ? styles.chipActive : {}),
          }}
          onClick={() => handleTeamChange('team1')}
        >
          {team1_players.map(p => `${avatarMap[p] || "🃏"} ${p}`).join(" + ")}
        </button>
        <button
          style={{
            ...styles.chip,
            ...(form.winning_team === 'team2' ? styles.chipActive : {}),
          }}
          onClick={() => handleTeamChange('team2')}
        >
          {team2_players.map(p => `${avatarMap[p] || "🃏"} ${p}`).join(" + ")}
        </button>
      </div>

      <label style={styles.label}>Punkte</label>
      <div style={styles.chipRow}>
        {[2, 3, 4, 5].map(points => (
          <button
            key={points}
            style={{
              ...styles.chip,
              ...(form.points === points ? styles.chipActive : {}),
              opacity: isTeamGespannt ? 0.5 : 1,
              cursor: isTeamGespannt ? "not-allowed" : "pointer",
            }}
            onClick={() => handlePointsChange(points)}
            disabled={isTeamGespannt}
          >
            {points}
          </button>
        ))}
      </div>

      {/* Gespannt-Status-Anzeige beim Spiel eintragen */}
      {!isGespannt && (
        <div style={{ marginTop: 16, marginBottom: 8, fontSize: 12, color: "#8b6914" }}>
          <span style={{ fontWeight: "bold" }}>Status: </span>
          {isTeamGespannt ? "⚠️ Gespannt - 🧱 Auto 3 Punkte" : "Normal - 2 Punkte Standard"}
        </div>
      )}

      <div style={{ marginTop: 16, marginBottom: 8 }}>
        <label style={{ ...styles.label, display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={isGegangen}
            onChange={(e) => handleGegangenChange(e.target.checked)}
            disabled={isTeamGespannt}
          />
          <span style={{ opacity: isTeamGespannt ? 0.5 : 1 }}>🏃 Gegangen</span>
        </label>
      </div>

      <div style={{ marginTop: 16, marginBottom: 8 }}>
        <label style={{ ...styles.label, display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={isMachine}
            onChange={(e) => handleMachineChange(e.target.checked)}
          />
          <span>🤖 Maschine (3 Kritische)</span>
        </label>
      </div>

      <label style={styles.label}>Stiche (optional, max 5 insgesamt)</label>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: "#2c1810", marginBottom: 4, display: "block" }}>{team1_players.map(p => `${avatarMap[p] || "🃏"} ${p}`).join(" + ")}</label>
          <input
            list="tricks-team1"
            type="number"
            min="0"
            max="5"
            value={form.tricks_team1 || 0}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              const maxVal = Math.min(5, val);
              const team2Val = Math.max(0, 5 - maxVal);
              onFormChange({ ...form, tricks_team1: maxVal, tricks_team2: team2Val });
            }}
            style={styles.input}
          />
          <datalist id="tricks-team1">
            {[0, 1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </datalist>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: "#2c1810", marginBottom: 4, display: "block" }}>{team2_players.map(p => `${avatarMap[p] || "🃏"} ${p}`).join(" + ")}</label>
          <input
            list="tricks-team2"
            type="number"
            min="0"
            max="5"
            value={form.tricks_team2 || 0}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              const maxVal = Math.min(5, val);
              const team1Val = Math.max(0, 5 - maxVal);
              onFormChange({ ...form, tricks_team2: maxVal, tricks_team1: team1Val });
            }}
            style={styles.input}
          />
          <datalist id="tricks-team2">
            {[0, 1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </datalist>
        </div>
      </div>

      <div style={styles.actions}>
        <button style={styles.btnConfirm} onClick={onSubmit}>✓ Speichern</button>
      </div>
    </div>
  );
}
