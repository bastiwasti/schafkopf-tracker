import styles from "../../components/styles.js";

export default function RulesBox() {
  return (
    <div style={{
      background: "#fdf6e3",
      border: "1.5px solid #8b6914",
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    }}>
      <h3 style={{ ...styles.formTitle, marginBottom: 16 }}>Wizard-Regeln</h3>
      
      <div style={{ marginBottom: 16 }}>
        <strong style={{ color: "#8b6914" }}>Spielziel:</strong>
        <p style={{ marginTop: 4, fontSize: 14, lineHeight: 1.5 }}>
          Punkte durch korrekte Vorhersage der eigenen Stichanzahl sammeln. 
          Der Spieler mit den meisten Punkten am Ende gewinnt.
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong style={{ color: "#8b6914" }}>Punktevergabe:</strong>
        <ul style={{ marginTop: 8, paddingLeft: 20, fontSize: 14, lineHeight: 1.6 }}>
          <li>
            <strong>Korrekte Vorhersage:</strong> +20 + 10×Stichanzahl
          </li>
          <li>
            <strong>Falsche Vorhersage:</strong> -10×Abweichung
          </li>
        </ul>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong style={{ color: "#8b6914" }}>Beispiele:</strong>
        <div style={{
          background: "#f8f0e3",
          padding: 12,
          borderRadius: 8,
          marginTop: 8,
          fontSize: 13,
        }}>
          <div style={{ marginBottom: 8 }}>
            <strong>Vor: 2</strong> · <strong>Tat: 2</strong> → +40 Punkte
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Vor: 3</strong> · <strong>Tat: 1</strong> → -20 Punkte
          </div>
          <div>
            <strong>Vor: 0</strong> · <strong>Tat: 0</strong> → +20 Punkte
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong style={{ color: "#8b6914" }}>Rundenanzahl:</strong>
        <ul style={{ marginTop: 8, paddingLeft: 20, fontSize: 14, lineHeight: 1.6 }}>
          <li>3 Spieler: 20 Runden (1-20 Karten)</li>
          <li>4 Spieler: 15 Runden (1-15 Karten)</li>
          <li>5 Spieler: 12 Runden (1-12 Karten)</li>
          <li>6 Spieler: 10 Runden (1-10 Karten)</li>
        </ul>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong style={{ color: "#8b6914" }}>Kartenreihenfolge:</strong>
        <p style={{ marginTop: 4, fontSize: 14, lineHeight: 1.5 }}>
          Narr (niedrigste) · 2-13 · As · Zauberer (höchste)
        </p>
      </div>

      <div>
        <strong style={{ color: "#8b6914" }}>Spezielle Karten:</strong>
        <ul style={{ marginTop: 8, paddingLeft: 20, fontSize: 14, lineHeight: 1.6 }}>
          <li><strong>Narr:</strong> Niedrigste Karte, verliert immer</li>
          <li><strong>Zauberer (Wizard):</strong> Höchste Karte, gewinnt immer</li>
          <li><strong>Trümpf:</strong> Beste Karte im gespielten Suit</li>
        </ul>
      </div>
    </div>
  );
}
