const fs = require("fs");
const mongoose = require("mongoose");
const HttpError = require("../models/error");

const User = require("../models/users");

const getAllUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find();
  } catch (error) {
    const err = new HttpError("Could not get all users", 404);
    return next(err);
  }

  res
    .status(200)
    .json({ allUsers: users.map((user) => user.toObject({ getters: true })) });
};

const getUserById = async (req, res, next) => {
  let user;
  const userId = req.params.userId;

  try {
    user = await User.findById(userId);
  } catch (error) {
    const err = new HttpError(
      "Could not find user. Error : " + error.message,
      404
    );
    return next(err);
  }

  res.status(200).json({ user });
};

const createUser = async (req, res, next) => {
  const { name, email, phone, address, city, pin, state, firebaseId } =
    req.body;

  let newUser = new User({
    name,
    email,
    phone,
    address,
    city,
    pin,
    state,
    firebaseId,
    image: req.file.path,
    orders: [],
  });

  try {
    await newUser.save();
  } catch (error) {
    const err = new HttpError(
      "Failed to create account, please try again. Error : " + error.message,
      500
    );
    return next(err);
  }

  res.status(200).json({
    message: "Account created successfully",
    createdUser: newUser.toObject({ getters: true }),
  });
};

const getUserByFirebaseId = async (req, res, next) => {
  const firebaseId = req.params.firebaseId;
  let user;

  try {
    user = await User.findOne({ firebaseId: firebaseId });
  } catch (error) {
    const err = new HttpError("Could not find user", 404);
    return next(err);
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

const updateUserById = async (req, res, next) => {
  const { name, email, phone, address, city, pin, state, firebaseId } =
    req.body;
  const userId = req.params.userId;
  let user;

  try {
    user = await User.findByIdAndUpdate(userId, {
      $set: {
        name,
        email,
        phone,
        address,
        city,
        pin,
        state,
      },
    });
  } catch (error) {
    const err = new HttpError("Could not update user", 500);
    return next(err);
  }

  res.status(200).json({
    message: "User updated",
    updatedUser: user.toObject({ getters: true }),
  });
};

const updateUserByFirebaseId = async (req, res, next) => {
  const { name, email, phone, address, city, pin, state } = req.body;
  const firebaseId = req.params.firebaseId;
  let user;

  try {
    user = await User.findOneAndUpdate(
      { firebaseId: firebaseId },
      {
        $set: {
          name,
          email,
          phone,
          address,
          city,
          pin,
          state,
        },
      }
    );
  } catch (error) {
    const err = new HttpError("Could not update user", 500);
    return next(err);
  }

  res.status(200).json({
    message: "User updated",
    updatedUser: user.toObject({ getters: true }),
  });
};

const updateUserImage = async (req, res, next) => {
  const userId = req.params.userId;

  let user;
  try {
    user = await User.findByIdAndUpdate(userId, {
      $set: {
        image: req.file.path,
      },
    });
  } catch (error) {
    const err = new HttpError(
      "Could not update image, please try again after some time.",
      500
    );
    return next(err);
  }

  const oldImagePath = user.image;

  fs.unlink(oldImagePath, (err) => {
    if (err) {
      console.log("Error while deleting image");
    } else {
      console.log("Image deleted");
    }
  });

  res.status(200).json({ message: "Image updated successfully" });
};

const deleteUserById = async (req, res, next) => {
  const userId = req.params.userId;

  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    const err = new HttpError("Could not find user. Error : " + error.message);
    return next(err);
  }

  const oldImagePath = user.image;
  try {
    await User.findByIdAndRemove(userId);
  } catch (error) {
    const err = new HttpError(
      "Could not delete user. Error : " + error.message
    );
    return next(err);
  }

  fs.unlink(oldImagePath, (err) => {
    if (err) {
      console.log("Could not delete image");
    } else {
      console.log("Image deleted successfully.");
    }
  });

  res.status(200).json({ message: "User deleted successfully" });
};

const deleteUserByFirebaseId = async (req, res, next) => {
  const firebaseId = req.params.firebaseId;

  let user;
  try {
    user = await User.findOne({ firebaseId: firebaseId });
  } catch (error) {
    const err = new HttpError(
      "Could not find user. Error : " + error.message,
      500
    );
    return next(err);
  }

  const oldImagePath = user.image;
  try {
    await User.findOneAndRemove({ firebaseId: firebaseId });
  } catch (error) {
    const err = new HttpError(
      "Could not delete user. Error : " + error.message
    );
    return next(err);
  }

  fs.unlink(oldImagePath, (err) => {
    if (err) {
      console.log("Could not delete image");
    } else {
      console.log("Image deleted successfully.");
    }
  });

  res.status(200).json({ message: "User deleted successfully." });
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  getUserByFirebaseId,
  updateUserById,
  updateUserByFirebaseId,
  deleteUserById,
  deleteUserByFirebaseId,
  updateUserImage,
};
