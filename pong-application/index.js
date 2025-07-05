const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const logFilePath = path.join("/app/logs", "output.log");

app.get("/pingpong", (req, res) => {
  fs.readFile(logFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Failed to read log file:", err);
    }
    const counter = parseInt(data) || 0;
    const newCounter = counter + 1;
    fs.writeFile(logFilePath, newCounter.toString(), (err) => {
      if (err) {
        console.error("Failed to write to log file:", err);
      }
    });
    res.send(`pong ${newCounter}`);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pong application listening on port ${PORT}`);
});
