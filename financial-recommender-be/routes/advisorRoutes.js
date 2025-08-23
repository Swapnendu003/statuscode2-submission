const express = require('express');
// const  retrieveAndGenerate = require('../controllers/retrieveGenerateCOntroller');
const retrieveAndGenerate = require('../controllers/parallelGenerateController');


const router = express.Router();

router.post('/schemes', retrieveAndGenerate);


module.exports = router;
