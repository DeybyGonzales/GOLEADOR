const express = require("express");
const cors    = require("cors");

const authRoutes        = require("./routes/auth");
const partidosRoutes    = require("./routes/partidos");
const pronosticosRoutes = require("./routes/pronosticos");
const salasRoutes       = require("./routes/salas");
const rankingRoutes     = require("./routes/ranking");

const app  = express();
const PORT = process.env.PORT || 3000;
const INSTANCE = process.env.INSTANCE_ID || "?";

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    instance: INSTANCE,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth",        authRoutes);
app.use("/api/partidos",    partidosRoutes);
app.use("/api/pronosticos", pronosticosRoutes);
app.use("/api/salas",       salasRoutes);
app.use("/api/ranking",     rankingRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.listen(PORT, () => {
  console.log(`🚀 GOLEADOR API - Instancia ${INSTANCE} corriendo en puerto ${PORT}`);
});
