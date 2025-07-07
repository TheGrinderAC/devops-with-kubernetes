const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
// const logFilePath = path.join("/app/logs", "output.log");

let pongCount = 0;

app.get("/pingpong", (req, res) => {
  pongCount += 1;
  res.send(`pong ${pongCount}`);
});

app.get("/pong-count", (req, res) => {
  res.json({ count: pongCount });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pong application listening on port ${PORT}`);
});
