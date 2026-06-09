import { useState, useEffect } from "react";
import api from "./api";

export default function Admin() {
  const [partidos, setPartidos] = useState([]);
  const [resultados, setResultados] = useState({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState({});

  useEffect(() => {
    cargarPartidos();
  }, []);

  const cargarPartidos = async () => {
    try {
      const { data } = await api.get("/partidos");
      setPartidos(data);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id, campo, valor) => {
    setResultados((prev) => ({
      ...prev,
      [id]: { ...prev[id], [campo]: valor },
    }));
  };

  const registrarResultado = async (id) => {
    const r = resultados[id];
    if (r?.local === undefined || r?.visitante === undefined) {
      alert("Ingresa ambos goles");
      return;
    }
    setGuardando((prev) => ({ ...prev, [id]: true }));
    try {
      await api.put(`/partidos/${id}/resultado`, {
        goles_local: parseInt(r.local),
        goles_visitante: parseInt(r.visitante),
      });
      alert("Resultado registrado y puntos calculados");
      cargarPartidos();
    } catch (e) {
      alert(e.response?.data?.error || "Error al registrar");
    } finally {
      setGuardando((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (loading) return <div style={styles.loading}>Cargando...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>⚙️ Panel Admin</h2>
      <p style={styles.sub}>Registra los resultados de los partidos para calcular puntos automáticamente.</p>
      <div style={styles.grid}>
        {partidos.map((partido) => {
          const fecha = new Date(partido.fecha).toLocaleDateString("es-PE", {
            weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
          });
          return (
            <div key={partido.id} style={{ ...styles.card, ...(partido.finalizado ? styles.cardFinalizado : {}) }}>
              <div style={styles.cardHeader}>
                <span style={styles.estadio}>🏟️ {partido.estadio}</span>
                <span style={partido.finalizado ? styles.badgeFin : styles.badgePend}>
                  {partido.finalizado ? "Finalizado" : "Pendiente"}
                </span>
              </div>
              <div style={styles.fecha}>{fecha}</div>
              <div style={styles.equipos}>
                <div style={styles.equipo}>
                  <span style={styles.flag}>{partido.flag_local}</span>
                  <span style={styles.nombre}>{partido.equipo_local}</span>
                </div>
                <div style={styles.vsBox}>
                  {partido.finalizado ? (
                    <span style={styles.resultadoFinal}>
                      {partido.goles_local} - {partido.goles_visitante}
                    </span>
                  ) : (
                    <span style={styles.vs}>VS</span>
                  )}
                </div>
                <div style={styles.equipo}>
                  <span style={styles.flag}>{partido.flag_visitante}</span>
                  <span style={styles.nombre}>{partido.equipo_visitante}</span>
                </div>
              </div>
              {!partido.finalizado && (
                <div style={styles.form}>
                  <span style={styles.formLabel}>Registrar resultado:</span>
                  <div style={styles.inputs}>
                    <input
                      style={styles.input}
                      type="number"
                      min="0"
                      max="20"
                      placeholder="0"
                      onChange={(e) => handleChange(partido.id, "local", e.target.value)}
                    />
                    <span style={styles.guion}>-</span>
                    <input
                      style={styles.input}
                      type="number"
                      min="0"
                      max="20"
                      placeholder="0"
                      onChange={(e) => handleChange(partido.id, "visitante", e.target.value)}
                    />
                  </div>
                  <button
                    style={styles.btn}
                    onClick={() => registrarResultado(partido.id)}
                    disabled={guardando[partido.id]}
                  >
                    {guardando[partido.id] ? "Guardando..." : "Registrar resultado"}
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
  title: { color: "#f59e0b", fontSize: 22, fontWeight: 700, marginBottom: 8 },
  sub: { color: "#64748b", fontSize: 13, marginBottom: 24 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 },
  card: {
    background: "#1e293b", borderRadius: 12, padding: 20,
    border: "1px solid #334155", display: "flex", flexDirection: "column", gap: 10,
  },
  cardFinalizado: { opacity: 0.7 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  estadio: { color: "#64748b", fontSize: 12 },
  badgePend: {
    background: "#422006", color: "#f59e0b", fontSize: 11,
    fontWeight: 700, padding: "3px 8px", borderRadius: 20,
  },
  badgeFin: {
    background: "#14532d", color: "#22c55e", fontSize: 11,
    fontWeight: 700, padding: "3px 8px", borderRadius: 20,
  },
  fecha: { color: "#94a3b8", fontSize: 12 },
  equipos: { display: "flex", alignItems: "center", justifyContent: "space-between", margin: "8px 0" },
  equipo: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  flag: { fontSize: 28 },
  nombre: { color: "#f1f5f9", fontWeight: 700, fontSize: 14 },
  vsBox: { display: "flex", alignItems: "center" },
  vs: { color: "#475569", fontWeight: 800, fontSize: 16 },
  resultadoFinal: { color: "#22c55e", fontWeight: 800, fontSize: 22 },
  form: { display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid #334155", paddingTop: 12 },
  formLabel: { color: "#94a3b8", fontSize: 12 },
  inputs: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  input: {
    width: 52, padding: "8px", textAlign: "center", borderRadius: 8,
    border: "1px solid #334155", background: "#0f172a", color: "#f1f5f9", fontSize: 18, fontWeight: 700,
  },
  guion: { color: "#f1f5f9", fontWeight: 800, fontSize: 20 },
  btn: {
    padding: "10px", borderRadius: 8, border: "none",
    background: "#dc2626", color: "#fff", fontWeight: 700, cursor: "pointer",
  },
  loading: { color: "#94a3b8", textAlign: "center", marginTop: 40 },
};
