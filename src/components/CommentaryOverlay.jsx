import { useEffect, useRef } from "react";
import { PERSONALITIES, buildFullCommentary } from "../games/schafkopf/commentary.js";
import styles from "./styles.js";

const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

export default function CommentaryOverlay({ game, registeredPlayers, commentatorPersonality, commentatorVoice, onClose, buildFn }) {
  const personality = PERSONALITIES[commentatorPersonality] ?? PERSONALITIES.dramatic;
  const fn = buildFn ?? buildFullCommentary;
  const { segments, spokenText } = useRef(
    fn(game, registeredPlayers, commentatorPersonality)
  ).current;

  useEffect(() => {
    if (!hasSpeech) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(spokenText);
    const voices = window.speechSynthesis.getVoices();
    utter.voice = voices.find((v) => v.name === commentatorVoice)
      ?? voices.find((v) => v.lang.startsWith("de"))
      ?? null;
    utter.pitch = personality.pitch;
    utter.rate = personality.rate;
    utter.lang = "de-DE";
    utter.onend = onClose;
    window.speechSynthesis.speak(utter);
    return () => { window.speechSynthesis.cancel(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    if (hasSpeech) window.speechSynthesis.cancel();
    onClose();
  };

  return (
    <div style={styles.commentaryOverlay} onClick={handleClose}>
      <div style={styles.commentaryCard} onClick={(e) => e.stopPropagation()}>

        {/* Speaker header (commentator) */}
        <div style={styles.commentarySpeaker}>
          <div style={styles.commentarySpeakerAvatar}>{personality.icon}</div>
          <div style={styles.commentarySpeakerInfo}>
            <div style={styles.commentarySpeakerName}>Kommentator</div>
            <div style={styles.commentarySpeakerLabel}>{personality.label}</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 18 }}>🔊</div>
        </div>

        {/* Segments */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {segments.map((seg, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              {/* Avatar — only shown for player segments (index > 0) */}
              {i > 0 && (
                <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>
                  {seg.avatar}
                </div>
              )}
              <div
                style={{
                  ...styles.commentaryBubble,
                  fontSize: i === 0 ? 16 : 14,
                  fontStyle: i === 0 ? "italic" : "normal",
                  flex: 1,
                  minHeight: "unset",
                  padding: i === 0 ? "14px 16px" : "10px 14px",
                  marginLeft: i > 0 ? 0 : undefined,
                }}
              >
                {i === 0 && <div style={styles.commentaryBubbleCaret} />}
                {seg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={styles.commentaryActions}>
          <button style={styles.btnCloseOverlay} onClick={handleClose}>✕ Schließen</button>
        </div>
      </div>
    </div>
  );
}
