const express = require("express");
const axios = require("axios");
const stan = require("node-nats-streaming");

const app = express();
const port = process.env.PORT || 3002;
const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
const natsServer = process.env.NATS_SERVER || "nats://nats-svc:4222";
const clusterId = process.env.NATS_CLUSTER_ID || "test-cluster";
const clientId = `broadcaster-${Math.random().toString(36).substring(2, 15)}`;

const sc = stan.connect(clusterId, clientId, { url: natsServer });

sc.on("connect", () => {
  console.log("Connected to NATS streaming server");

  const opts = sc.subscriptionOptions();
  opts.setDeliverAllAvailable();
  opts.setDurableName("broadcaster-durable");
  opts.setManualAckMode(true);
  opts.setAckWait(60000); // 60 seconds

  const subscription = sc.subscribe("todos", "broadcaster-queue", opts);

  subscription.on("message", async (msg) => {
    try {
      const todo = JSON.parse(msg.getData());
      console.log("Received a message:", todo);

      const message = {
        content: `Todo updated: **${todo.todo}** (Status: ${todo.done ? "Done" : "In progress"})`,
      };

      await axios.post(discordWebhookUrl, message);
      console.log("Message sent to Discord");

      msg.ack();
    } catch (error) {
      console.error("Error processing message:", error.message);
      // Don't ack the message, so it can be redelivered
    }
  });
});

sc.on("error", (err) => {
  console.error("NATS connection error:", err);
});

app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Broadcaster service listening at http://localhost:${port}`);
});
