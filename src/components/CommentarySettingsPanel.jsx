import { useState, useEffect } from "react";
import { PERSONALITIES } from "../games/shared/commentary.js";
import styles from "./styles.js";

const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

function VoicePickerInline({ value, onChange }) {
  const [voices, setVoices] = useState([]);
  useEffect(() => {
    if (!hasSpeech) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);
  if (!hasSpeech || voices.length === 0) return null;
  return (
    <select style={styles.voiceSelect} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">— Standard (System) —</option>
      {voices.map((v) => (
        <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
      ))}
    </select>
  );
}

export default function CommentarySettingsPanel({ personality, voice, enabled, onPersonality, onVoice, onEnabled }) {
  return (
    <div style={styles.commentatorSettingsPanel}>
      <div style={styles.commentatorSettingsTitle}>Kommentator</div>

      <div style={{ ...styles.commentatorToggleRow, marginBottom: 10 }}>
        <span>Kommentator aktiv</span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onEnabled(e.target.checked)}
          style={{ width: 18, height: 18, cursor: "pointer" }}
        />
      </div>

      {enabled && (
        <>
          <label style={{ ...styles.label, marginTop: 0 }}>Persönlichkeit</label>
          <div style={styles.personalityChipRow}>
            {Object.entries(PERSONALITIES).map(([key, p]) => (
              <button
                key={key}
                style={{ ...styles.personalityChip, ...(personality === key ? styles.personalityChipActive : {}) }}
                onClick={() => onPersonality(key)}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>

          <label style={styles.label}>Stimme des Kommentators</label>
          <VoicePickerInline value={voice} onChange={onVoice} />
        </>
      )}
    </div>
  );
}
