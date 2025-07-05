const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const randomString = crypto.randomUUID();
const logFilePath = path.join("/app/logs", "output.log");

// Ensure the directory exists
fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

const writeString = () => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${randomString}\n`;
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Failed to write to log file:", err);
    }
  });
};

setInterval(writeString, 5000);

console.log(`Writing to ${logFilePath}`);
