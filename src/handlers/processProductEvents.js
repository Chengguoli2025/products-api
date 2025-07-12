"use strict";

const { loadEnvConfig } = require("../config/env");

exports.handler = async (event, context) => {
  try {
    await loadEnvConfig();
    
    console.log("Processing MSK events:", JSON.stringify(event, null, 2));
    
    for (const record of event.records) {
      const topicName = Object.keys(record)[0];
      const messages = record[topicName];
      
      console.log(`Processing ${messages.length} messages from topic: ${topicName}`);
      
      for (const message of messages) {
        try {
          const payload = JSON.parse(Buffer.from(message.value, 'base64').toString());
          console.log("Processing event:", payload);
          
          switch (payload.eventType) {
            case 'PRODUCT_CREATED':
              await handleProductCreated(payload.product);
              break;
            default:
              console.log(`Unknown event type: ${payload.eventType}`);
          }
        } catch (parseError) {
          console.error("Failed to parse message:", parseError);
        }
      }
    }
    
    return { statusCode: 200 };
  } catch (error) {
    console.error("MSK event processing error:", error);
    throw error;
  }
};

async function handleProductCreated(product) {
  console.log("Handling product created event:", product);
  // Add your business logic here
}