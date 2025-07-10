const { Kafka } = require("kafkajs");
const {
  MskIamAuthenticationMechanism,
} = require("@jm18457/kafkajs-msk-iam-authentication-mechanism");

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
        connectionTimeout: 5000,
        requestTimeout: 10000,
        retry: {
          retries: 2,
          initialRetryTime: 300,
        },
        ssl: true,
        sasl: {
          mechanism: "aws-msk-iam",
          authenticationProvider: new MskIamAuthenticationMechanism({
            region: process.env.AWS_REGION || "ap-southeast-2",
            // Lambda automatically provides these environment variables
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN,
          }),
        },
      });

      this.producer = this.kafka.producer({
        maxInFlightRequests: 1,
        idempotent: false,
        transactionTimeout: 10000,
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
      console.log("Available AWS credentials:", {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ? "Present" : "Missing",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
          ? "Present"
          : "Missing",
        sessionToken: process.env.AWS_SESSION_TOKEN ? "Present" : "Missing",
        region: process.env.AWS_REGION || "ap-southeast-2",
      });

      // Add explicit timeout wrapper
      const connectWithTimeout = () => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(
              new Error(
                "Connection timeout after 8 seconds - likely VPC/network issue"
              )
            );
          }, 8000);

          this.producer
            .connect()
            .then(() => {
              clearTimeout(timeout);
              resolve();
            })
            .catch((err) => {
              clearTimeout(timeout);
              reject(err);
            });
        });
      };

      await connectWithTimeout();
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

      // Additional debugging info
      if (error.message.includes("timeout")) {
        console.error("NETWORK ISSUE: Lambda likely cannot reach MSK cluster");
        console.error("SOLUTION: Put Lambda in same VPC as MSK cluster");
      }

      if (error.message.includes("SASL")) {
        console.error("SASL authentication failed - check IAM permissions");
        console.error("Ensure Lambda has proper MSK IAM permissions");
      }

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
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

module.exports = KafkaService;
