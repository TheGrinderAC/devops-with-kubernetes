const express = require("express");
const axios = require("axios");
const { connect, StringCodec } = require("nats");

const app = express();
const port = process.env.PORT || 3002;
const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
const natsServer = process.env.NATS_SERVER || "nats://my-nats:4222";

const stringCodec = StringCodec();

(async () => {
  try {
    const nc = await connect({ servers: natsServer });
    console.log(`Connected to NATS at ${nc.getServer()}`);

    const sub = nc.subscribe("todos", { queue: "broadcaster-queue" });
    (async () => {
      for await (const m of sub) {
        try {
          const todo = JSON.parse(stringCodec.decode(m.data));
          console.log("Received a message:", todo);

          const message = {
            content: `Todo updated: **${todo.todo}** (Status: ${
              todo.done ? "Done" : "In progress"
            })`,
          };

          await axios.post(discordWebhookUrl, message);
          console.log("Message sent to Discord");
        } catch (error) {
          console.error("Error processing message:", error.message);
        }
      }
      console.log("subscription closed");
    })();
    console.log("Subscribed to 'todos'");
  } catch (err) {
    console.error("NATS connection error:", err);
  }
})();


app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Broadcaster service listening at http://localhost:${port}`);
});