const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  pin: {
    type: Number,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  firebaseId: {
    type: String,
    required: true,
  },
  orders: [
    {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Order",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
