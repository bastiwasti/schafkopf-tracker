import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
          <div style={{
            background: "#fdf6e3",
            padding: 24,
            borderRadius: 12,
            maxWidth: 400,
            width: "80%",
            border: "2px solid #9d0208",
          }}>
            <h3 style={{ color: "#9d0208", marginBottom: 16 }}>⚠️ Fehler aufgetreten</h3>
            <p style={{ fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
              Ein Fehler ist beim Laden der Komponente aufgetreten.
            </p>
            <details style={{ marginBottom: 16, fontSize: 12, background: "#f5f5f5", padding: 12, borderRadius: 4 }}>
              <summary>Fehlerdetails</summary>
              <pre style={{ marginTop: 8, overflow: "auto", maxHeight: 200 }}>
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                background: "#9d0208",
                color: "#fdf6e3",
                border: "none",
                padding: "12px 24px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              Schließen
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}