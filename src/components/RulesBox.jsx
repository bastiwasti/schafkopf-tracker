import styles from "./styles.js";

export default function RulesBox() {
  return (
    <div style={styles.rulesBox}>
      <h3 style={styles.rulesTitle}>Schafkopf-Regeln (Kurzfassung)</h3>
      <div style={styles.rulesContent}>
        <p style={styles.rulesParagraph}><strong>Kartenspiel:</strong> Bayerisches Blatt, ohne 7er & 8er (24 Karten). Zu dritt.</p>
        <p style={styles.rulesParagraph}><strong>Trumpfreihenfolge:</strong> Ober (Eichel → Gras → Herz → Schellen), Unter (gleiche Reihenfolge), dann alle Herz.</p>
        <p style={styles.rulesParagraph}><strong>Spielarten:</strong></p>
        <p style={styles.rulesItem}>• <strong>Sauspiel</strong>: Spieler ruft Sau, deren Besitzer wird Partner. 61+ Augen. (×1)</p>
        <p style={styles.rulesItem}>• <strong>Solo</strong>: Allein gegen zwei. Wählt Trumpffarbe. (×4)</p>
        <p style={styles.rulesItem}>• <strong>Wenz</strong>: Nur Unter sind Trumpf. (×4)</p>
        <p style={styles.rulesItem}>• <strong>Geier</strong>: Nur Ober sind Trumpf. (×4)</p>
        <p style={styles.rulesItem}>• <strong>Tout</strong>: Alle Stiche machen. (×8)</p>
        <p style={styles.rulesItem}>• <strong>Sie</strong>: Alle Ober + Unter auf der Hand. (×16)</p>
        <p style={styles.rulesParagraph}><strong>Klopfen:</strong> Vor dem Spiel kann jeder klopfen. Jeder Klopfer verdoppelt den Spielwert.</p>
        <p style={styles.rulesParagraph}><strong>Schneider:</strong> Verlierer &lt;31 Augen → +1. <strong>Schwarz:</strong> 0 Stiche → +2.</p>
        <p style={styles.rulesParagraph}><strong>Laufende:</strong> Ununterbrochene Reihe höchster Trümpfe ab Eichel-Ober.</p>
        <p style={styles.rulesParagraph}><strong>Bock:</strong> Keiner spielt → Bock erhöhen. Multipliziert alles.</p>
        <p style={styles.rulesParagraph}><strong>Spielwert</strong> = Einsatz × Spielart × Aufschläge × Bock × Klopfer. Wird pro Gegner gezahlt/kassiert.</p>
      </div>
    </div>
  );
}
