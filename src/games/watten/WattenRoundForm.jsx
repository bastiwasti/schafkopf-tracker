import styles from "../../components/styles.js";

export default function WattenRoundForm({ form, onFormChange, team1_players, team2_players, isGespannt, onSubmit, onCancel }) {
  const handleTeamChange = (team) => {
    onFormChange({ ...form, winning_team: team, is_spannt_played: false });
  };

  const handlePointsChange = (points) => {
    onFormChange({ ...form, points: parseInt(points) });
  };

  const handleMachineChange = (isMachine) => {
    onFormChange({ ...form, is_machine: isMachine, points: isMachine ? 2 : form.points });
  };

  const handleSpanntPlayedChange = (isSpanntPlayed) => {
    onFormChange({ ...form, is_spannt_played: isSpanntPlayed, points: isSpanntPlayed ? 2 : form.points });
  };

  const isMachine = form.is_machine || false;
  const isSpanntPlayed = form.is_spannt_played || false;

  return (
    <div style={styles.gameForm}>
      <h3 style={styles.formTitle}>Neue Runde eintragen</h3>

      <label style={styles.label}>Gewinner-Team</label>
      <div style={styles.chipRow}>
        <button
          style={{
            ...styles.chip,
            ...(form.winning_team === 'team1' ? styles.chipActive : {}),
          }}
          onClick={() => handleTeamChange('team1')}
          disabled={isSpanntPlayed}
        >
          Team 1
        </button>
        <button
          style={{
            ...styles.chip,
            ...(form.winning_team === 'team2' ? styles.chipActive : {}),
          }}
          onClick={() => handleTeamChange('team2')}
          disabled={isSpanntPlayed}
        >
          Team 2
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
              opacity: (isMachine || isSpanntPlayed || isGespannt) && points !== 2 ? 0.5 : 1,
              cursor: (isMachine || isSpanntPlayed || isGespannt) && points !== 2 ? "not-allowed" : "pointer",
            }}
            onClick={() => handlePointsChange(points)}
            disabled={isMachine || isSpanntPlayed || (isGespannt && points !== 2)}
          >
            {points}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16, marginBottom: 8 }}>
        <label style={{ ...styles.label, display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={isMachine}
            onChange={(e) => handleMachineChange(e.target.checked)}
            disabled={isSpanntPlayed}
          />
          <span>Maschine (3 Kritische)</span>
        </label>
      </div>

      {isGespannt && !isMachine && (
        <div style={{ marginBottom: 16 }}>
          <button
            style={{
              ...styles.chip,
              ...(isSpanntPlayed ? styles.chipActive : {}),
            }}
            onClick={() => handleSpanntPlayedChange(!isSpanntPlayed)}
            disabled={isMachine}
          >
            {isSpanntPlayed ? "✓ Gespannt geht (2 Punkte)" : "Gespannt → Geht (2 Punkte)"}
          </button>
        </div>
      )}

      <label style={styles.label}>Stiche (optional)</label>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: "#2c1810", marginBottom: 4, display: "block" }}>Team 1</label>
          <input
            type="number"
            min="0"
            max="3"
            value={form.tricks_team1 || 0}
            onChange={(e) => onFormChange({ ...form, tricks_team1: parseInt(e.target.value) || 0 })}
            style={styles.input}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: "#2c1810", marginBottom: 4, display: "block" }}>Team 2</label>
          <input
            type="number"
            min="0"
            max="3"
            value={form.tricks_team2 || 0}
            onChange={(e) => onFormChange({ ...form, tricks_team2: parseInt(e.target.value) || 0 })}
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.actions}>
        <button style={styles.btnConfirm} onClick={onSubmit}>✓ Speichern</button>
        <button style={styles.btnCancel} onClick={onCancel}>Abbrechen</button>
      </div>
    </div>
  );
}
