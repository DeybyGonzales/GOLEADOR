import { useState, useEffect } from "react";
import api from "./api";

export default function ProximoPartido() {
  const [partido, setPartido] = useState(null);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    cargarProximo();
  }, []);

  useEffect(() => {
    if (!partido) return;
    const interval = setInterval(() => {
      const diff = new Date(partido.fecha) - new Date();
      if (diff <= 0) {
        setCountdown("En juego!");
        clearInterval(interval);
        return;
      }
      const dias  = Math.floor(diff / 86400000);
      const horas = Math.floor((diff % 86400000) / 3600000);
      const mins  = Math.floor((diff % 3600000) / 60000);
      const segs  = Math.floor((diff % 60000) / 1000);
      setCountdown(`${dias}d ${horas}h ${mins}m ${segs}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [partido]);

  const cargarProximo = async () => {
    try {
      const { data } = await api.get("/partidos");
      const proximo = data.find((p) => !p.finalizado && new Date(p.fecha) > new Date());
      setPartido(proximo || null);
    } catch {}
  };

  if (!partido) return null;

  return (
    <div style={styles.banner}>
      <div style={styles.left}>
        <span style={styles.label}>Proximo partido</span>
        <div style={styles.equipos}>
          <span>{partido.flag_local} {partido.equipo_local}</span>
          <span style={styles.vs}>vs</span>
          <span>{partido.flag_visitante} {partido.equipo_visitante}</span>
        </div>
        <span style={styles.estadio}>{partido.estadio}</span>
      </div>
      <div style={styles.countdown}>{countdown}</div>
    </div>
  );
}

const styles = {
  banner: {
    background: "linear-gradient(90deg, #1e3a5f, #1e293b)",
    border: "1px solid #2563eb",
    borderRadius: 12,
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "16px 24px 0",
    flexWrap: "wrap",
    gap: 12,
  },
  left: { display: "flex", flexDirection: "column", gap: 6 },
  label: { color: "#64748b", fontSize: 11, fontWeight: 600 },
  equipos: { color: "#f1f5f9", fontSize: 18, fontWeight: 700, display: "flex", gap: 12, alignItems: "center" },
  vs: { color: "#475569", fontSize: 14 },
  estadio: { color: "#64748b", fontSize: 12 },
  countdown: {
    color: "#f59e0b",
    fontSize: 28,
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: 1,
  },
};
