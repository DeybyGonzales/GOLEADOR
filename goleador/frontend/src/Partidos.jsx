import { useState, useEffect } from "react";
import api from "./api";

export default function Partidos() {
  const [partidos, setPartidos] = useState([]);
  const [pronosticos, setPronosticos] = useState({});
  const [enviado, setEnviado] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPartidos();
    cargarMisPronosticos();
  }, []);

  const cargarPartidos = async () => {
    try {
      const { data } = await api.get("/partidos");
      setPartidos(data);
    } finally {
      setLoading(false);
    }
  };

  const cargarMisPronosticos = async () => {
    try {
      const { data } = await api.get("/pronosticos/mis");
      const map = {};
      data.forEach((p) => {
        map[p.partido_id] = { local: p.goles_local, visitante: p.goles_visitante, pts: p.pts_total };
      });
      setEnviado(map);
    } catch {}
  };

  const handleChange = (partidoId, campo, valor) => {
    setPronosticos((prev) => ({
      ...prev,
      [partidoId]: { ...prev[partidoId], [campo]: valor },
    }));
  };

  const enviarPronostico = async (partidoId) => {
    const p = pronosticos[partidoId];
    if (p?.local === undefined || p?.visitante === undefined) return;
    try {
      await api.post("/pronosticos", {
        partido_id: partidoId,
        goles_local: parseInt(p.local),
        goles_visitante: parseInt(p.visitante),
      });
      setEnviado((prev) => ({ ...prev, [partidoId]: { local: p.local, visitante: p.visitante } }));
      alert("Pronostico guardado");
    } catch (e) {
      alert(e.response?.data?.error || "Error al guardar");
    }
  };

  if (loading) return <div style={styles.loading}>Cargando partidos...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Partidos del Mundial 2026</h2>
      <div style={styles.grid}>
        {partidos.map((partido) => {
          const ya = enviado[partido.id];
          const pred = pronosticos[partido.id];
          const fecha = new Date(partido.fecha).toLocaleDateString("es-PE", {
            weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
          });
          return (
            <div key={partido.id} style={styles.card}>
              <div style={styles.estadio}>{partido.estadio}</div>
              <div style={styles.fecha}>{fecha}</div>
              <div style={styles.equipos}>
                <div style={styles.equipo}>
                  <span style={styles.flag}>{partido.flag_local}</span>
                  <span style={styles.nombre}>{partido.equipo_local}</span>
                </div>
                <div style={styles.vs}>VS</div>
                <div style={styles.equipo}>
                  <span style={styles.flag}>{partido.flag_visitante}</span>
                  <span style={styles.nombre}>{partido.equipo_visitante}</span>
                </div>
              </div>
              {partido.finalizado ? (
                <div style={styles.resultado}>
                  Resultado: {partido.goles_local} - {partido.goles_visitante}
                  {ya && <span style={styles.pts}> {ya.pts} pts</span>}
                </div>
              ) : (
                <div style={styles.prediccion}>
                  <span style={styles.predLabel}>Tu prediccion:</span>
                  <div style={styles.inputs}>
                    <input
                      style={styles.input}
                      type="number"
                      min="0"
                      max="20"
                      placeholder="0"
                      defaultValue={ya?.local}
                      onChange={(e) => handleChange(partido.id, "local", e.target.value)}
                    />
                    <span style={styles.guion}>-</span>
                    <input
                      style={styles.input}
                      type="number"
                      min="0"
                      max="20"
                      placeholder="0"
                      defaultValue={ya?.visitante}
                      onChange={(e) => handleChange(partido.id, "visitante", e.target.value)}
                    />
                  </div>
                  <button
                    style={ya ? styles.btnGuardado : styles.btn}
                    onClick={() => enviarPronostico(partido.id)}
                  >
                    {ya ? "Actualizar" : "Guardar"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "24px" },
  title: { color: "#f59e0b", fontSize: 22, fontWeight: 700, marginBottom: 20 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 },
  card: {
    background: "#1e293b", borderRadius: 12, padding: 20,
    border: "1px solid #334155", display: "flex", flexDirection: "column", gap: 10,
  },
  estadio: { color: "#64748b", fontSize: 12 },
  fecha: { color: "#94a3b8", fontSize: 12 },
  equipos: { display: "flex", alignItems: "center", justifyContent: "space-between", margin: "8px 0" },
  equipo: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  flag: { fontSize: 28 },
  nombre: { color: "#f1f5f9", fontWeight: 700, fontSize: 14 },
  vs: { color: "#475569", fontWeight: 800, fontSize: 16 },
  resultado: { textAlign: "center", color: "#22c55e", fontWeight: 600 },
  pts: { color: "#f59e0b" },
  prediccion: { display: "flex", flexDirection: "column", gap: 8 },
  predLabel: { color: "#94a3b8", fontSize: 12 },
  inputs: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  input: {
    width: 52, padding: "8px", textAlign: "center", borderRadius: 8,
    border: "1px solid #334155", background: "#0f172a", color: "#f1f5f9", fontSize: 18, fontWeight: 700,
  },
  guion: { color: "#f1f5f9", fontWeight: 800, fontSize: 20 },
  btn: {
    padding: "10px", borderRadius: 8, border: "none",
    background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer",
  },
  btnGuardado: {
    padding: "10px", borderRadius: 8, border: "none",
    background: "#15803d", color: "#fff", fontWeight: 700, cursor: "pointer",
  },
  loading: { color: "#94a3b8", textAlign: "center", marginTop: 40 },
};
