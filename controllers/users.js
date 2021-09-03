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
    image:
      "https://img.freepik.com/free-photo/waist-up-portrait-handsome-serious-unshaven-male-keeps-hands-together-dressed-dark-blue-shirt-has-talk-with-interlocutor-stands-against-white-wall-self-confident-man-freelancer_273609-16320.jpg?size=626&ext=jpg",
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

const deleteUserById = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    await User.findByIdAndDelete(userId);
  } catch (error) {
    const err = new HttpError(
      "Could not delete user. Error : " + error.message
    );
    return next(err);
  }

  res.status(200).json({ message: "User deleted successfully" });
};

const deleteUserByFirebaseId = async (req, res, next) => {
  const firebaseId = req.params.firebaseId;

  try {
    await User.findOneAndDelete({ firebaseId: firebaseId });
  } catch (error) {
    const err = new HttpError(
      "Could not delete user. Error : " + error.message,
      500
    );
    return next(err);
  }

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
};
