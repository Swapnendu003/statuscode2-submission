const express = require('express');
const {
  getProductsBasicInfo,
  getProductDetails,
  getAllProducts
} = require('../controllers/productController');
const router = express.Router();
router.get('/basic', getProductsBasicInfo);
router.get('/:id', getProductDetails);
router.get('/', getAllProducts);
module.exports = router;
