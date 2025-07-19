const express = require("express");
const { Client } = require("pg");

const app = express();

const client = new Client({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: "postgres",
});
//postgresql://postgres:postgres@postgres-service:5432/postgres

let dbReady = false;

// Initialize database connection and table
async function initializeDatabase() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    // Create table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS pongs (
        id SERIAL PRIMARY KEY,
        count INTEGER
      );
    `);

    dbReady = true;
  } catch (err) {
    console.error("Failed to connect to PostgreSQL:", err);
    dbReady = false;
    process.exit(1);
  }
}

// /healthz endpoint for readiness probe
app.get("/healthz", async (req, res) => {
  try {
    await client.query("SELECT 1");
    res.status(200).send("OK");
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(500).send("Database not ready");
  }
});

// Root endpoint - increments counter
app.get("/", async (req, res) => {
  try {
    console.log(
      "Ping received! Responding with pong and incrementing counter."
    );

    // Insert a new row to increment the counter
    await client.query("INSERT INTO pongs (count) VALUES (1)");

    // Get the current count
    const currentCount = await client.query("SELECT COUNT(*) FROM pongs");

    res.send(`pong ${currentCount.rows[0].count}`);
  } catch (err) {
    console.error("Error in root endpoint:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Separate endpoint for just getting the count (no increment)
app.get("/pong-count", async (req, res) => {
  try {
    console.log("Count requested - not incrementing");

    const result = await client.query("SELECT COUNT(*) FROM pongs");
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error("Error getting pong count:", err);
    res.status(500).json({ error: "Failed to get count" });
  }
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, closing database connection...");
  try {
    await client.end();
    console.log("Database connection closed");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
});

process.on("SIGINT", async () => {
  console.log("Received SIGINT, closing database connection...");
  try {
    await client.end();
    console.log("Database connection closed");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
});

const start = async () => {
  await initializeDatabase();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Pong application listening on port ${PORT}`);
  });
};

start();