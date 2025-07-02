"use strict";

const ProductService = require("../services/productService");

const productService = new ProductService();

exports.handler = async (event, context) => {
  try {
    console.log('Environment Variables:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DFA_API:', process.env.DFA_API);
    
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
      body: JSON.stringify({
        product,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DFA_API: process.env.DFA_API
        }
      }),
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
