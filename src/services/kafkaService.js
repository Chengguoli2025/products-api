const { Kafka } = require("kafkajs");
class KafkaService {
  constructor() {
    try {
      this.kafka = new Kafka({
        clientId: "my-lambda-client",
        brokers: process.env.KAFKA_BROKERS.split(","),
        ssl: true,
        sasl: {
          mechanism: "scram-sha-512",
          username: "products-api", // Username from your secret
          password: "product1234", // Password from your secret
        },
      });

      this.producer = this.kafka.producer({
        maxInFlightRequests: 1,
        idempotent: false,
        transactionTimeout: 10000,
      });

      this.topicName = `product-event-v1-${process.env.NODE_ENV || "dev"}`;
    } catch (error) {
      console.error("Failed to initialize Kafka service:", error.message);
    }
  }

  async publishProductCreated(product) {
    let connected = false;
    console.log("publishProductCreated called with product:", product);
    console.log("Kafka topic:", this.topicName);
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

module.exports = KafkaService;
