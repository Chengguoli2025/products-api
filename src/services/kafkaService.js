const { Kafka } = require("kafkajs");

class KafkaService {
  constructor() {
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
  }

  async publishProductCreated(product) {
    let connected = false;
    try {
      await this.producer.connect();
      connected = true;

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
      // Don't throw error to avoid breaking product creation
      console.warn("Product creation will continue despite Kafka failure");
    } finally {
      if (connected) {
        try {
          await this.producer.disconnect();
        } catch (disconnectError) {
          console.error("Error disconnecting Kafka producer:", disconnectError.message);
        }
      }
    }
  }
}

module.exports = KafkaService;
