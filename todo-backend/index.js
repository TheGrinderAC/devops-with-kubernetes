const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

// Setup CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);

  // Log request body for POST requests
  if (req.method === "POST" && req.body) {
    console.log(`[${timestamp}] Request body:`, JSON.stringify(req.body));
  }

  next();
});

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
    console.log(
      `[${new Date().toISOString()}] GET /todos - Retrieved ${
        todos.length
      } todos`
    );
    res.json(todos);
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] GET /todos - Error:`,
      err.message
    );
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// Add a new todo
app.post("/todos", async (req, res) => {
  const { todo } = req.body;
  const timestamp = new Date().toISOString();

  // Validate todo content
  if (!todo) {
    console.log(
      `[${timestamp}] POST /todos - REJECTED: Todo content is missing`
    );
    return res.status(400).json({ error: "Todo content is missing" });
  }

  // Check character limit
  if (todo.length > 140) {
    console.log(
      `[${timestamp}] POST /todos - REJECTED: Todo too long (${todo.length} chars, max 140)`
    );
    return res.status(400).json({
      error: "Todo too long",
      message: `Todo must be 140 characters or less. Current length: ${todo.length}`,
      maxLength: 140,
      currentLength: todo.length,
    });
  }

  try {
    const result = await pool.query(
      "INSERT INTO todos (todo) VALUES ($1) RETURNING id, todo",
      [todo]
    );
    console.log(
      `[${timestamp}] POST /todos - ACCEPTED: Todo added successfully (${todo.length} chars)`
    );
    // Return only the todo text for consistency
    res.status(201).json(result.rows[0].todo);
  } catch (err) {
    console.error(
      `[${timestamp}] POST /todos - ERROR: Database error:`,
      err.message
    );
    res.status(500).json({ error: "Failed to add todo" });
  }
});

// Liveness probe to check if the server is running
app.get("/livez", (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /livez - Liveness probe`);
  res.status(200).json({ status: "ok" });
});

// Readiness probe to check if the database connection is healthy
app.get("/readyz", async (req, res) => {
  const timestamp = new Date().toISOString();
  try {
    // A simple query to check the database connection
    await pool.query("SELECT 1");
    console.log(`[${timestamp}] GET /readyz - Readiness probe successful`);
    res.status(200).json({ status: "ready" });
  } catch (err) {
    console.error(
      `[${timestamp}] GET /readyz - Readiness probe failed:`,
      err.message
    );
    res
      .status(503)
      .json({ status: "error", message: "Database connection failed" });
  }
});

app.listen(port, () => {
  console.log(`Todo backend listening at http://localhost:${port}`);
});
