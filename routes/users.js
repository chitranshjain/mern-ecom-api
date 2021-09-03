const express = require("express");

const userController = require("../controllers/users");
const router = express.Router();

router.get("/", userController.getAllUsers);
router.get("/:userId", userController.getUserById);
router.get("/firebase/:firebaseId", userController.getUserByFirebaseId);

router.patch("/:userId", userController.updateUserById);
router.patch("/firebase/:firebaseId", userController.updateUserByFirebaseId);

router.delete("/:userId", userController.deleteUserById);
router.delete("/firebase/:firebaseId", userController.deleteUserByFirebaseId);

router.post("/", userController.createUser);

module.exports = router;
