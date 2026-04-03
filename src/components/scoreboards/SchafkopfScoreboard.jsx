import BaseScoreboard from "./BaseScoreboard.jsx";
import BockBar from "../../components/BockBar.jsx";

export default function SchafkopfScoreboard({ players, balances, history, registeredPlayers = [], children }) {
  const { bock, stake, onBockChange } = children;

  return (
    <BaseScoreboard
      players={players}
      balances={balances}
      history={history}
      registeredPlayers={registeredPlayers}
    >
      {({ avatarMap, leader }) => (
        <>
          <BockBar bock={bock} onBockChange={onBockChange} />

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#8b6914" }}>
              Einsatz: {stake.toFixed(2)} € pro Spiel
            </div>
          )}
        </>
      )}
    </BaseScoreboard>
  );
}
