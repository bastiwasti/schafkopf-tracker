import styles from "../../components/styles.js";

export default function RulesBox() {
  return (
    <div style={styles.rulesBox}>
      <h3 style={styles.rulesTitle}>Doppelkopf-Regeln (Kurzfassung)</h3>
      <div style={styles.rulesContent}>
        <p style={styles.rulesParagraph}><strong>Kartenspiel:</strong> Deutsches Blatt, 48 Karten (jede Karte doppelt). 4 Spieler, immer alle mit.</p>
        <p style={styles.rulesParagraph}><strong>Trumpfreihenfolge:</strong> Herz-10 (Dulle), alle Damen, alle Buben, dann alle Karos. Zwei Dullen im Spiel.</p>
        <p style={styles.rulesParagraph}><strong>Teams:</strong></p>
        <p style={styles.rulesItem}>• <strong>Normal:</strong> Spieler + Partner (Kreuz-Dame) gegen die zwei Gegenspieler. 121+ Augen gewinnt.</p>
        <p style={styles.rulesItem}>• <strong>Solo:</strong> Ein Spieler alleine gegen die anderen drei.</p>
        <p style={styles.rulesParagraph}><strong>Ansagen:</strong></p>
        <p style={styles.rulesItem}>• <strong>Kontra:</strong> Gegenspieler verdoppeln — +1 Punkt.</p>
        <p style={styles.rulesItem}>• <strong>Keine 30 / Keine 60 / Keine 90 / Schwarz:</strong> Ankündigung, dass die Gegner höchstens 29/59/89/0 Augen machen. +1/+2/+3/+4 Punkte.</p>
        <p style={styles.rulesParagraph}><strong>Sonderpunkte</strong> (beide Teams unabhängig, je +1 Punkt):</p>
        <p style={styles.rulesItem}>• <strong>Fuchs gefangen:</strong> Karo-Ass des Gegners gestochen (max. 2 Füchse im Spiel, verteilt auf beide Teams).</p>
        <p style={styles.rulesItem}>• <strong>Doppelkopf:</strong> Stich mit mind. 40 Augen (zwei Zehner). Mehrmals möglich.</p>
        <p style={styles.rulesItem}>• <strong>Karlchen:</strong> Mit dem Kreuz-Buben den letzten Stich gewonnen. Nur einmal, entweder Spieler oder Gegenspieler.</p>
        <p style={styles.rulesParagraph}><strong>Spielwert</strong> = (Einsatz + Kontra? + Ansage-Punkte) × Bock. Kontra und jede Ansage addieren je 1× Einsatz. Bei Normal: jeder zahlt/kassiert den Spielwert. Bei Solo: alle 3 Gegenspieler zahlen je den Solo-Wert, Solo-Spieler kassiert/zahlt 3×.</p>
        <p style={styles.rulesParagraph}><strong>Bock:</strong> Multipliziert den Spielwert. Bockrunden entstehen z.B. nach einem 0:0-Unentschieden.</p>
      </div>
    </div>
  );
}
