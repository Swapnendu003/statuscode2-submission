const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    customerId: {
        type: Number,
        required: true,
    },
    creditScore: {
        type: Number,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    tenure: {
        type: Number,
        required: true,
    },
    balance: {
        type: Number,
        required: true,
    },
    productNumbers: {
        type: Number,
        required: true,
    },
    creditCard: {
        type: Number,
        required: true,
    },
    activeMember: {
        type: Number,
        required: true,
    },
    estimatedSalary: {
        type: Number,
        required: true,
    },
    churn: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: false,
    },
    location: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
    }
});

module.exports = {
    Data: mongoose.model('Data', userSchema, 'Data'),
};
