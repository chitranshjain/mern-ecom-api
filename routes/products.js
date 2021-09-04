const express = require("express");

const productsController = require("../controllers/products");

const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

const fileUpload = multer({
  limits: 5000000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images/product");
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuidv4() + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type.");
    cb(error, isValid);
  },
});

router.get("/", productsController.getAllProducts);
router.get("/:category", productsController.getProductsByCategory);
router.get("/product/:productId", productsController.getProductById);
router.post(
  "/create/product",
  fileUpload.single("image"),
  productsController.createProduct
);

router.patch(
  "/update/:productId",
  fileUpload.single("image"),
  productsController.updateProduct
);

router.patch(
  "/update/image/:productId",
  fileUpload.single("image"),
  productsController.updateProductImage
);

router.delete("/delete/:productId", productsController.deleteProduct);

module.exports = router;
