import { useState, useEffect } from "react";
import api from "./api";

export default function Salas() {
  const [salas, setSalas] = useState([]);
  const [salaDetalle, setSalaDetalle] = useState(null);
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("mis");

  useEffect(() => {
    cargarSalas();
  }, []);

  const cargarSalas = async () => {
    try {
      const { data } = await api.get("/salas/mis");
      setSalas(data);
    } finally {
      setLoading(false);
    }
  };

  const crearSala = async () => {
    if (!nombre.trim()) return;
    try {
      await api.post("/salas", { nombre });
      setNombre("");
      cargarSalas();
      alert("Sala creada!");
    } catch (e) {
      alert(e.response?.data?.error || "Error al crear sala");
    }
  };

  const unirse = async () => {
    if (!codigo.trim()) return;
    try {
      await api.post("/salas/unirse", { codigo });
      setCodigo("");
      cargarSalas();
      alert("Te uniste a la sala!");
    } catch (e) {
      alert(e.response?.data?.error || "Error al unirse");
    }
  };

  const verDetalle = async (id) => {
    try {
      const { data } = await api.get(`/salas/${id}`);
      setSalaDetalle(data);
    } catch {}
  };

  if (salaDetalle) {
    return (
      <div style={styles.container}>
        <button style={styles.back} onClick={() => setSalaDetalle(null)}>← Volver</button>
        <h2 style={styles.title}>{salaDetalle.nombre}</h2>
        <div style={styles.codigoBox}>
          Código de invitación: <span style={styles.codigo}>{salaDetalle.codigo}</span>
        </div>
        <div style={styles.tabla}>
          <div style={styles.tablaHeader}>
            <span style={styles.col1}>#</span>
            <span style={styles.col2}>Jugador</span>
            <span style={styles.col3}>Pts</span>
          </div>
          {salaDetalle.miembros.map((m, i) => (
            <div key={m.id} style={styles.fila}>
              <span style={styles.col1}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
              </span>
              <span style={styles.col2}>{m.nombre}</span>
              <span style={{ ...styles.col3, color: "#f59e0b", fontWeight: 700 }}>{m.puntos_total}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏠 Salas</h2>

      <div style={styles.acciones}>
        <div style={styles.accionCard}>
          <h3 style={styles.accionTitle}>Crear sala</h3>
          <input
            style={styles.input}
            placeholder="Nombre de la sala"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <button style={styles.btn} onClick={crearSala}>Crear</button>
        </div>
        <div style={styles.accionCard}>
          <h3 style={styles.accionTitle}>Unirse con código</h3>
          <input
            style={styles.input}
            placeholder="Código de sala"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          />
          <button style={styles.btn} onClick={unirse}>Unirse</button>
        </div>
      </div>

      <h3 style={styles.subtitle}>Mis salas</h3>
      {loading ? (
        <div style={styles.loading}>Cargando...</div>
      ) : salas.length === 0 ? (
        <div style={styles.vacio}>No estás en ninguna sala aún</div>
      ) : (
        <div style={styles.grid}>
          {salas.map((sala) => (
            <div key={sala.id} style={styles.card} onClick={() => verDetalle(sala.id)}>
              <div style={styles.salaNombre}>{sala.nombre}</div>
              <div style={styles.salaCodigo}>Código: {sala.codigo}</div>
              <div style={styles.salaMiembros}>👥 {sala.miembros} miembros</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "24px" },
  title: { color: "#f59e0b", fontSize: 22, fontWeight: 700, marginBottom: 20 },
  subtitle: { color: "#94a3b8", fontSize: 16, fontWeight: 600, margin: "24px 0 12px" },
  acciones: { display: "flex", gap: 16, flexWrap: "wrap" },
  accionCard: {
    background: "#1e293b", borderRadius: 12, padding: 20,
    border: "1px solid #334155", display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 240,
  },
  accionTitle: { color: "#f1f5f9", fontSize: 15, fontWeight: 700, margin: 0 },
  input: {
    padding: "10px 14px", borderRadius: 8, border: "1px solid #334155",
    background: "#0f172a", color: "#f1f5f9", fontSize: 14, outline: "none",
  },
  btn: {
    padding: "10px", borderRadius: 8, border: "none",
    background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 },
  card: {
    background: "#1e293b", borderRadius: 12, padding: 20,
    border: "1px solid #334155", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8,
  },
  salaNombre: { color: "#f1f5f9", fontWeight: 700, fontSize: 16 },
  salaCodigo: { color: "#2563eb", fontSize: 13, fontWeight: 600 },
  salaMiembros: { color: "#64748b", fontSize: 13 },
  back: {
    background: "transparent", border: "none", color: "#64748b",
    cursor: "pointer", fontSize: 14, marginBottom: 16, padding: 0,
  },
  codigoBox: {
    background: "#0f172a", borderRadius: 8, padding: "12px 16px",
    color: "#94a3b8", fontSize: 14, marginBottom: 20,
  },
  codigo: { color: "#f59e0b", fontWeight: 800, fontSize: 18, marginLeft: 8 },
  tabla: { background: "#1e293b", borderRadius: 12, border: "1px solid #334155", overflow: "hidden" },
  tablaHeader: {
    display: "flex", padding: "12px 20px", background: "#0f172a",
    color: "#64748b", fontSize: 12, fontWeight: 600, borderBottom: "1px solid #334155",
  },
  fila: {
    display: "flex", padding: "14px 20px", borderBottom: "1px solid #1e293b",
    color: "#f1f5f9", fontSize: 14, alignItems: "center",
  },
  col1: { width: 40 },
  col2: { flex: 1 },
  col3: { width: 80, textAlign: "center" },
  loading: { color: "#94a3b8", textAlign: "center", marginTop: 40 },
  vacio: { color: "#64748b", textAlign: "center", marginTop: 24 },
};
