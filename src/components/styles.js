const styles = {
  container: {
    fontFamily: "'Playfair Display', 'Georgia', serif",
    maxWidth: 520,
    margin: "0 auto",
    padding: "0 12px 40px",
    background: "linear-gradient(175deg, #fdf6e3 0%, #f5ead0 50%, #ede0c0 100%)",
    minHeight: "100vh",
    color: "#2c1810",
  },
  header: {
    textAlign: "center",
    padding: "28px 0 20px",
    borderBottom: "3px double #8b6914",
    marginBottom: 16,
  },
  title: {
    fontSize: 36, fontWeight: 900, margin: "4px 0", letterSpacing: 3,
    color: "#2c1810", textTransform: "uppercase",
  },
  subtitle: { fontSize: 13, color: "#7a6840", letterSpacing: 2, margin: 0, fontStyle: "italic" },

  spielwertPreview: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "14px 16px",
    marginBottom: 12,
    borderRadius: 10,
    background: "linear-gradient(135deg, #1a3c2a, #2d6a4f)",
    color: "#fff",
    flexWrap: "wrap",
  },
  spielwertLabel: {
    fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", opacity: 0.8,
  },
  spielwertAmount: {
    fontSize: 28, fontWeight: 900, fontFamily: "'Georgia', serif",
  },
  spielwertSub: {
    fontSize: 11, opacity: 0.7, fontStyle: "italic",
  },

  spielwertBadge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 800,
    background: "linear-gradient(135deg, #1a3c2a, #2d6a4f)",
    color: "#fff",
    padding: "3px 10px",
    borderRadius: 10,
    fontFamily: "'Georgia', serif",
  },

  bockBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "10px 16px", marginBottom: 16, borderRadius: 10,
    background: "#fffdf5", border: "2px solid #d4c49a",
  },
  bockBarActive: {
    background: "linear-gradient(135deg, #fff3cd, #ffe0a0)",
    border: "2px solid #d4a017",
    boxShadow: "0 2px 12px rgba(212,160,23,0.25)",
  },
  bockLeft: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  bockLabel: { fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#7a6840" },
  bockValue: { fontSize: 22, fontWeight: 900, color: "#2c1810", fontFamily: "'Georgia', serif" },
  bockHint: { fontSize: 11, color: "#9d6b00", fontWeight: 600, fontStyle: "italic" },
  bockButtons: { display: "flex", gap: 6 },
  bockBtn: {
    width: 36, height: 36, borderRadius: "50%", border: "2px solid #d4c49a",
    background: "#fdf6e3", fontSize: 20, fontWeight: 700, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "inherit", color: "#2c1810",
  },
  bockBtnPlus: { background: "#2c1810", color: "#fdf6e3", borderColor: "#2c1810" },
  bockFormHint: {
    background: "linear-gradient(135deg, #fff3cd, #ffe0a0)",
    border: "1.5px solid #d4a017", borderRadius: 8, padding: "8px 12px",
    fontSize: 13, fontWeight: 700, color: "#7a5a00", marginBottom: 8, textAlign: "center",
  },
  bockBadge: {
    display: "inline-block", fontSize: 10, fontWeight: 700,
    background: "#d4a017", color: "#fff", padding: "2px 8px", borderRadius: 10,
  },
  klopfBadge: {
    display: "inline-block", fontSize: 10, fontWeight: 700,
    background: "#6a3d99", color: "#fff", padding: "2px 8px", borderRadius: 10,
  },
  klopfInfo: {
    fontSize: 13, fontWeight: 800, color: "#6a3d99", alignSelf: "center",
  },
  chipKlopf: { background: "#6a3d99", color: "#fff", borderColor: "#6a3d99" },

  scoreboard: { display: "flex", gap: 10, marginBottom: 20 },
  playerCard: {
    flex: 1, background: "#fffdf5", border: "2px solid #d4c49a", borderRadius: 12,
    padding: "16px 8px 12px", textAlign: "center", position: "relative",
    transition: "all 0.3s", boxShadow: "0 2px 8px rgba(44,24,16,0.08)",
  },
  leaderCard: {
    border: "2px solid #8b6914",
    background: "linear-gradient(145deg, #fffef8, #fdf3d0)",
    boxShadow: "0 4px 16px rgba(139,105,20,0.2)", transform: "translateY(-2px)",
  },
  crownBadge: { position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", fontSize: 22 },
  playerName: { fontSize: 16, fontWeight: 700, marginBottom: 6, letterSpacing: 1 },
  playerBalance: { fontSize: 22, fontWeight: 900, fontFamily: "'Georgia', serif" },
  playerGames: { fontSize: 11, color: "#8a7a5a", marginTop: 4, letterSpacing: 0.5 },

  actions: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 },
  btnPrimary: {
    flex: 1, minWidth: 130, padding: "12px 16px", background: "#2c1810",
    color: "#fdf6e3", border: "none", borderRadius: 8, fontSize: 14,
    fontWeight: 700, cursor: "pointer", letterSpacing: 0.5, fontFamily: "inherit",
  },
  btnSecondary: {
    flex: 1, minWidth: 130, padding: "12px 16px", background: "transparent",
    color: "#2c1810", border: "2px solid #8b6914", borderRadius: 8,
    fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  },
  btnUndo: {
    padding: "12px 16px", background: "transparent", color: "#9d0208",
    border: "2px solid #9d0208", borderRadius: 8, fontSize: 13,
    fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  },

  rulesBox: { background: "#fffdf5", border: "2px solid #d4c49a", borderRadius: 12, padding: 20, marginBottom: 16 },
  rulesTitle: { margin: "0 0 12px", fontSize: 18, fontWeight: 800, color: "#8b6914", borderBottom: "1px solid #d4c49a", paddingBottom: 8 },
  rulesContent: { fontSize: 13, lineHeight: 1.6, color: "#3d2b1f" },
  rulesParagraph: { margin: "8px 0" },
  rulesItem: { margin: "4px 0 4px 8px", fontSize: 12.5 },

  formBox: {
    background: "#fffdf5", border: "2px solid #8b6914", borderRadius: 12,
    padding: 20, marginBottom: 16, boxShadow: "0 4px 20px rgba(44,24,16,0.1)",
  },
  formTitle: { margin: "0 0 16px", fontSize: 18, fontWeight: 800, color: "#8b6914" },
  label: {
    display: "block", fontSize: 12, fontWeight: 700, color: "#7a6840",
    marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 1.5,
  },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" },
  chip: {
    padding: "8px 14px", borderRadius: 20, border: "1.5px solid #d4c49a",
    background: "#fdf6e3", color: "#2c1810", fontSize: 13, fontWeight: 600,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
    fontFamily: "inherit", transition: "all 0.15s",
  },
  chipActive: { background: "#2c1810", color: "#fdf6e3", borderColor: "#2c1810" },
  chipWon: { background: "#2d6a4f", color: "#fff", borderColor: "#2d6a4f" },
  chipLost: { background: "#9d0208", color: "#fff", borderColor: "#9d0208" },
  chipMult: { fontSize: 10, opacity: 0.7 },
  modRow: { display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" },
  checkLabel: { display: "flex", alignItems: "center", gap: 6, cursor: "pointer" },
  checkText: { fontSize: 13, fontWeight: 600 },
  laufendeRow: { display: "flex", alignItems: "center", gap: 8 },
  btnSmall: {
    width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #d4c49a",
    background: "#fdf6e3", fontSize: 16, fontWeight: 700, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit",
  },
  laufendeVal: { fontSize: 16, fontWeight: 800, minWidth: 20, textAlign: "center" },
  btnConfirm: {
    width: "100%", padding: "14px", marginTop: 20, background: "#2d6a4f",
    color: "#fff", border: "none", borderRadius: 8, fontSize: 15,
    fontWeight: 700, cursor: "pointer", letterSpacing: 0.5, fontFamily: "inherit",
  },

  historySection: { marginTop: 8 },
  historyTitle: { fontSize: 16, fontWeight: 800, color: "#8b6914", margin: "0 0 12px", letterSpacing: 1, textTransform: "uppercase" },
  emptyMsg: { color: "#8a7a5a", fontStyle: "italic", textAlign: "center", padding: 20 },
  historyCard: {
    background: "#fffdf5", border: "1.5px solid #d4c49a", borderRadius: 10,
    padding: "12px 14px", marginBottom: 8,
  },
  historyHeader: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" },
  historyRound: { fontSize: 11, color: "#8a7a5a", fontWeight: 700 },
  historyType: { fontSize: 14, fontWeight: 800, flex: 1 },
  historyResult: { fontSize: 11, fontWeight: 700, color: "#fff", padding: "3px 10px", borderRadius: 12 },
  historyDetail: { fontSize: 13, marginBottom: 6 },
  badge: {
    display: "inline-block", fontSize: 10, fontWeight: 700,
    background: "#8b6914", color: "#fff", padding: "2px 8px", borderRadius: 10, marginLeft: 6,
  },
  historyChanges: { display: "flex", gap: 12, fontSize: 13, fontWeight: 700, fontFamily: "'Georgia', serif" },
  changeItem: {},

  // Session list styles
  sessionList: { display: "flex", flexDirection: "column", gap: 10, marginTop: 8 },
  sessionCard: {
    background: "#fffdf5", border: "1.5px solid #d4c49a", borderRadius: 12,
    padding: "16px 18px", cursor: "pointer", display: "flex",
    justifyContent: "space-between", alignItems: "center",
    boxShadow: "0 2px 8px rgba(44,24,16,0.06)", transition: "all 0.15s",
  },
  sessionCardLeft: { display: "flex", flexDirection: "column", gap: 4 },
  sessionName: { fontSize: 17, fontWeight: 800, color: "#2c1810" },
  sessionMeta: { fontSize: 12, color: "#7a6840", fontStyle: "italic" },
  sessionDelete: {
    background: "transparent", border: "1.5px solid #d4c49a", borderRadius: 8,
    padding: "6px 10px", fontSize: 13, cursor: "pointer", color: "#9d0208",
    fontFamily: "inherit",
  },
  newSessionForm: {
    background: "#fffdf5", border: "2px solid #8b6914", borderRadius: 12,
    padding: 20, marginBottom: 16, boxShadow: "0 4px 20px rgba(44,24,16,0.1)",
  },
  input: {
    width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d4c49a",
    background: "#fdf6e3", fontSize: 14, fontFamily: "'Playfair Display', 'Georgia', serif",
    color: "#2c1810", boxSizing: "border-box",
  },
  playerTag: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "6px 12px", borderRadius: 20, background: "#2c1810",
    color: "#fdf6e3", fontSize: 13, fontWeight: 600,
  },
  playerTagRemove: {
    background: "none", border: "none", color: "#fdf6e3", cursor: "pointer",
    fontSize: 15, lineHeight: 1, padding: 0,
  },
  // Avatar picker
  avatarPickerOverlay: {
    position: "fixed", inset: 0, background: "rgba(44,24,16,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
  },
  avatarPickerCard: {
    background: "#fdf6e3", border: "2px solid #8b6914", borderRadius: 16,
    padding: 20, width: "calc(100% - 32px)", maxWidth: 400,
    boxShadow: "0 8px 32px rgba(44,24,16,0.25)",
  },
  avatarPickerHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14,
  },
  avatarPickerTitle: { fontSize: 15, fontWeight: 800, color: "#8b6914" },
  avatarGrid: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 },
  avatarBtn: {
    fontSize: 26, background: "#fffdf5", border: "1.5px solid #d4c49a",
    borderRadius: 10, padding: "8px 4px", cursor: "pointer", aspectRatio: "1",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.12s",
  },
  avatarBtnActive: {
    border: "2.5px solid #2c1810", background: "#f5ead0", transform: "scale(1.12)",
  },

  // Player manager
  playerManagerList: { display: "flex", flexDirection: "column", gap: 8, marginTop: 8 },
  playerManagerRow: {
    background: "#fffdf5", border: "1.5px solid #d4c49a", borderRadius: 12,
    padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
  },
  playerManagerAvatar: { fontSize: 32, lineHeight: 1, flexShrink: 0 },
  playerManagerInfo: { flex: 1, display: "flex", flexDirection: "column", gap: 2 },
  playerManagerName: { fontSize: 16, fontWeight: 700 },
  playerManagerMeta: { fontSize: 11, color: "#7a6840", fontStyle: "italic" },
  playerManagerActions: { display: "flex", gap: 6 },
  playerManagerBtn: {
    background: "transparent", border: "1.5px solid #d4c49a", borderRadius: 8,
    padding: "6px 10px", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
  },
  playerManagerBtnDelete: {
    background: "transparent", border: "1.5px solid #d4c49a", borderRadius: 8,
    padding: "6px 10px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "#9d0208",
  },

  // Player chips (session creation)
  playerChipRow: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  playerChip: {
    padding: "8px 14px", borderRadius: 20, border: "1.5px solid #d4c49a",
    background: "#fdf6e3", color: "#2c1810", fontSize: 13, fontWeight: 600,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
    fontFamily: "inherit", transition: "all 0.15s",
  },
  playerChipActive: { background: "#2c1810", color: "#fdf6e3", borderColor: "#2c1810" },
  playerChipNew: {
    padding: "8px 14px", borderRadius: 20, border: "1.5px dashed #8b6914",
    background: "transparent", color: "#8b6914", fontSize: 13, fontWeight: 600,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
    fontFamily: "inherit",
  },

  // Scoreboard avatar
  playerCardAvatar: { fontSize: 26, marginBottom: 4, lineHeight: 1 },

  // HistoryCard action buttons
  historyActions: { display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end" },
  btnEdit: {
    background: "transparent", border: "1.5px solid #8b6914", borderRadius: 6,
    padding: "4px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
    color: "#8b6914", fontWeight: 600,
  },
  btnArchiveGame: {
    background: "transparent", border: "1.5px solid #d4c49a", borderRadius: 6,
    padding: "4px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
    color: "#7a6840", fontWeight: 600,
  },

  // Archive view
  archiveSection: {
    fontSize: 13, fontWeight: 800, color: "#8b6914", letterSpacing: 1,
    textTransform: "uppercase", margin: "20px 0 10px", borderBottom: "1px solid #d4c49a",
    paddingBottom: 6,
  },
  archiveCard: {
    background: "#fffdf5", border: "1.5px solid #d4c49a", borderRadius: 12,
    padding: "14px 16px", marginBottom: 8, opacity: 0.85,
  },
  archiveCardTitle: { fontSize: 15, fontWeight: 800, color: "#2c1810", marginBottom: 4 },
  archiveCardMeta: { fontSize: 12, color: "#7a6840", fontStyle: "italic", marginBottom: 10 },
  archiveCardActions: { display: "flex", gap: 8 },
  btnRestore: {
    flex: 1, padding: "8px 12px", background: "transparent", color: "#2d6a4f",
    border: "1.5px solid #2d6a4f", borderRadius: 8, fontSize: 13,
    fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  },
  btnDanger: {
    flex: 1, padding: "8px 12px", background: "transparent", color: "#9d0208",
    border: "1.5px solid #9d0208", borderRadius: 8, fontSize: 13,
    fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  },
  archiveGroupHeader: {
    fontSize: 13, fontWeight: 700, color: "#2c1810", margin: "12px 0 6px",
    padding: "4px 0", borderBottom: "1px dotted #d4c49a",
  },

  // Commentary overlay
  commentaryOverlay: {
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(28, 14, 8, 0.82)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16,
    backdropFilter: "blur(4px)",
  },
  commentaryCard: {
    background: "linear-gradient(160deg, #fdf6e3 0%, #f5ead0 100%)",
    border: "3px double #8b6914", borderRadius: 20,
    padding: "28px 24px 20px", width: "100%", maxWidth: 460,
    boxShadow: "0 12px 48px rgba(44,24,16,0.5)",
    display: "flex", flexDirection: "column", gap: 16,
  },
  commentarySpeaker: {
    display: "flex", alignItems: "center", gap: 14,
  },
  commentarySpeakerAvatar: {
    fontSize: 52, lineHeight: 1, flexShrink: 0,
    filter: "drop-shadow(0 2px 6px rgba(44,24,16,0.3))",
  },
  commentarySpeakerInfo: {
    display: "flex", flexDirection: "column", gap: 2,
  },
  commentarySpeakerName: {
    fontSize: 13, fontWeight: 800, color: "#8b6914",
    letterSpacing: 1.5, textTransform: "uppercase",
  },
  commentarySpeakerLabel: {
    fontSize: 11, color: "#7a6840", fontStyle: "italic",
  },
  commentaryBubble: {
    background: "#fffdf5", border: "1.5px solid #d4c49a", borderRadius: 14,
    padding: "16px 18px", fontSize: 16, lineHeight: 1.6,
    fontStyle: "italic", color: "#2c1810", minHeight: 80,
    fontFamily: "'Playfair Display', 'Georgia', serif",
    position: "relative",
  },
  commentaryBubbleCaret: {
    position: "absolute", top: -10, left: 28,
    width: 0, height: 0,
    borderLeft: "10px solid transparent",
    borderRight: "10px solid transparent",
    borderBottom: "10px solid #d4c49a",
  },
  commentaryActions: {
    display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center",
  },
  btnSkip: {
    background: "transparent", border: "1.5px solid #d4c49a", borderRadius: 8,
    padding: "8px 14px", fontSize: 13, cursor: "pointer",
    fontFamily: "inherit", color: "#7a6840", fontWeight: 600,
  },
  btnCloseOverlay: {
    background: "#2c1810", border: "none", borderRadius: 8,
    padding: "8px 18px", fontSize: 13, cursor: "pointer",
    fontFamily: "inherit", color: "#fdf6e3", fontWeight: 700,
  },
  commentaryPhaseIndicator: {
    display: "flex", gap: 6, justifyContent: "center",
  },
  commentaryPhaseDot: {
    width: 8, height: 8, borderRadius: "50%", background: "#d4c49a",
  },
  commentaryPhaseDotActive: {
    background: "#8b6914",
  },

  // Commentator settings panel
  commentatorSettingsPanel: {
    background: "#fffdf5", border: "1.5px solid #d4c49a", borderRadius: 12,
    padding: "14px 16px", marginBottom: 12,
  },
  commentatorSettingsTitle: {
    fontSize: 11, fontWeight: 800, color: "#8b6914", letterSpacing: 1.5,
    textTransform: "uppercase", marginBottom: 10,
  },
  personalityChipRow: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  personalityChip: {
    padding: "6px 12px", borderRadius: 16, border: "1.5px solid #d4c49a",
    background: "#fdf6e3", color: "#2c1810", fontSize: 12, fontWeight: 600,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
    fontFamily: "inherit",
  },
  personalityChipActive: { background: "#2c1810", color: "#fdf6e3", borderColor: "#2c1810" },
  voiceSelect: {
    width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #d4c49a",
    background: "#fdf6e3", fontSize: 13, fontFamily: "inherit", color: "#2c1810",
    marginBottom: 10,
  },
  commentatorToggleRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    fontSize: 12, color: "#7a6840",
  },
  btnGear: {
    background: "transparent", border: "1.5px solid #d4c49a", borderRadius: 8,
    padding: "7px 10px", fontSize: 15, cursor: "pointer", color: "#8b6914",
    fontFamily: "inherit",
  },

  sessionHeader: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "16px 0 14px", borderBottom: "3px double #8b6914", marginBottom: 16,
  },
  backBtn: {
    background: "transparent", border: "1.5px solid #8b6914", borderRadius: 8,
    padding: "7px 13px", fontSize: 13, cursor: "pointer", color: "#8b6914",
    fontFamily: "inherit", fontWeight: 700,
  },
  sessionTitle: { fontSize: 20, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", flex: 1 },
  sessionSubtitle: { fontSize: 12, color: "#7a6840", letterSpacing: 1, fontStyle: "italic" },
};

export default styles;
