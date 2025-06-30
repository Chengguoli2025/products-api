"use strict";

class ProductService {
  constructor() {
    // In-memory storage for demo - replace with database in production
    this.products = [
      { id: "1", name: "Product 1", price: 29.99, description: "Sample product 1" },
      { id: "2", name: "Product 2", price: 49.99, description: "Sample product 2" }
    ];
  }

  getAllProducts() {
    return this.products;
  }

  getProductById(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  addProduct(productData) {
    const newProduct = {
      id: Date.now().toString(),
      ...productData
    };
    this.products.push(newProduct);
    return newProduct;
  }
}

module.exports = ProductService;