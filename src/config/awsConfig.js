/**
 * Shared AWS configuration for LocalStack and production environments
 */
function getAWSConfig() {
  const config = {
    region: process.env.AWS_DEFAULT_REGION || 'ap-southeast-2',
  };

  // Use LocalStack endpoint for local development
  if (process.env.NODE_ENV === 'local' || process.env.IS_OFFLINE) {
    config.endpoint = 'http://localhost:4566';
    config.credentials = {
      accessKeyId: 'test',
      secretAccessKey: 'test'
    };
  }

  return config;
}

module.exports = { getAWSConfig };