# Products API

A serverless REST API built with AWS Lambda, API Gateway, and DynamoDB for managing product data.

## Architecture

- **AWS Lambda** - Serverless functions for API endpoints
- **API Gateway** - HTTP API routing and management
- **DynamoDB** - NoSQL database for product storage
- **Parameter Store** - Secure configuration management
- **CloudFormation** - Infrastructure as Code

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- AWS CLI configured
- Jenkins (for CI/CD)

## Local Development

### Quick Start
```bash
# Install dependencies
npm install

# Start LocalStack + DynamoDB + API server
npm run dev
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Complete local setup (LocalStack + DynamoDB + API) |
| `npm run localstack:start` | Start LocalStack services only |
| `npm run localstack:stop` | Stop LocalStack services |
| `npm run setup:local` | Create DynamoDB table only |
| `npm run local:init` | Start LocalStack + create DynamoDB table |
| `npm run start` | Start API server only |

### Local Endpoints

- **API Base URL**: `http://localhost:3000`
- **Get All Products**: `GET /products`
- **Get Product**: `GET /products/{id}`
- **Add Product**: `POST /products`

### LocalStack Services

- **Endpoint**: `http://localhost:4566`
- **Services**: DynamoDB, S3, SSM Parameter Store
- **DynamoDB Table**: `products-local`

## Environment Configuration

### Local (.env.local)
```bash
NODE_ENV=local
PRODUCTS_TABLE=products-local
DB_PASSWORD=local_dev_password
JWT_SECRET=local_jwt_secret_key_123
STRIPE_SECRET=sk_test_local_stripe_key
```

### AWS Environments
- **Dev**: Uses Parameter Store `/products-api/dev/*`
- **Staging**: Uses Parameter Store `/products-api/staging/*`
- **Prod**: Uses Parameter Store `/products-api/prod/*`

## Deployment

### Infrastructure Pipeline
```bash
# Deploy infrastructure (API Gateway, Lambda, DynamoDB)
Jenkins Job: products-api-infra
Parameters: ACTION=deploy, ENVIRONMENT=dev|staging|prod
```

### CI/CD Pipeline
```bash
# Build and deploy application code
Jenkins Job: products-api-ci (builds artifact)
Jenkins Job: products-api-cd (deploys to Lambda)
```

## API Examples

### Get All Products
```bash
curl http://localhost:3000/products
```

### Add Product
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":29.99,"description":"A test product"}'
```

### Get Product by ID
```bash
curl http://localhost:3000/products/1
```

## Project Structure

```
├── src/
│   ├── handlers/           # Lambda function handlers
│   ├── services/          # Business logic services
│   └── config/            # Configuration management
├── infrastructure/        # CloudFormation templates
├── .env.*                # Environment configurations
├── docker-compose.yml    # LocalStack setup
├── serverless.yml        # Serverless framework config
└── Jenkinsfile.*         # CI/CD pipeline definitions
```

## Troubleshooting

### LocalStack Issues
```bash
# Check LocalStack status
docker-compose ps

# View LocalStack logs
docker-compose logs localstack

# Restart LocalStack
npm run localstack:stop && npm run localstack:start
```

### DynamoDB Issues
```bash
# List tables
aws --endpoint-url=http://localhost:4566 dynamodb list-tables

# Recreate table
npm run setup:local
```

### Lambda Issues
```bash
# Check Lambda logs in AWS
aws logs tail "/aws/lambda/products-api-getAllProducts-dev" --region ap-southeast-2
```

## Contributing

1. Create feature branch
2. Test locally with `npm run dev`
3. Commit changes
4. Push to trigger CI/CD pipeline
5. Deploy via Jenkins jobs