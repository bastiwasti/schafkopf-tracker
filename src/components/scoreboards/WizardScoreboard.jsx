import BaseScoreboard from "./BaseScoreboard.jsx";
import HistoryCard from "../../HistoryCard.jsx";

export default function WizardScoreboard({ players, balances, history, registeredPlayers = [], children }) {
  const avatarMap = Object.fromEntries(registeredPlayers.map((p) => [p.name, p.avatar]));

  return (
    <BaseScoreboard
      players={players}
      balances={balances}
      history={history}
      registeredPlayers={registeredPlayers}
    >
      {({ avatarMap, leader }) => (
        <>
          {children({ players, balances, history, avatarMap, leader })}

          <div style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#8b6914" }}>
              Gesamtpunkte
            </h3>
          </div>
        </>
      )}
    </BaseScoreboard>
  );
}
