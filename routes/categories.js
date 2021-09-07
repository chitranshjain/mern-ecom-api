const express = require("express");

const categoryController = require("../controllers/categories");

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
      cb(null, "uploads/images/category");
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

router.get("/", categoryController.getAllCategories);
router.get("/:categoryId", categoryController.getCategoryById);
router.post("/", fileUpload.single("image"), categoryController.createCategory);
router.patch("/:categoryId", categoryController.updateCategory);
router.patch(
  "/image/:categoryId",
  fileUpload.single("image"),
  categoryController.updateCategoryImage
);
router.delete("/:categoryId", categoryController.deleteCategory);

module.exports = router;
