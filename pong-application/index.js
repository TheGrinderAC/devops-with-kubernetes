const express = require("express");

let counter = 0;

const app = express();

app.get("/pingpong", (req, res) => {
  res.send(`pong ${counter++}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pong application listening on port ${PORT}`);
});
