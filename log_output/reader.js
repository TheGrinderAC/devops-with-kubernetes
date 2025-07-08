const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();

// Set this to the correct service name and port in your cluster
const PONG_APP_URL =
  process.env.PONG_APP_URL || "http://pong-application-svc:2345";

const configFilePath = path.join("/app", "config", "information.txt");

app.get("/", async (req, res) => {
  try {
    // Read file content
    let fileContent = "File not found or empty.";
    if (fs.existsSync(configFilePath)) {
      fileContent = fs.readFileSync(configFilePath, "utf8").trim();
    }

    // Get env variable
    const message = process.env.MESSAGE || "No message set";

    // Get pong count
    const response = await axios.get(`${PONG_APP_URL}/pong-count`);
    const pongs =
      response.data && typeof response.data.count === "number"
        ? response.data.count
        : 0;

    // Timestamp and random string
    const timestamp = new Date().toISOString();
    const randomString = crypto.randomUUID
      ? crypto.randomUUID()
      : crypto.randomBytes(16).toString("hex");

    // Respond in the requested format
    res.send(
      `file content: ${fileContent}\nenv variable: MESSAGE=${message}\n${timestamp}: ${randomString}.\nPing / Pongs: ${pongs}\n`
    );
  } catch (err) {
    console.error(
      "Failed to fetch pong count:",
      err && err.message ? err.message : err
    );
    return res.status(500).send("Failed to fetch pong count");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Reader service listening on port ${PORT}`);
});
