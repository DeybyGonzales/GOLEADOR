const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const pool    = require("../models/db");

router.post("/register", async (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password)
    return res.status(400).json({ error: "Campos incompletos" });

  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES ($1,$2,$3) RETURNING id, nombre, email",
      [nombre, email, hash]
    );
    const user = rows[0];
    await pool.query("INSERT INTO puntaje_global (usuario_id) VALUES ($1)", [user.id]);
    const token = jwt.sign({ id: user.id, nombre: user.nombre }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user });
  } catch (e) {
    if (e.code === "23505") return res.status(400).json({ error: "Email ya registrado" });
    res.status(500).json({ error: "Error del servidor" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query("SELECT * FROM usuarios WHERE email=$1", [email]);
    if (!rows.length) return res.status(401).json({ error: "Credenciales incorrectas" });
    const user = rows[0];
    const ok   = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Credenciales incorrectas" });
    const token = jwt.sign({ id: user.id, nombre: user.nombre }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email } });
  } catch {
    res.status(500).json({ error: "Error del servidor" });
  }
});

module.exports = router;
