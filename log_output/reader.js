const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const logFilePath = path.join("/app/logs", "output.log");

app.get("/", (req, res) => {
  fs.readFile(logFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Failed to read log file:", err);
      return res.status(500).send("Failed to read log file");
    }
    const timestamp = new Date().toISOString();
    const randomString = crypto.randomUUID();
    const pongs = parseInt(data) || 0;
    res.send(`${timestamp}: ${randomString}.\nPing / Pongs: ${pongs}`);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Reader service listening on port ${PORT}`);
});
