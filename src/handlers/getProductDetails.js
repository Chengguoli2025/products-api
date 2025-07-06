"use strict";

const { loadEnvConfig } = require("../config/env");
const DynamoProductService = require("../services/dynamoProductService");

const productService = new DynamoProductService();

exports.handler = async (event, context) => {
  try {
    // Load environment variables from config files
    await loadEnvConfig();
    
    console.log("Environment Variables:");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("DFA_API:", process.env.DFA_API);
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? '***masked***' : 'not set');

    const productId = event.pathParameters?.productId;
    if (!productId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Product ID is required" }),
      };
    }

    const product = await productService.getProductById(productId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        product,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DFA_API: process.env.DFA_API,
          DATABASE_URL: process.env.DATABASE_URL,
          DB_PASSWORD: process.env.DB_PASSWORD,
        },
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
