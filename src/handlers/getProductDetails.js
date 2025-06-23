"use strict";

const BusinessLogic = require("../services/productService");

const logic = new BusinessLogic();

exports.handler = async (event, context) => {
  try {
    // Pass event to business logic
    const result = await logic.process(event);
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error("Lambda Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
