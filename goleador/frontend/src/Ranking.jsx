import { useState, useEffect } from "react";
import api from "./api";

export default function Ranking() {
  const [global, setGlobal] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarRanking();
    cargarMiPosicion();
  }, []);

  const cargarRanking = async () => {
    try {
      const { data } = await api.get("/ranking/global");
      setGlobal(data);
    } finally {
      setLoading(false);
    }
  };

  const cargarMiPosicion = async () => {
    try {
      const { data } = await api.get("/ranking/me");
      setMe(data);
    } catch {}
  };

  if (loading) return <div style={styles.loading}>Cargando ranking...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏆 Ranking Global</h2>

      {me && (
        <div style={styles.miCard}>
          <span style={styles.miLabel}>Tu posición</span>
          <div style={styles.miStats}>
            <div style={styles.stat}>
              <span style={styles.statNum}>#{me.posicion}</span>
              <span style={styles.statLabel}>Posición</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNum}>{me.puntos_total}</span>
              <span style={styles.statLabel}>Puntos</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNum}>{me.exactos}</span>
              <span style={styles.statLabel}>Exactos</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNum}>{me.total_jugadores}</span>
              <span style={styles.statLabel}>Jugadores</span>
            </div>
          </div>
        </div>
      )}

      <div style={styles.tabla}>
        <div style={styles.tablaHeader}>
          <span style={styles.col1}>#</span>
          <span style={styles.col2}>Jugador</span>
          <span style={styles.col3}>Pts</span>
          <span style={styles.col3}>Exactos</span>
        </div>
        {global.map((u, i) => (
          <div key={u.id} style={{ ...styles.fila, ...(i === 0 ? styles.primero : i === 1 ? styles.segundo : i === 2 ? styles.tercero : {}) }}>
            <span style={styles.col1}>
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${u.posicion}`}
            </span>
            <span style={styles.col2}>{u.nombre}</span>
            <span style={{ ...styles.col3, color: "#f59e0b", fontWeight: 700 }}>{u.puntos_total}</span>
            <span style={styles.col3}>{u.exactos}</span>
          </div>
        ))}
        {global.length === 0 && (
          <div style={styles.vacio}>Aún no hay puntuaciones</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "24px" },
  title: { color: "#f59e0b", fontSize: 22, fontWeight: 700, marginBottom: 20 },
  loading: { color: "#94a3b8", textAlign: "center", marginTop: 40 },
  miCard: {
    background: "#1e3a5f",
    border: "1px solid #2563eb",
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 24,
  },
  miLabel: { color: "#94a3b8", fontSize: 12, marginBottom: 12, display: "block" },
  miStats: { display: "flex", gap: 32 },
  stat: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  statNum: { color: "#f1f5f9", fontSize: 24, fontWeight: 800 },
  statLabel: { color: "#64748b", fontSize: 11 },
  tabla: {
    background: "#1e293b",
    borderRadius: 12,
    border: "1px solid #334155",
    overflow: "hidden",
  },
  tablaHeader: {
    display: "flex",
    padding: "12px 20px",
    background: "#0f172a",
    color: "#64748b",
    fontSize: 12,
    fontWeight: 600,
    borderBottom: "1px solid #334155",
  },
  fila: {
    display: "flex",
    padding: "14px 20px",
    borderBottom: "1px solid #1e293b",
    color: "#f1f5f9",
    fontSize: 14,
    alignItems: "center",
  },
  primero: { background: "#422006" },
  segundo: { background: "#1c1917" },
  tercero: { background: "#1c1917" },
  col1: { width: 40 },
  col2: { flex: 1 },
  col3: { width: 80, textAlign: "center" },
  vacio: { padding: 24, textAlign: "center", color: "#64748b" },
};
