import { useState } from "react";
import api from "./api";

export default function Login({ onLogin }) {
  const [modo, setModo] = useState("login");
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const url = modo === "login" ? "/auth/login" : "/auth/register";
      const body = modo === "login"
        ? { email: form.email, password: form.password }
        : form;
      const { data } = await api.post(url, body);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (e) {
      setError(e.response?.data?.error || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>⚽ GOLEADOR</div>
        <div style={styles.subtitle}>Copa Mundial FIFA 2026</div>

        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(modo === "login" ? styles.tabActive : {}) }}
            onClick={() => setModo("login")}
          >Iniciar Sesión</button>
          <button
            style={{ ...styles.tab, ...(modo === "register" ? styles.tabActive : {}) }}
            onClick={() => setModo("register")}
          >Registrarse</button>
        </div>

        {modo === "register" && (
          <input
            style={styles.input}
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
        )}
        <input
          style={styles.input}
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          style={styles.input}
          placeholder="Contraseña"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {error && <div style={styles.error}>{error}</div>}

        <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? "Cargando..." : modo === "login" ? "Entrar" : "Registrarse"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: "#1e293b",
    borderRadius: 16,
    padding: "40px 32px",
    width: 360,
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  logo: {
    fontSize: 32,
    fontWeight: 800,
    color: "#f59e0b",
    textAlign: "center",
    letterSpacing: 2,
  },
  subtitle: {
    color: "#94a3b8",
    textAlign: "center",
    fontSize: 13,
    marginTop: -8,
  },
  tabs: {
    display: "flex",
    background: "#0f172a",
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    padding: "8px 0",
    border: "none",
    borderRadius: 6,
    background: "transparent",
    color: "#64748b",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  tabActive: {
    background: "#2563eb",
    color: "#fff",
  },
  input: {
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#f1f5f9",
    fontSize: 14,
    outline: "none",
  },
  error: {
    color: "#f87171",
    fontSize: 13,
    textAlign: "center",
  },
  btn: {
    padding: "13px",
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 4,
  },
};
