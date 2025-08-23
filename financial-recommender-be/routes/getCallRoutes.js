const express = require('express');
const router = express.Router();
const { getAllCalls, getCallTranscription, getCallAnalysis } = require('../controllers/getCallData');

router.get('/all', getAllCalls);
router.get('/transcription/:egress_id', getCallTranscription);
router.get('/analysis/:egress_id', getCallAnalysis);

module.exports = router;