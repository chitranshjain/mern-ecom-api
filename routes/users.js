const express = require("express");

const userController = require("../controllers/users");
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
      cb(null, "uploads/images/user");
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

router.get("/", userController.getAllUsers);
router.get("/:userId", userController.getUserById);
router.get("/firebase/:firebaseId", userController.getUserByFirebaseId);

router.patch("/:userId", userController.updateUserById);
router.patch("/firebase/:firebaseId", userController.updateUserByFirebaseId);
router.patch(
  "/image/:userId",
  fileUpload.single("image"),
  userController.updateUserImage
);

router.delete("/:userId", userController.deleteUserById);
router.delete("/firebase/:firebaseId", userController.deleteUserByFirebaseId);

router.post("/", fileUpload.single("image"), userController.createUser);

module.exports = router;
