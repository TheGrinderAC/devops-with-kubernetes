const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const logFilePath = path.join("/app/logs", "output.log");

app.get("/", (req, res) => {
  fs.readFile(logFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Failed to read log file:", err);
      return res.status(500).send("Failed to read log file");
    }
    res.send(data);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Reader service listening on port ${PORT}`);
});
