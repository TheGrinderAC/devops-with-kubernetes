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

client.connect().then(() => {
  console.log("Connected to PostgreSQL");
  client.query(`
    CREATE TABLE IF NOT EXISTS pongs (
      id SERIAL PRIMARY KEY,
      count INTEGER
    );
  `);
});

// Root endpoint - increments counter (this is what /pingpong will be rewritten to)
app.get("/", async (req, res) => {
  console.log("Ping received! Responding with pong and incrementing counter.");

  const result = await client.query(
    "INSERT INTO pongs (count) VALUES (1) RETURNING count"
  );
  const currentCount = await client.query("SELECT COUNT(*) FROM pongs");
  res.send(`pong ${currentCount.rows[0].count}`);
});

// Separate endpoint for just getting the count (no increment)
app.get("/pong-count", async (req, res) => {
  console.log("Count requested - not incrementing");

  const result = await client.query("SELECT COUNT(*) FROM pongs");
  res.json({ count: parseInt(result.rows[0].count) });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pong application listening on port ${PORT}`);
});
