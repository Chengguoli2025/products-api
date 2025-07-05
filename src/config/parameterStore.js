const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");

const ssmClient = new SSMClient({
  region: process.env.AWS_DEFAULT_REGION || "ap-southeast-2",
});

/**
 * Loads secrets from AWS Parameter Store and sets them in process.env.
 * Only replaces env vars whose value looks like a parameter path (starts with '/').
 * @param {string[]} [secretKeys] - Optional array of env var names to load. Defaults to common secrets.
 */
async function loadParameterStoreSecrets(
  secretKeys = ["DB_PASSWORD", "JWT_SECRET", "STRIPE_SECRET"]
) {
  for (const secretKey of secretKeys) {
    const paramPath = process.env[secretKey];
    if (paramPath && paramPath.startsWith("/")) {
      try {
        const command = new GetParameterCommand({
          Name: paramPath,
          WithDecryption: true,
        });
        const response = await ssmClient.send(command);
        process.env[secretKey] = response.Parameter.Value;
        console.log(`Loaded ${secretKey} from Parameter Store`);
      } catch (error) {
        console.warn(
          `Failed to load ${secretKey} from Parameter Store: ${error.message}`
        );
      }
    }
  }
}

module.exports = { loadParameterStoreSecrets };
