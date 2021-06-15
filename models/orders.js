const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
  products: [
    {
      productId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Product",
      },
      quantity: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
    },
  ],
  orderAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  orderedAt: {
    type: String,
    required: true,
  },
  shippedAt: {
    type: String,
    required: true,
  },
  deliveredAt: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Order", orderSchema);
