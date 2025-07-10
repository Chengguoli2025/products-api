const { Kafka } = require("kafkajs");

class KafkaService {
  constructor() {
    this.kafka = new Kafka({
      clientId: "products-api",
      brokers: process.env.KAFKA_BROKERS.split(","),
    });
    this.producer = this.kafka.producer();
    this.topicName = `product-event-v1-${process.env.NODE_ENV || "dev"}`;
  }

  async publishProductCreated(product) {
    try {
      await this.producer.connect();

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
      console.error("Failed to publish product created event:", error);
      throw error;
    } finally {
      await this.producer.disconnect();
    }
  }
}

module.exports = KafkaService;
