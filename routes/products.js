const express = require("express");

const productsController = require("../controllers/products");

const router = express.Router();

router.get("/", productsController.getAllProducts);
router.get("/:category", productsController.getProductsByCategory);
router.get("/product/:productId", productsController.getProductById);
router.post("/create/product", productsController.createProduct);
router.patch("/update/:productId", productsController.updateProduct);
router.delete("/delete/:productId", productsController.deleteProduct);

module.exports = router;
