"use strict";

const ProductService = require("../services/productService");

const productService = new ProductService();

exports.handler = async (event, context) => {
  try {
    const productId = event.pathParameters?.productId;
    if (!productId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Product ID is required" }),
      };
    }
    
    const product = productService.getProductById(productId);
    return {
      statusCode: 200,
      body: JSON.stringify(product),
    };
  } catch (err) {
    console.error("Lambda Error:", err);
    const statusCode = err.message === "Product not found" ? 404 : 500;
    return {
      statusCode,
      body: JSON.stringify({ error: err.message || "Internal Server Error" }),
    };
  }
};
