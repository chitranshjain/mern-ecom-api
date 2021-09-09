const mongoose = require("mongoose");
const fs = require("fs");
const HttpError = require("../models/error");

// Local Imports
const Product = require("../models/products");
const Category = require("../models/categories");

const createProduct = async (req, res, next) => {
  const { name, price, stockQuantity, categoryName, description } = req.body;
  console.log(req.body);

  let category;
  try {
    category = await Category.findOne({ name: categoryName });
  } catch (err) {
    const error = new HttpError("Something went wrong.", 500);
    return next(error);
  }

  if (!category) {
    const error = new HttpError(
      "Could not find category with the provided name.",
      404
    );
    return next(error);
  }

  const newProduct = new Product({
    name: name,
    image: req.file.path,
    price,
    stockQuantity,
    description,
    category,
  });

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await newProduct.save({ session: session });
    category.products.push(newProduct);
    await category.save({ session: session });
    await session.commitTransaction();
  } catch (error) {
    const err = new HttpError(
      "Failed to create product, please try again after some time. Error : " +
        error.message,
      500
    );

    return next(err);
  }

  res.status(200).json({
    message: "Product created successfully",
    createdProduct: newProduct,
  });
};

const updateProduct = async (req, res, next) => {
  const { name, categoryName, price, stockQuantity, description } = req.body;
  const productId = req.params.productId;
  let product;

  console.log(categoryName);

  let category;
  try {
    category = await Category.findOne({ name: categoryName });
  } catch (err) {
    const error = new HttpError("Something went wrong.", 500);
    return next(error);
  }

  try {
    product = await Product.findById(productId);
  } catch (error) {
    const err = new HttpError("Could not update product", 500);
    return next(err);
  }

  let oldCategoryId = product.category;

  let oldCategory;
  try {
    oldCategory = await Category.findById(oldCategoryId);
  } catch (err) {
    const error = new HttpError("Something went wrong.", 500);
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    oldCategory.products.pull(product);
    await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          name: name,
          category,
          price,
          stockQuantity,
          description,
        },
      },
      { session: session }
    );
    category.products.push(product);
    await oldCategory.save({ session: session });
    await category.save({ session: session });
    await session.commitTransaction();
  } catch (error) {
    const err = new HttpError("Could not update product", 500);
    return next(err);
  }

  res
    .status(200)
    .json({ message: "Product updated successfully", updatedProduct: product });
};

const updateProductImage = async (req, res, next) => {
  const productId = req.params.productId;
  let product;
  try {
    product = await Product.findByIdAndUpdate(productId, {
      $set: {
        image: req.file.path,
      },
    });
  } catch (error) {
    const err = new HttpError("Could not update product image", 500);
    return next(err);
  }

  const oldImagePath = product.image;

  fs.unlink(oldImagePath, (err) => {
    if (err) {
      console.log("Error while deleting image");
    } else {
      console.log("Place image deleted");
    }
  });

  res.status(200).json({
    message: "Product image updated successfully",
    updatedProduct: product,
  });
};

const deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;
  let product;

  try {
    product = await Product.findById(productId).populate("category");
  } catch (error) {
    const err = new HttpError("There was an error finding the product.", 404);
    return next(err);
  }

  const oldImagePath = product.image;
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await product.remove({ session: session });
    product.category.products.pull(product);
    await product.category.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "There was an error removing the product. Error : " + err.message,
      500
    );
    return next(error);
  }

  fs.unlink(oldImagePath, (err) => {
    if (err) {
      console.log("Error while deleting image");
    } else {
      console.log("Place image deleted");
    }
  });

  res.status(200).json({ message: "Product deleted successfully!" });
};

const getProductById = async (req, res, next) => {
  const productId = req.params.productId;
  let product;
  try {
    product = await Product.findById(productId);
  } catch (error) {
    const err = new HttpError("Could not find product", 404);
    return next(err);
  }

  product.image = product.image.replace(/\\/g, "/");

  res.status(200).json({ product: product.toObject({ getters: true }) });
};

const getAllProducts = async (req, res, next) => {
  let products;
  try {
    products = await Product.find().sort({ price: "asc" });
  } catch (error) {
    const err = new HttpError("Could not find products", 404);
    return next(err);
  }

  products.forEach((prod) => {
    prod.image = prod.image.replace(/\\/g, "/");
  });

  res.status(200).json({
    products: products.map((prod) => prod.toObject({ getters: true })),
  });
};

const getProductsByCategory = async (req, res, next) => {
  const category = req.params.category;
  let products;
  try {
    products = await Product.find({ category: category }).sort({
      price: "asc",
    });
  } catch (error) {
    const err = new HttpError("Could not find places.", 404);
    return next(err);
  }

  products.forEach((prod) => {
    prod.image = prod.image.replace(/\\/g, "/");
  });

  res.status(200).json({
    products: products.map((prod) => prod.toObject({ getters: true })),
  });
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getAllProducts,
  getProductsByCategory,
  updateProductImage,
};
