const express = require('express');
const { getUserData, getAllUsers, getUserDataByCustId } = require('../controllers/getUserData');
const datarouter = express.Router();

datarouter.post('/data', getUserData); 
datarouter.get('/data/all', getAllUsers);
datarouter.post('/data/custId', getUserDataByCustId); // Assuming you want to use POST for this route as well
module.exports = datarouter;
