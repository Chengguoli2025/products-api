const { Kafka } = require("kafkajs");
const { fromNodeProviderChain } = require("@aws-sdk/credential-providers");
const {
  awsIamAuthenticator,
} = require("@jm18457/kafkajs-msk-iam-authentication-mechanism");

class KafkaService {
  constructor() {
    try {
      this.kafka = new Kafka({
        clientId: "my-lambda-client",
        brokers: [
          "b-1-public.mypublicmskcluster.amazonaws.com:9198",
          "b-2-public.mypublicmskcluster.amazonaws.com:9198",
          "b-3-public.mypublicmskcluster.amazonaws.com:9198",
        ],
        ssl: true,
        sasl: {
          mechanism: "aws-msk-iam",
          authenticationProvider: awsIamAuthenticator({
            region: "ap-southeast-2",
            credentials: fromNodeProviderChain(),
          }),
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
