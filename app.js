const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

// CORS Rules Modification
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.get("/", (req, res) => {
  res.send("Hello, welcome to your server");
});

app.listen(5000, () => {
  console.log("Server is up and running on port 5000");
});
