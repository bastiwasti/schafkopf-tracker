import { Suspense } from "react";
import { GAME_PLUGINS } from "../games/index.js";
import styles from "./styles.js";

export default function SessionView({ session, registeredPlayers = [], onBack, onSessionUpdated }) {
  const plugin = GAME_PLUGINS[session.game_type];
  const { SessionComponent } = plugin;
  const { players, game_type } = session;

  const subtitle = game_type === 'watten'
    ? `${plugin.label} · Team 1: ${session.watten_team1_players?.join(" + ")} | Team 2: ${session.watten_team2_players?.join(" + ")}`
    : `${plugin.label} · ${players.join(", ")}`;

  return (
    <div style={styles.container}>
      <div style={styles.sessionHeader}>
        <button style={styles.backBtn} onClick={onBack}>← Runden</button>
        <div style={{ flex: 1 }}>
          <div style={styles.sessionTitle}>{session.name}</div>
          <div style={styles.sessionSubtitle}>{subtitle}</div>
        </div>
      </div>
      <SessionComponent
        session={session}
        registeredPlayers={registeredPlayers}
        onBack={onBack}
        onSessionUpdated={onSessionUpdated}
      />
    </div>
  );
}
