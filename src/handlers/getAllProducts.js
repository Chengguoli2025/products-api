"use strict";

const ProductService = require("../services/productService");

const productService = new ProductService();

exports.handler = async (event, context) => {
  try {
    const products = productService.getAllProducts();
    return {
      statusCode: 200,
      body: JSON.stringify(products),
    };
  } catch (err) {
    console.error("Lambda Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};