const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');

const ssmClient = new SSMClient({ region: process.env.AWS_DEFAULT_REGION || 'ap-southeast-2' });

// Load secrets from AWS Parameter Store
async function loadParameterStoreSecrets() {
  const secretKeys = [
    'DB_PASSWORD',
    'JWT_SECRET', 
    'STRIPE_SECRET'
  ];

  for (const secretKey of secretKeys) {
    const paramPath = process.env[secretKey];
    // Only load from Parameter Store if the value looks like a path
    if (paramPath && paramPath.startsWith('/')) {
      try {
        const command = new GetParameterCommand({
          Name: paramPath,
          WithDecryption: true
        });
        
        const response = await ssmClient.send(command);
        process.env[secretKey] = response.Parameter.Value;
        
        console.log(`Loaded ${secretKey} from Parameter Store`);
      } catch (error) {
        console.warn(`Failed to load ${secretKey}: ${error.message}`);
      }
    }
  }
}

module.exports = { loadParameterStoreSecrets };