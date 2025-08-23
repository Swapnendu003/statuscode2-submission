const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Deposit', 'Loan', 'Investment', 'Digital Banking', 'NRI Banking', 
           'Corporate Banking', 'Agricultural Banking', 'Financial Inclusion', 
           'Government Scheme', 'Insurance', 'Other']
  },
  targetCustomer: {
    ageRange: {
      min: { type: Number },
      max: { type: Number }
    },
    incomeRange: {
      min: { type: Number },
      max: { type: Number }
    },
    creditScoreRange: {
      min: { type: Number },
      max: { type: Number }
    },
    preferredGender: { type: String, enum: ['Any', 'Male', 'Female'] },
    requiredDocuments: [{ type: String }],
    idealFor: [{ type: String }] 
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Very High']
  },
  minBalance: {
    type: Number,
    default: 0
  },
  minTenure: {
    type: Number, // in years
    default: 0
  },
  specialInformation: {
    type: String,
    default: null
  },
  benefits: [{ type: String }],
  requirementsCriteria: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
