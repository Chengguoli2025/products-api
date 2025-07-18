const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { getAWSConfig } = require('../config/awsConfig');
const KafkaService = require('./kafkaService');

class DynamoProductService {
  constructor() {
    const client = new DynamoDBClient(getAWSConfig());
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.PRODUCTS_TABLE || `products-${process.env.NODE_ENV || 'dev'}`;
  }

  async getAllProducts() {
    try {
      const command = new ScanCommand({
        TableName: this.tableName
      });
      
      const response = await this.docClient.send(command);
      return response.Items || [];
    } catch (error) {
      console.error('Error getting all products:', error);
      throw new Error('Failed to retrieve products');
    }
  }

  async getProductById(productId) {
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: { id: productId }
      });
      
      const response = await this.docClient.send(command);
      
      if (!response.Item) {
        throw new Error('Product not found');
      }
      
      return response.Item;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      if (error.message === 'Product not found') {
        throw error;
      }
      throw new Error('Failed to retrieve product');
    }
  }

  async addProduct(productData) {
    try {
      const product = {
        id: Date.now().toString(),
        name: productData.name,
        price: productData.price,
        description: productData.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const command = new PutCommand({
        TableName: this.tableName,
        Item: product
      });
      
      await this.docClient.send(command);
      
      // Publish product created event to Kafka
      const kafkaService = new KafkaService();
      await kafkaService.publishProductCreated(product);
      
      return product;
    } catch (error) {
      console.error('Error adding product:', error);
      throw new Error('Failed to add product');
    }
  }
}

module.exports = DynamoProductService;