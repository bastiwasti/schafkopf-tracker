
export default function GifPlayer({ gifUrl, onClose }) {
  if (!gifUrl) return null;

  return (
    <div 
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 12,
        marginBottom: 8,
      }}
    >
      <img
        src={gifUrl}
        alt="Reaction GIF"
        style={{
          maxWidth: "300px",
          maxHeight: "200px",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
        }}
        autoPlay
        loop
      />
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "rgba(0, 0, 0, 0.6)",
          color: "#fff",
          padding: "4px 8px",
          borderRadius: 4,
          fontSize: 10,
          cursor: "pointer",
          opacity: 0.7,
          ":hover": { opacity: 1 },
        }}
        title="Klicken zum Schließen"
      >
        ✕
      </div>
    </div>
  );
}
