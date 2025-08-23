const Product = require('../models/Product');

exports.getProductsBasicInfo = async (req, res) => {
  try {
    const products = await Product.find({}, '_id name description');
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching basic product info:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

exports.getProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    
    // Handle invalid ID format
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const query = {};
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    const products = await Product.find(query);
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
