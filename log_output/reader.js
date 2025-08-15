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

// Readiness probe endpoint
app.get("/healthz", async (req, res) => {
  try {
    // Try to get pong count from the Ping-pong application
    const response = await axios.get(`${PONG_APP_URL}/pong-count`);
    if (response.data && typeof response.data.count === "number") {
      res.status(200).send("OK");
    } else {
      res.status(500).send("Ping-pong application not ready");
    }
  } catch (err) {
    res.status(500).send("Ping-pong application not ready");
  }
});

app.get("/", async (req, res) => {
  try {
    // Read file content
    let fileContent = "File not found or empty.";
    if (fs.existsSync(configFilePath)) {
      fileContent = fs.readFileSync(configFilePath, "utf8").trim();
    }

    // Get env variable
    const message = process.env.MESSAGE || "No message set";
    const greetings = process.env.GREETING || "No Greet set";

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
      `File Content: ${fileContent}\nEnv Variable: MESSAGE=${message}\nTimestamp: ${timestamp}\nRandom String: ${randomString}\nPing / Pongs: ${pongs}\nGreet: ${greetings}.\n`
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
