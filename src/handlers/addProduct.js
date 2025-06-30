"use strict";

const ProductService = require("../services/productService");

const productService = new ProductService();

exports.handler = async (event, context) => {
  try {
    const productData = JSON.parse(event.body || "{}");
    
    if (!productData.name || !productData.price) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Name and price are required" }),
      };
    }

    const newProduct = productService.addProduct(productData);
    return {
      statusCode: 201,
      body: JSON.stringify(newProduct),
    };
  } catch (err) {
    console.error("Lambda Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};