const mongoose = require("mongoose");
const fs = require("fs");
const HttpError = require("../models/error");

// Local imports
const Category = require("../models/categories");

const createCategory = async (req, res, next) => {
  const { name } = req.body;

  console.log(name);

  const newCategory = new Category({
    name: name,
    image: req.file.path,
    products: [],
  });

  try {
    await newCategory.save();
  } catch (error) {
    const err = new HttpError(
      "Failed to add category, please try again after some time. Error : " +
        error.message,
      500
    );
    return next(err);
  }

  res.status(200).json({
    message: "Category added successfully",
    createdCategory: newCategory.toObject({ getters: true }),
  });
};

const getAllCategories = async (req, res, next) => {
  let categories;

  try {
    categories = await Category.find()
      .populate("products")
      .sort({ name: "asc" });
  } catch (error) {
    const err = new HttpError("Could not find categories", 404);
    return next(err);
  }

  categories.forEach((cat) => {
    cat.image = cat.image.replace(/\\/g, "/");
  });

  res.status(200).json({
    categories: categories.map((category) =>
      category.toObject({ getters: true })
    ),
  });
};

const updateCategory = async (req, res, next) => {
  const { name } = req.body;
  const categoryId = req.params.categoryId;

  let category;
  try {
    category = await Category.findByIdAndUpdate(categoryId, {
      $set: {
        name,
      },
    });
  } catch (error) {
    const err = new HttpError("Could not update category", 500);
    return next(err);
  }

  category.image = category.image.replace(/\\/g, "/");

  res.status(200).json({
    message: "Category updated successfully",
    updatedCategory: category.toObject({ getters: true }),
  });
};

const updateCategoryImage = async (req, res, next) => {
  const categoryId = req.params.categoryId;

  let category;
  try {
    category = await Category.findByIdAndUpdate(categoryId, {
      $set: {
        image: req.file.path,
      },
    });
  } catch (error) {
    const err = new HttpError("Could not update category image.", 500);
    return next(err);
  }

  const oldImagePath = category.image;

  fs.unlink(oldImagePath, (err) => {
    if (err) {
      console.log("Error while deleting image");
    } else {
      console.log("Place image deleted");
    }
  });

  res.status(200).json({ message: "Category image updated" });
};

const deleteCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;

  let category;
  try {
    category = await Category.findById(categoryId);
  } catch (error) {
    const err = new HttpError("Could not find category to be deleted", 500);
    return next(err);
  }

  console.log(categoryId);
  console.log(category);

  const oldImagePath = category.image;

  try {
    await Category.findByIdAndRemove(categoryId);
  } catch (error) {
    const err = new HttpError("Could not delete category", 500);
    return next(err);
  }

  fs.unlink(oldImagePath, (err) => {
    if (err) {
      console.log("Error while deleting image");
    } else {
      console.log("Place image deleted");
    }
  });

  res.status(200).json({ message: "Category removed successfully" });
};

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  updateCategoryImage,
};
