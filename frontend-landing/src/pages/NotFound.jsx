import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ padding: "64px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: 48, fontWeight: 900, marginTop: 0, color: "#1c8bce" }}>404</h1>
      <p style={{ fontSize: 20, marginBottom: 32 }}>Page introuvable</p>
      <Link 
        to="/" 
        style={{
          display: "inline-block",
          padding: "12px 24px",
          background: "#1c8bce",
          color: "white",
          textDecoration: "none",
          borderRadius: "50px",
          fontWeight: 600
        }}
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
