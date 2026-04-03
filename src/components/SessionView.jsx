import { Suspense } from "react";
import { GAME_PLUGINS } from "../games/index.js";
import styles from "./styles.js";

export default function SessionView({ session, registeredPlayers = [], onBack, onSessionUpdated }) {
  const plugin = GAME_PLUGINS[session.game_type];
  const { SessionComponent } = plugin;
  const { players } = session;

  return (
    <div style={styles.container}>
      <div style={styles.sessionHeader}>
        <button style={styles.backBtn} onClick={onBack}>← Runden</button>
        <div style={{ flex: 1 }}>
          <div style={styles.sessionTitle}>{session.name}</div>
          <div style={styles.sessionSubtitle}>{plugin.label} · {players.join(", ")}</div>
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
