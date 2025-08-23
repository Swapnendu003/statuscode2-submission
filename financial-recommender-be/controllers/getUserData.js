const { Data } = require('../models/userData');
const mongoose = require('mongoose');

const getUserData = async (req, res) => {
    const { customerId } = req.body;
    try {
        const userData = await Data.findOne({ _id: new mongoose.Types.ObjectId(customerId) });
        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const getUserDataByCustId = async (req, res) => {
    const { customerId } = req.body;
    try {
        const userData = await Data.findOne({ customerId: customerId });
        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const allUsers = await Data.find({});
        res.status(200).json(allUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getUserData, getAllUsers, getUserDataByCustId };
