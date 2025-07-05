"use strict";

const ProductService = require("../services/productService");

const productService = new ProductService();

exports.handler = async (event, context) => {
  try {
    console.log('Environment Variables:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DFA_API:', process.env.DFA_API);
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    const products = productService.getAllProducts();
    return {
      statusCode: 200,
      body: JSON.stringify({
        products,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DFA_API: process.env.DFA_API,
          DATABASE_URL: process.env.DATABASE_URL
        }
      }),
    };
  } catch (err) {
    console.error("Lambda Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};