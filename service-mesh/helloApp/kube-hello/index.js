const express = require("express");

const app = express();
const port = 8080;

app.get("/", (req, res) => {
  console.log("Received request for /");
  res.send("Hello, Old World!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
