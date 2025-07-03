const crypto = require("crypto");
const express = require("express");

const randomString = crypto.randomUUID();

const printString = () => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${randomString}`);
};

setInterval(printString, 5000);

const app = express();

app.get("/", (req, res) => {
  const timestamp = new Date().toISOString();
  res.json({
    timestamp,
    randomString,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Status endpoint listening on port ${PORT}`);
});
