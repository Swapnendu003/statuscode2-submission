const express = require('express');
const {
  getFinancialAdvice,
  getBatchRecommendations
} = require('../controllers/financialController');

const router = express.Router();

router.post('/advice', getFinancialAdvice);

router.post('/batch-recommendations', getBatchRecommendations);

module.exports = router;
