const router = require("express").Router();
const pool   = require("../models/db");
const auth   = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  const { partido_id, goles_local, goles_visitante } = req.body;
  const usuario_id = req.user.id;

  try {
    const { rows: partido } = await pool.query(
      "SELECT * FROM partidos WHERE id=$1", [partido_id]
    );
    if (!partido.length) return res.status(404).json({ error: "Partido no encontrado" });
    if (partido[0].finalizado) return res.status(400).json({ error: "El partido ya finalizó" });

    const minutosRestantes = (new Date(partido[0].fecha) - new Date()) / 60000;
    if (minutosRestantes < 10) return res.status(400).json({ error: "Tiempo de predicción cerrado" });

    const { rows } = await pool.query(
      `INSERT INTO pronosticos (usuario_id, partido_id, goles_local, goles_visitante)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (usuario_id, partido_id)
       DO UPDATE SET goles_local=$3, goles_visitante=$4, registrado_en=NOW()
       RETURNING *`,
      [usuario_id, partido_id, goles_local, goles_visitante]
    );

    const horasRestantes = minutosRestantes / 60;
    res.status(201).json({
      ...rows[0],
      bono_temprano: horasRestantes > 24,
      horas_restantes: Math.round(horasRestantes),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al guardar pronóstico" });
  }
});

router.get("/mis", auth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT p.*, pa.equipo_local, pa.equipo_visitante, pa.flag_local, pa.flag_visitante,
            pa.fecha, pa.goles_local AS res_local, pa.goles_visitante AS res_visitante
     FROM pronosticos p
     JOIN partidos pa ON pa.id = p.partido_id
     WHERE p.usuario_id = $1
     ORDER BY pa.fecha DESC`,
    [req.user.id]
  );
  res.json(rows);
});

router.get("/partido/:id", auth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT pr.*, u.nombre, u.email
     FROM pronosticos pr
     JOIN usuarios u ON u.id = pr.usuario_id
     WHERE pr.partido_id = $1`,
    [req.params.id]
  );
  res.json(rows);
});

module.exports = router;
