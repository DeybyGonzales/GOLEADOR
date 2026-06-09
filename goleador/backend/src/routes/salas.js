const router = require("express").Router();
const pool   = require("../models/db");
const auth   = require("../middleware/auth");

function generarCodigo() {
  return Math.random().toString(36).substring(2, 9).toUpperCase();
}

router.post("/", auth, async (req, res) => {
  const { nombre } = req.body;
  const admin_id   = req.user.id;
  const codigo     = generarCodigo();

  try {
    const { rows } = await pool.query(
      "INSERT INTO salas (nombre, codigo, admin_id) VALUES ($1,$2,$3) RETURNING *",
      [nombre, codigo, admin_id]
    );
    const sala = rows[0];
    await pool.query("INSERT INTO sala_miembros (sala_id, usuario_id) VALUES ($1,$2)", [sala.id, admin_id]);
    await pool.query("INSERT INTO puntaje_sala (sala_id, usuario_id) VALUES ($1,$2)", [sala.id, admin_id]);
    res.status(201).json(sala);
  } catch {
    res.status(500).json({ error: "Error al crear sala" });
  }
});

router.post("/unirse", auth, async (req, res) => {
  const { codigo } = req.body;
  const usuario_id = req.user.id;

  try {
    const { rows } = await pool.query("SELECT * FROM salas WHERE codigo=$1", [codigo]);
    if (!rows.length) return res.status(404).json({ error: "Código inválido" });
    const sala = rows[0];
    await pool.query(
      "INSERT INTO sala_miembros (sala_id, usuario_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
      [sala.id, usuario_id]
    );
    await pool.query(
      "INSERT INTO puntaje_sala (sala_id, usuario_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
      [sala.id, usuario_id]
    );
    res.json({ message: "¡Te uniste a la sala!", sala });
  } catch {
    res.status(500).json({ error: "Error al unirse a la sala" });
  }
});

router.get("/mis", auth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT s.*, COUNT(sm.usuario_id) AS miembros
     FROM salas s
     JOIN sala_miembros sm ON sm.sala_id = s.id
     WHERE sm.usuario_id = $1
     GROUP BY s.id
     ORDER BY s.creado_en DESC`,
    [req.user.id]
  );
  res.json(rows);
});

router.get("/:id", auth, async (req, res) => {
  const salaId = req.params.id;
  const { rows: sala } = await pool.query("SELECT * FROM salas WHERE id=$1", [salaId]);
  if (!sala.length) return res.status(404).json({ error: "Sala no encontrada" });

  const { rows: miembros } = await pool.query(
    `SELECT u.id, u.nombre, u.email, ps.puntos_total
     FROM sala_miembros sm
     JOIN usuarios u ON u.id = sm.usuario_id
     JOIN puntaje_sala ps ON ps.sala_id = sm.sala_id AND ps.usuario_id = sm.usuario_id
     WHERE sm.sala_id = $1
     ORDER BY ps.puntos_total DESC`,
    [salaId]
  );
  res.json({ ...sala[0], miembros });
});

module.exports = router;
