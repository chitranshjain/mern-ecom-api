const mongoose = require("mongoose");
const HttpError = require("../models/error");

// Local Imports
const Product = require("../models/products");
const Category = require("../models/categories");

const createProduct = async (req, res, next) => {
  const { name, price, stockQuantity, categoryName, description } = req.body;

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
    image:
      "https://rukminim1.flixcart.com/image/416/416/kg8avm80/mobile/r/h/z/apple-iphone-12-dummyapplefsn-original-imafwg8dqgncgbcb.jpeg?q=70",
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
  const { name, category, price, stockQuantity, description } = req.body;
  const productId = req.params.productId;
  let product;
  try {
    product = await Product.findByIdAndUpdate(productId, {
      $set: {
        name: name,
        image:
          "https://rukminim1.flixcart.com/image/416/416/kg8avm80/mobile/r/h/z/apple-iphone-12-dummyapplefsn-original-imafwg8dqgncgbcb.jpeg?q=70",
        category,
        price,
        stockQuantity,
        description,
      },
    });
  } catch (error) {
    const err = new HttpError("Could not update product", 500);
    return next(err);
  }

  res
    .status(200)
    .json({ message: "Product updated successfully", updatedProduct: product });
};

const deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    await Product.findByIdAndRemove(productId);
  } catch (error) {
    const err = new HttpError("Could not delete product", 500);
    return next(err);
  }

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
};
