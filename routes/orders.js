const express = require("express");

const ordersController = require("../controllers/orders");

const router = express.Router();

router.get("/", ordersController.getAllOrders);
router.get("/:userId", ordersController.getOrdersByUserId);
router.post(
  "/",
  ordersController.checkProducts,
  ordersController.checkQuantity,
  ordersController.createOrder
);
router.patch("/:orderId", ordersController.updateOrder);
router.delete("/:orderId", ordersController.deleteOrderById);

module.exports = router;
