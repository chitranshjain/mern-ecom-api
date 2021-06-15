const express = require("express");
const bodyParser = require("body-parser");

// Local imports
const userRoutes = require("./routes/users");

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

app.use("/api/users", userRoutes);

app.listen(5000, () => {
  console.log("Server is up and running on port 5000");
});
