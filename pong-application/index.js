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

app.get("/pingpong", async (req, res) => {
  const result = await client.query(
    "INSERT INTO pongs (count) VALUES (1) RETURNING count"
  );
  const currentCount = await client.query("SELECT COUNT(*) FROM pongs");
  res.send(`pong ${currentCount.rows[0].count}`);
});

app.get("/pong-count", async (req, res) => {
  const result = await client.query("SELECT COUNT(*) FROM pongs");
  res.json({ count: parseInt(result.rows[0].count) });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pong application listening on port ${PORT}`);
});
