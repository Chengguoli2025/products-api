const fs = require('fs');
const path = require('path');
const { loadParameterStoreSecrets } = require('./parameterStore');

// Load environment variables from .env file
async function loadEnvConfig() {
  const env = process.env.NODE_ENV || 'local';
  const envPath = path.join(__dirname, '../..', `.env.${env}`);
  
  try {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Parse .env file
      envContent.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          const value = valueParts.join('=');
          
          if (key && value && !process.env[key]) {
            process.env[key] = value;
          }
        }
      });
      
      console.log(`Loaded environment config for: ${env}`);
      
      // Load secrets from Parameter Store (only in Lambda)
      if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
        await loadParameterStoreSecrets();
      }
    } else {
      console.log(`No config file found at: ${envPath}`);
    }
  } catch (error) {
    console.error('Error loading environment config:', error.message);
  }
}

module.exports = { loadEnvConfig };