import { useState, useEffect } from "react";
import Login from "./Login";
import Partidos from "./Partidos";
import Ranking from "./Ranking";
import Salas from "./Salas";

export default function App() {
  const [user, setUser] = useState(null);
  const [pantalla, setPantalla] = useState("partidos");

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.logo}>⚽ GOLEADOR</span>
        <nav style={styles.nav}>
          <button
            style={{ ...styles.navBtn, ...(pantalla === "partidos" ? styles.navActive : {}) }}
            onClick={() => setPantalla("partidos")}
          >Partidos</button>
          <button
            style={{ ...styles.navBtn, ...(pantalla === "ranking" ? styles.navActive : {}) }}
            onClick={() => setPantalla("ranking")}
          >Ranking</button>
          <button
            style={{ ...styles.navBtn, ...(pantalla === "salas" ? styles.navActive : {}) }}
            onClick={() => setPantalla("salas")}
          >Salas</button>
        </nav>
        <div style={styles.userInfo}>
          <span style={styles.userName}>👤 {user.nombre}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Salir</button>
        </div>
      </div>
      <div style={styles.content}>
        {pantalla === "partidos" && <Partidos />}
        {pantalla === "ranking" && <Ranking />}
        {pantalla === "salas" && <Salas />}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#f1f5f9",
  },
  header: {
    background: "#1e293b",
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #334155",
  },
  logo: {
    fontSize: 22,
    fontWeight: 800,
    color: "#f59e0b",
    letterSpacing: 2,
  },
  nav: {
    display: "flex",
    gap: 8,
  },
  navBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    color: "#64748b",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  navActive: {
    background: "#2563eb",
    color: "#fff",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  userName: {
    color: "#94a3b8",
    fontSize: 14,
  },
  logoutBtn: {
    padding: "6px 14px",
    borderRadius: 6,
    border: "1px solid #334155",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: 13,
  },
  content: {
    maxWidth: 1200,
    margin: "0 auto",
  },
};
