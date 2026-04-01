require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || "TodoApp";

const pool = new Pool({
  connectionString: process.env.POSTGRESQL_ADDON_URI,
});

// Initialisation de la table
async function initDB() {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS todos (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL CHECK (title <> ''),
                description TEXT,
                due_date DATE,
                status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    console.log("✅ Table todos prête");
  } catch (err) {
    console.error("❌ Erreur DB:", err);
  }
}
initDB();

// Gestion des clients SSE
let clients = [];

// --- ROUTES ---

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", app: APP_NAME, database: "connected" });
  } catch (e) {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.get("/todos", async (req, res) => {
  const { status } = req.query;
  try {
    const query = status
      ? ["SELECT * FROM todos WHERE status = $1", [status]]
      : ["SELECT * FROM todos ORDER BY created_at DESC", []];
    const result = await pool.query(query[0], query[1]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/todos", async (req, res) => {
  const { title, description, due_date } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });
  try {
    const result = await pool.query(
      "INSERT INTO todos (title, description, due_date) VALUES ($1, $2, $3) RETURNING *",
      [title, description, due_date],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/alerts", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const clientId = Date.now();
  clients.push({ id: clientId, res });

  req.on("close", () => {
    clients = clients.filter((c) => c.id !== clientId);
  });
});

app.post("/todos/:id/notify", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM todos WHERE id = $1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Todo introuvable" });

    const message = `event: todo_alert\ndata: ${JSON.stringify(result.rows[0])}\n\n`;
    clients.forEach((client) => client.res.write(message));

    res.json({ sent: true, listeners: clients.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Serveur sur le port ${PORT}`));
