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
    console.log("DB_PASSWORD:", process.env.DB_PASSWORD);

    const productData = JSON.parse(event.body || "{}");

    if (!productData.name || !productData.price) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Name and price are required" }),
      };
    }

    const newProduct = await productService.addProduct(productData);
    return {
      statusCode: 201,
      body: JSON.stringify({
        product: newProduct,
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
