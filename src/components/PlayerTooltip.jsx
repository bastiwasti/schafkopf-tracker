import { useState } from "react";
import styles from "./styles.js";
import { PLAYER_PERSONALITIES } from "../games/shared/playerPersonalities.js";

export default function PlayerTooltip({ player, registeredPlayers }) {
  const [tooltip, setTooltip] = useState(null);
  const reg = (registeredPlayers ?? []).find((p) => p.name === player.name);
  if (!reg) return <div style={styles.playerCardAvatar}>{player.avatar}</div>;

  const charType = reg.character_type ?? "—";
  const voice = reg.voice ?? "—";
  const personalityLabel = PLAYER_PERSONALITIES[charType]?.label ?? charType;

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ x: rect.left + rect.width / 2, y: rect.bottom + 6 });
  };

  return (
    <div
      style={{ position: "relative", cursor: "default" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setTooltip(null)}
    >
      <div style={styles.playerCardAvatar}>{player.avatar}</div>
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
          <div style={{ fontWeight: "bold", marginBottom: 2 }}>{personalityLabel}</div>
          <div style={{ opacity: 0.75 }}>🔊 {voice}</div>
        </div>
      )}
    </div>
  );
}
