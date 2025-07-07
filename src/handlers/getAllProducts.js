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
    console.log("PRODUCTS_TABLE:", process.env.PRODUCTS_TABLE);
    console.log("DFA_API:", process.env.DFA_API);
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    console.log("DB_PASSWORD:", process.env.DB_PASSWORD);

    console.log("Getting all products from DynamoDB...");
    const products = await productService.getAllProducts();
    console.log("Products retrieved:", products.length);
    return {
      statusCode: 200,
      body: JSON.stringify({
        products,
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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
