const { Kafka } = require("kafkajs");

class KafkaService {
  constructor() {
    try {
      if (!process.env.KAFKA_BROKERS) {
        console.error("KAFKA_BROKERS environment variable is not set");
        this.disabled = true;
        return;
      }
      
      this.kafka = new Kafka({
        clientId: "products-api",
        brokers: process.env.KAFKA_BROKERS.split(","),
        connectionTimeout: 10000,
        requestTimeout: 30000,
      });
      this.producer = this.kafka.producer({
        maxInFlightRequests: 1,
        idempotent: false,
        transactionTimeout: 30000,
      });
      this.topicName = `product-event-v1-${process.env.NODE_ENV || "dev"}`;
      this.disabled = false;
    } catch (error) {
      console.error("Failed to initialize Kafka service:", error.message);
      this.disabled = true;
    }
  }

  async publishProductCreated(product) {
    if (this.disabled) {
      console.warn("Kafka service is disabled, skipping event publishing");
      return;
    }
    
    let connected = false;
    console.log("publishProductCreated called with product:", product);
    console.log("Kafka topic:", this.topicName);
    console.log("Kafka brokers:", process.env.KAFKA_BROKERS);
    
    try {
      console.log("Attempting to connect to Kafka producer...");
      
      await this.producer.connect();
      connected = true;
      console.log("Kafka producer connected successfully");
      await this.producer.send({
        topic: this.topicName,
        messages: [
          {
            key: product.id,
            value: JSON.stringify({
              eventType: "PRODUCT_CREATED",
              product,
              timestamp: new Date().toISOString(),
            }),
          },
        ],
      });

      console.log("Product created event published:", product.id);
    } catch (error) {
      console.error("Failed to publish product created event:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Error type:", error.constructor.name);
      // Don't throw error to avoid breaking product creation
      console.warn("Product creation will continue despite Kafka failure");
    } finally {
      if (connected) {
        try {
          await this.producer.disconnect();
        } catch (disconnectError) {
          console.error(
            "Error disconnecting Kafka producer:",
            disconnectError.message
          );
        }
      }
    }
  }
}

// Add global error handlers for debugging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

module.exports = KafkaService;
