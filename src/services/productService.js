"use strict";

class ProductService {
  constructor() {
    // In-memory storage for demo - replace with database in production
    this.products = [
      {
        id: "1000",
        name: "Product 1",
        price: 29.99,
        description: "Sample product 1",
      },
      {
        id: "2000",
        name: "Product 2",
        price: 49.99,
        description: "Sample product 2",
      },
      {
        id: "3000",
        name: "Product 3",
        price: 19.99,
        description: "Sample product 3",
      },
    ];
  }

  getAllProducts() {
    return this.products;
  }

  getProductById(productId) {
    const product = this.products.find((p) => p.id === productId);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  addProduct(productData) {
    const newProduct = {
      id: Date.now().toString(),
      ...productData,
    };
    this.products.push(newProduct);
    return newProduct;
  }
}

module.exports = ProductService;
