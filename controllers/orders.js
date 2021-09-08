const mongoose = require("mongoose");
const HttpError = require("../models/error");

const Order = require("../models/orders");
const User = require("../models/users");
const Product = require("../models/products");

const createOrder = async (req, res, next) => {
  const {
    userId,
    products,
    orderAmount,
    status,
    orderedAt,
    shippedAt,
    deliveredAt,
  } = req.body;

  const newOrder = new Order({
    userId,
    orderAmount,
    status,
    orderedAt,
    shippedAt,
    deliveredAt,
    products,
  });

  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    const err = new HttpError(
      "Could not find user. Error : " + err.message,
      500
    );
    return next(err);
  }

  if (!user) {
    return next(
      new HttpError("Could not find user for the provided user ID", 404)
    );
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await newOrder.save({ session: session });
    user.orders.push(newOrder);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (error) {
    const err = new HttpError(
      "Could not place order. Error : " + error.message,
      500
    );
    return next(err);
  }

  res.status(200).json({
    message: "Order placed successfully.",
    newOrder: newOrder.toObject({ getters: true }),
  });
};

const checkProducts = async (req, res, next) => {
  const { products } = req.body;

  try {
    products.forEach(async (product) => {
      console.log(product);
      let pro = await Product.findById(product.productId);
      if (!pro) {
        return next(new HttpError("Could not find product.", 404));
      }
    });
  } catch (error) {
    const err = new HttpError("Could not find the selected product(s)", 404);
    return next(err);
  }

  res.status(200);
  next();
};

const checkQuantity = async (req, res, next) => {
  const { products } = req.body;

  try {
    products.forEach(async (product) => {
      console.log(product);
      let pro = await Product.findById(product.productId);
      if (pro.stockQuantity < product.quantity) {
        return next(
          new HttpError(
            "Could not place order due to insufficient quantity.",
            500
          )
        );
      } else {
        pro.stockQuantity = pro.stockQuantity - product.quantity;
      }

      await pro.save();
    });
  } catch (error) {
    const err = new HttpError("Could not find the selected product(s)", 404);
    return next(err);
  }

  res.status(200);
  next();
};

const getAllOrders = async (req, res, next) => {
  let orders;

  try {
    orders = await Order.find()
      .populate("userId")
      .populate("products.productId");
  } catch (error) {
    const err = new HttpError(
      "Could not fetch orders. Error : " + error.message,
      404
    );
    return next(err);
  }

  res.status(200).json({
    allOrders: orders.map((order) => order.toObject({ getters: true })),
  });
};

const getOrderById = async (req, res, next) => {
  let order;
  const orderId = req.params.orderId;

  try {
    order = await Order.findById(orderId)
      .populate("userId")
      .populate("products.productId");
  } catch (error) {
    const err = new HttpError(
      "Could not fetch order. Error : " + error.message,
      404
    );
    return next(err);
  }

  res.status(200).json({
    order: order.toObject({ getters: true }),
  });
};

const deleteOrderById = async (req, res, next) => {
  const orderId = req.params.orderId;
  let order;

  try {
    order = await Order.findById(orderId).populate("userId");
  } catch (error) {
    const err = new HttpError("Could not find order.", 404);
    return next(err);
  }

  if (!order) {
    return next(
      new HttpError("Could not find order for the provided Order ID.", 404)
    );
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await order.remove({ session: session });
    order.userId.orders.pull(order);
    await order.userId.save({ session: session });
    await session.commitTransaction();
  } catch (error) {
    const err = new HttpError("There was an error removing the order.", 500);
    return next(err);
  }

  res.status(200).json({ message: "Order removed successfully." });
};

const updateOrder = async (req, res, next) => {
  const { status, shippedAt, deliveredAt } = req.body;
  const orderId = req.params.orderId;

  try {
    await Order.findByIdAndUpdate(orderId, {
      $set: {
        status,
        deliveredAt,
        shippedAt,
      },
    });
  } catch (error) {
    const err = new HttpError("Could not update order, please try again.", 500);
    return next(err);
  }

  res.status(200).json({ message: "Order updated successfully." });
};

const getOrdersByUserId = async (req, res, next) => {
  const userId = req.params.userId;

  let orders;
  try {
    orders = await Order.find({ userId: userId });
  } catch (error) {
    const err = new HttpError(
      "Could not find orders for the provided User ID",
      404
    );
    return nex(err);
  }

  if (!orders) {
    return next(
      new HttpError("Could not find orders for the provided User ID.", 404)
    );
  }

  res
    .status(200)
    .json({ orders: orders.map((order) => order.toObject({ getters: true })) });
};

module.exports = {
  createOrder,
  getAllOrders,
  checkQuantity,
  deleteOrderById,
  updateOrder,
  getOrdersByUserId,
  checkProducts,
  getOrderById,
};
