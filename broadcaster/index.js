const express = require("express");
const axios = require("axios");
const { connect, StringCodec } = require("nats");

const app = express();
const port = process.env.PORT || 3002;
const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
const natsServer = process.env.NATS_SERVER || "nats://my-nats:4222";

console.log("Broadcaster service starting...");
console.log(`Connecting to NATS server at ${natsServer}`);
console.log(
  `Discord webhook URL: ${discordWebhookUrl ? "configured" : "NOT configured"}`
);

const sc = StringCodec();

let nc;

const connectToNATS = async () => {
  try {
    nc = await connect({
      servers: natsServer,
      reconnect: true,
      maxReconnectAttempts: -1,
      reconnectTimeWait: 1000,
      timeout: 10000,
    });

    console.log(`Connected to NATS at ${nc.getServer()}`);

    // Subscribe to todos subject
    const sub = nc.subscribe("todos", { queue: "broadcaster-queue" });
    console.log("Subscribed to 'todos' subject with queue 'broadcaster-queue'");

    // Process messages
    (async () => {
      for await (const m of sub) {
        try {
          const todo = JSON.parse(sc.decode(m.data));
          // 4.10
          if (process.env.NODE_ENV === "staging") {
            console.log("Staging environment: not forwarding to Discord.");
            console.log("Received todo message:", todo);
            continue;
          }

          if (!discordWebhookUrl) {
            console.error("Discord webhook URL not configured");
            continue;
          }

          const message = {
            content: `📝 Todo updated: **${todo.todo}** (Status: ${
              todo.done ? "✅ Done" : "⏳ In progress"
            })`,
          };

          const response = await axios.post(discordWebhookUrl, message);
          console.log("Message sent to Discord successfully", response.status);
        } catch (error) {
          console.error("Error processing message:", error.message);

          // Log more details for debugging
          if (error.response) {
            console.error(
              "Discord API error:",
              error.response.status,
              error.response.data
            );
          }
        }
      }
      console.log("NATS subscription closed");
    })();

    // Handle connection closure
    nc.closed().then((err) => {
      if (err) {
        console.error("NATS connection closed with error:", err);
      } else {
        console.log("NATS connection closed normally");
      }

      // Attempt to reconnect after a delay
      setTimeout(() => {
        console.log("Attempting to reconnect to NATS...");
        connectToNATS();
      }, 5000);
    });
  } catch (err) {
    console.error("NATS connection error:", err);

    // Retry connection after delay
    setTimeout(() => {
      console.log("Retrying NATS connection...");
      connectToNATS();
    }, 5000);
  }
};

// Initial connection
connectToNATS();

// Health check endpoint
app.get("/healthz", (req, res) => {
  const isConnected = nc && !nc.isClosed();
  const status = isConnected ? "ok" : "unhealthy";
  const statusCode = isConnected ? 200 : 503;

  res.status(statusCode).json({
    status,
    natsConnected: isConnected,
    discordConfigured: !!discordWebhookUrl,
  });
});

// Test endpoint to manually send a Discord message
app.post("/test-discord", async (req, res) => {
  if (!discordWebhookUrl) {
    return res
      .status(400)
      .json({ error: "Discord webhook URL not configured" });
  }

  try {
    const testMessage = {
      content: "🧪 Test message from broadcaster service",
    };

    const response = await axios.post(discordWebhookUrl, testMessage);
    res.json({ success: true, status: response.status });
  } catch (error) {
    console.error("Test Discord message failed:", error.message);
    res.status(500).json({
      error: "Failed to send test message",
      details: error.response?.data || error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Broadcaster service listening at http://localhost:${port}`);
});
