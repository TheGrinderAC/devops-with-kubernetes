const crypto = require('crypto');

const randomString = crypto.randomUUID();

const printString = () => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${randomString}`);
};

setInterval(printString, 5000);
