import { useEffect, useMemo, useState } from "react";
import { PERSONALITIES } from "../games/shared/commentary.js";
import styles from "./styles.js";

function PlayerBadge({ seg, registeredPlayers, commentatorVoice }) {
  const [tooltip, setTooltip] = useState(null);
  const player = (registeredPlayers ?? []).find((p) => p.name === seg.name);
  const voice = player?.voice ?? commentatorVoice ?? "—";

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ x: rect.left + rect.width / 2, y: rect.bottom + 8 });
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, marginTop: 2, cursor: "default" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setTooltip(null)}
    >
      <div style={{ fontSize: 28, lineHeight: 1 }}>{seg.avatar}</div>
      {seg.name && (
        <div style={{ fontSize: 10, fontWeight: "bold", color: "#2c1810", marginTop: 2, maxWidth: 60, textAlign: "center", wordBreak: "break-word" }}>
          {seg.name}
        </div>
      )}
      {seg.label && (
        <div style={{ fontSize: 9, color: "#8b6914", marginTop: 1, maxWidth: 60, textAlign: "center", wordBreak: "break-word" }}>
          {seg.label}
        </div>
      )}
      {tooltip && (
        <div style={{
          position: "fixed",
          left: tooltip.x,
          top: tooltip.y,
          transform: "translateX(-50%)",
          background: "#2c1810",
          color: "#fdf6e3",
          borderRadius: 8,
          padding: "6px 10px",
          fontSize: 11,
          whiteSpace: "nowrap",
          zIndex: 2000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          pointerEvents: "none",
        }}>
          <div style={{ fontWeight: "bold", marginBottom: 2 }}>{seg.label || "—"}</div>
          <div style={{ opacity: 0.75 }}>🔊 {voice}</div>
        </div>
      )}
    </div>
  );
}

const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

export default function CommentaryOverlay({ game, registeredPlayers, commentatorPersonality, commentatorVoice, onClose, buildFn, sessionHistory }) {
  const personality = PERSONALITIES[commentatorPersonality] ?? PERSONALITIES.dramatic;

  const segments = useMemo(() => {
    try {
      if (!game) {
        console.error('[CommentaryOverlay] No game data provided');
        return [{ avatar: "⚠️", name: "System", label: "Fehler", text: "Keine Spieldaten vorhanden" }];
      }

      if (!buildFn || typeof buildFn !== 'function') {
        console.error('[CommentaryOverlay] buildFn is not a function:', buildFn);
        return [{ avatar: "⚠️", name: "System", label: "Fehler", text: "Keine Kommentarfunktion verfügbar" }];
      }

      console.log('[CommentaryOverlay] Building commentary for game:', game);
      const result = buildFn(game, registeredPlayers, commentatorPersonality, sessionHistory ?? []);

      if (!result || !result.segments || !Array.isArray(result.segments)) {
        console.error('[CommentaryOverlay] Invalid commentary result:', result);
        return [{ avatar: "⚠️", name: "System", label: "Fehler", text: "Fehler beim Erstellen des Kommentars" }];
      }

      return result.segments;
    } catch (error) {
      console.error('[CommentaryOverlay] Error building commentary:', error);
      return [{ avatar: "⚠️", name: "System", label: "Fehler", text: "Fehler beim Erstellen des Kommentars: " + error.message }];
    }
  }, [game, registeredPlayers, commentatorPersonality, buildFn, sessionHistory]);

  useEffect(() => {
    if (!hasSpeech) return;
    if (!segments || !Array.isArray(segments)) return;
    
    window.speechSynthesis.cancel();

    const playerVoiceMap = Object.fromEntries(
      (registeredPlayers ?? []).map(p => [p.name, p.voice])
    );

    const voices = window.speechSynthesis.getVoices();

    const speakSegment = (index) => {
      if (index >= segments.length) {
        onClose();
        return;
      }

      const seg = segments[index];
      if (!seg) {
        onClose();
        return;
      }

      const isPlayer = index > 0;

      const utter = new SpeechSynthesisUtterance(seg.text);

      if (isPlayer && seg.name) {
        const playerVoice = playerVoiceMap[seg.name];
        utter.voice = voices.find((v) => v.name === playerVoice)
          ?? voices.find((v) => v.lang.startsWith("de"))
          ?? null;

        const player = (registeredPlayers ?? []).find(p => p.name === seg.name);
        const playerChar = player?.character_type ?? "dramatic";
        const playerPers = PERSONALITIES[playerChar] ?? PERSONALITIES.dramatic;
        utter.pitch = playerPers.pitch;
        utter.rate = playerPers.rate;
      } else {
        utter.voice = voices.find((v) => v.name === commentatorVoice)
          ?? voices.find((v) => v.lang.startsWith("de"))
          ?? null;
        utter.pitch = personality.pitch;
        utter.rate = personality.rate;
      }

      utter.lang = "de-DE";
      utter.onend = () => speakSegment(index + 1);

      window.speechSynthesis.speak(utter);
    };

    speakSegment(0);

    return () => { window.speechSynthesis.cancel(); };
  }, [segments, registeredPlayers, commentatorVoice, personality, onClose]);

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
          {segments && Array.isArray(segments) ? (
            segments.map((seg, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                {i > 0 && (
                  <PlayerBadge
                    seg={seg}
                    registeredPlayers={registeredPlayers}
                    commentatorVoice={commentatorVoice}
                  />
                )}
                <div
                  style={{
                    ...styles.commentaryBubble,
                    fontSize: i === 0 ? 16 : 14,
                    fontStyle: i === 0 ? "italic" : "normal",
                    flex: "1 1 0%",
                    minHeight: "unset",
                    padding: i === 0 ? "14px 16px" : "10px 14px",
                    marginLeft: i > 0 ? 0 : undefined,
                  }}
                >
                  {i === 0 && <div style={styles.commentaryBubbleCaret} />}
                  {seg.text}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
              Keine Kommentare verfügbar
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={styles.commentaryActions}>
          <button style={styles.btnCloseOverlay} onClick={handleClose}>✕ Schließen</button>
        </div>
      </div>
    </div>
  );
}