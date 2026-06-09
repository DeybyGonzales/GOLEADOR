const router = require("express").Router();
const pool   = require("../models/db");
const auth   = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM partidos ORDER BY fecha ASC");
  res.json(rows);
});

router.get("/:id", auth, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM partidos WHERE id=$1", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Partido no encontrado" });
  res.json(rows[0]);
});

router.post("/", auth, async (req, res) => {
  const { equipo_local, equipo_visitante, flag_local, flag_visitante, fecha, estadio } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO partidos (equipo_local, equipo_visitante, flag_local, flag_visitante, fecha, estadio)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [equipo_local, equipo_visitante, flag_local, flag_visitante, fecha, estadio]
  );
  res.status(201).json(rows[0]);
});

router.put("/:id/resultado", auth, async (req, res) => {
  const { goles_local, goles_visitante } = req.body;
  const partidoId = req.params.id;

  try {
    await pool.query(
      "UPDATE partidos SET goles_local=$1, goles_visitante=$2, finalizado=true WHERE id=$3",
      [goles_local, goles_visitante, partidoId]
    );

    const { rows: pronosticos } = await pool.query(
      "SELECT * FROM pronosticos WHERE partido_id=$1 AND calculado=false",
      [partidoId]
    );

    for (const p of pronosticos) {
      let pts = 0;
      let exacto = 0, ganador = 0, diferencia = 0, temprano = 0;

      if (p.goles_local === goles_local && p.goles_visitante === goles_visitante) {
        exacto = 5; pts += 5;
      } else {
        const ganadorReal = goles_local > goles_visitante ? "L" : goles_local < goles_visitante ? "V" : "E";
        const ganadorPred = p.goles_local > p.goles_visitante ? "L" : p.goles_local < p.goles_visitante ? "V" : "E";
        if (ganadorReal === ganadorPred) { ganador = 3; pts += 3; }
        const diffReal = goles_local - goles_visitante;
        const diffPred = p.goles_local - p.goles_visitante;
        if (diffReal === diffPred && ganadorReal === ganadorPred) { diferencia = 2; pts += 2; }
      }

      const { rows: partido } = await pool.query("SELECT fecha FROM partidos WHERE id=$1", [partidoId]);
      const horasAntes = (new Date(partido[0].fecha) - new Date(p.registrado_en)) / 36e5;
      if (horasAntes > 24) { temprano = 1; pts += 1; }

      await pool.query(
        `UPDATE pronosticos SET pts_exacto=$1, pts_ganador=$2, pts_diferencia=$3,
         pts_temprano=$4, pts_total=$5, calculado=true WHERE id=$6`,
        [exacto, ganador, diferencia, temprano, pts, p.id]
      );

      await pool.query(
        `UPDATE puntaje_global SET
          puntos_total = puntos_total + $1,
          exactos = exactos + $2,
          ganadores = ganadores + $3,
          actualizado_en = NOW()
         WHERE usuario_id = $4`,
        [pts, exacto > 0 ? 1 : 0, ganador > 0 || exacto > 0 ? 1 : 0, p.usuario_id]
      );
    }

    res.json({ message: "Resultado registrado y puntos calculados", partido_id: partidoId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error calculando puntos" });
  }
});

module.exports = router;
