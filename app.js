// Importing packages
const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Local imports
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const HttpError = require("./models/error");

// Initializing express app and other features
const app = express();
dotenv.config();

// Middlewares
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
app.use("/api/products", productRoutes);

// Invalid route error
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

// Connecting to db and running the server
mongoose
  .connect(process.env.MONGODBURI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => {
    app.listen(5000, () => {
      console.log("Server is up and running on port 5000");
    });
  })
  .catch((err) => {
    console.log("An error occurred : " + err.message);
  });
