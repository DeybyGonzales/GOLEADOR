const { Pool } = require("pg");

const pool = new Pool({
  host:     process.env.DB_HOST || "localhost",
  port:     process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "goleador",
  user:     process.env.DB_USER || "goleador_user",
  password: process.env.DB_PASS || "goleador_pass",
});

pool.on("connect", () => {
  console.log(`📦 DB conectada (Instancia ${process.env.INSTANCE_ID})`);
});

module.exports = pool;
