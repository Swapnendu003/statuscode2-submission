const express = require('express');
const  checkProductSuitability = require('../controllers/prodSuitabilityController');

const router = express.Router();

router.post('/suitable-customers', checkProductSuitability);


module.exports = router;
