const router = require("express").Router();
const pool   = require("../models/db");
const auth   = require("../middleware/auth");

router.get("/global", auth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.nombre, pg.puntos_total, pg.exactos, pg.ganadores,
            pg.racha_actual, pg.racha_maxima,
            RANK() OVER (ORDER BY pg.puntos_total DESC) AS posicion
     FROM puntaje_global pg
     JOIN usuarios u ON u.id = pg.usuario_id
     ORDER BY pg.puntos_total DESC
     LIMIT 50`
  );
  res.json(rows);
});

router.get("/sala/:id", auth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.nombre, ps.puntos_total,
            RANK() OVER (ORDER BY ps.puntos_total DESC) AS posicion
     FROM puntaje_sala ps
     JOIN usuarios u ON u.id = ps.usuario_id
     WHERE ps.sala_id = $1
     ORDER BY ps.puntos_total DESC`,
    [req.params.id]
  );
  res.json(rows);
});

router.get("/me", auth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT puntos_total, exactos, ganadores, racha_actual, racha_maxima,
            (SELECT COUNT(*)+1 FROM puntaje_global WHERE puntos_total > pg.puntos_total) AS posicion,
            (SELECT COUNT(*) FROM puntaje_global) AS total_jugadores
     FROM puntaje_global pg
     WHERE usuario_id = $1`,
    [req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: "No encontrado" });
  res.json(rows[0]);
});

module.exports = router;
