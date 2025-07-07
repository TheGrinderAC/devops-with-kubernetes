const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const app = express();

// Set this to the correct service name and port in your cluster
const PONG_APP_URL =
  process.env.PONG_APP_URL || "http://pong-application-svc:2345";

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${PONG_APP_URL}/pong-count`);
    // Defensive: check if response.data exists and has count
    const pongs =
      response.data && typeof response.data.count === "number"
        ? response.data.count
        : 0;
    const timestamp = new Date().toISOString();
    // Fallback for Node.js < 14.17
    const randomString = crypto.randomUUID
      ? crypto.randomUUID()
      : crypto.randomBytes(16).toString("hex");
    res.send(`${timestamp}: ${randomString}.\nPing / Pongs: ${pongs}`);
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
