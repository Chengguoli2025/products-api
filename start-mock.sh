#!/bin/bash

echo "🚀 Starting LocalStack Mock Environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1 failed${NC}"
        exit 1
    fi
}

# Start LocalStack
echo -e "${BLUE}📦 Starting LocalStack containers...${NC}"
docker-compose up -d
check_status "LocalStack started"

# Wait for LocalStack to be ready
echo -e "${YELLOW}⏳ Waiting for LocalStack to be ready...${NC}"
sleep 10

# Check LocalStack health
echo -e "${BLUE}🏥 Checking LocalStack health...${NC}"
curl -s http://localhost:4566/_localstack/health > /dev/null
check_status "LocalStack health check"

# Setup DynamoDB
echo -e "${BLUE}🗄️  Creating DynamoDB table...${NC}"
aws --endpoint-url=http://localhost:4566 dynamodb create-table \
    --table-name products-local \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST > /dev/null
check_status "DynamoDB table created"

# Setup SSM Parameters
echo -e "${BLUE}🔐 Creating SSM parameters...${NC}"
aws --endpoint-url=http://localhost:4566 ssm put-parameter \
    --name '/products-api/local/db-password' \
    --value 'local_dev_password' \
    --type 'SecureString' > /dev/null
aws --endpoint-url=http://localhost:4566 ssm put-parameter \
    --name '/products-api/local/jwt-secret' \
    --value 'local_jwt_secret_key_123' \
    --type 'SecureString' > /dev/null
aws --endpoint-url=http://localhost:4566 ssm put-parameter \
    --name '/products-api/local/stripe-secret' \
    --value 'sk_test_local_stripe_key' \
    --type 'SecureString' > /dev/null
check_status "SSM parameters created"

# Setup S3 Buckets
echo -e "${BLUE}🪣 Creating S3 buckets...${NC}"
aws --endpoint-url=http://localhost:4566 s3 mb s3://products-api-local > /dev/null
aws --endpoint-url=http://localhost:4566 s3 mb s3://products-api-uploads-local > /dev/null
check_status "S3 buckets created"

# Display summary
echo -e "\n${GREEN}🎉 LocalStack Mock Environment Ready!${NC}"
echo -e "\n${BLUE}📋 Available Services:${NC}"
echo -e "  • LocalStack:     http://localhost:4566"
echo -e "  • DynamoDB Admin: http://localhost:8001"
echo -e "  • API Server:     http://localhost:3000 (run 'npm start')"

echo -e "\n${BLUE}📊 Created Resources:${NC}"
echo -e "  • DynamoDB Table: products-local"
echo -e "  • S3 Buckets:     products-api-local, products-api-uploads-local"
echo -e "  • SSM Parameters: /products-api/local/* (3 parameters)"

echo -e "\n${BLUE}🛠️  Management Commands:${NC}"
echo -e "  • List S3:        npm run s3:list"
echo -e "  • List SSM:       npm run ssm:list"
echo -e "  • Start API:      npm start"
echo -e "  • Stop LocalStack: npm run localstack:stop"

echo -e "\n${YELLOW}💡 Next: Run 'npm start' to start the API server${NC}"