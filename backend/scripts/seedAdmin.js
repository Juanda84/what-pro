// backend/scripts/seedAdmin.js
/* Crea el usuario admin si no existe */
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

(async () => {
  const {
    DB_HOST = "db",
    DB_USER = "whaticket",
    DB_PASS = "supersecretpassword",
    DB_NAME = "whaticket",
    ADMIN_EMAIL = "admin@local.local",
    ADMIN_PASSWORD = "admin123",
    ADMIN_NAME = "Administrador",
  } = process.env;

  const conn = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
  });

  const [rows] = await conn.execute(
    "SELECT id FROM Users WHERE email = ? LIMIT 1",
    [ADMIN_EMAIL]
  );

  if (!rows || rows.length === 0) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const now = new Date();
    await conn.execute(
      "INSERT INTO Users (name, email, passwordHash, profile, createdAt, updatedAt) VALUES (?, ?, ?, 'admin', ?, ?)",
      [ADMIN_NAME, ADMIN_EMAIL, hash, now, now]
    );
    console.log("✔ Admin creado:", ADMIN_EMAIL);
  } else {
    console.log("ℹ Admin ya existe:", ADMIN_EMAIL);
  }

  await conn.end();
})().catch((e) => {
  console.error("Seed admin error:", e);
  process.exit(1);
});
