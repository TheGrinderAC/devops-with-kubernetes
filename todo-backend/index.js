const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

// Setup CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Setup PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || "postgres",
});

// Ensure the todos table exists
const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      todo TEXT NOT NULL
    );
  `);
};

initDb().catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});

// Get all todos
app.get("/todos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, todo FROM todos ORDER BY id ASC"
    );
    // Return only the todo text as an array of strings for frontend compatibility
    const todos = result.rows.map((row) => row.todo);
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// Add a new todo
app.post("/todos", async (req, res) => {
  const { todo } = req.body;
  if (!todo) {
    return res.status(400).json({ error: "Todo content is missing" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO todos (todo) VALUES ($1) RETURNING id, todo",
      [todo]
    );
    // Return only the todo text for consistency
    res.status(201).json(result.rows[0].todo);
  } catch (err) {
    res.status(500).json({ error: "Failed to add todo" });
  }
});

app.listen(port, () => {
  console.log(`Todo backend listening at http://localhost:${port}`);
});
