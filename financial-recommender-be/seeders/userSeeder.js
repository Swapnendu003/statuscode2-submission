// filepath: /Volumes/Biryani/bob-server-side/seeders/userSeeder.js
const mongoose = require('mongoose');
const { Data } = require('../models/userData');
const connectDB = require('../config/database');
const dotenv = require('dotenv');

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomBoolean = () => Math.round(Math.random());

// Indian city names for location
const indianCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Surat', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
  'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad'
];

const generateIndianName = () => {
  const firstNames = [
    'Aditya', 'Arjun', 'Arun', 'Ajay', 'Amit', 'Ananya', 'Aishwarya', 'Bhavya',
    'Chetan', 'Deepak', 'Divya', 'Esha', 'Farhan', 'Gaurav', 'Gitika', 'Harish',
    'Ishaan', 'Jaya', 'Kavita', 'Lakshmi', 'Manish', 'Neha', 'Nikhil', 'Pooja',
    'Rahul', 'Riya', 'Sanjay', 'Sandeep', 'Tanvi', 'Uday', 'Vani', 'Vikram'
  ];
  
  const lastNames = [
    'Sharma', 'Patel', 'Singh', 'Verma', 'Gupta', 'Joshi', 'Kumar', 'Rao',
    'Reddy', 'Malhotra', 'Shah', 'Mehta', 'Gandhi', 'Nair', 'Pillai', 'Chatterjee',
    'Mukherjee', 'Das', 'Sen', 'Bose', 'Banerjee', 'Agarwal', 'Mehra', 'Mishra'
  ];

  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const generateEmail = (name) => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com'];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  const nameParts = name.toLowerCase().split(' ');
  return `${nameParts[0]}.${nameParts[1]}${getRandomNumber(1, 999)}@${randomDomain}`;
};

const generateMockData = (customerId, name, email, location) => {
  const creditScore = getRandomNumber(300, 900);
  
  const age = getRandomNumber(21, 75);
  
  // Tenure in years (0-20)
  const tenure = getRandomNumber(0, 20);
  
  // Balance (varies based on credit score and age)
  let balanceBase;
  if (creditScore > 750) {
    balanceBase = getRandomNumber(50000, 1000000);
  } else if (creditScore > 600) {
    balanceBase = getRandomNumber(10000, 100000);
  } else {
    balanceBase = getRandomNumber(1000, 30000);
  }

  let salaryBase;
  if (age < 30) {
    salaryBase = getRandomNumber(300000, 1000000);
  } else if (age < 50) {
    salaryBase = getRandomNumber(600000, 2500000);
  } else {
    salaryBase = getRandomNumber(400000, 1800000);
  }
  
  const adjustedSalary = Math.round(salaryBase * (0.8 + (creditScore / 900) * 0.7));
  
  return {
    customerId,
    creditScore,
    country: 'India',
    gender: Math.random() > 0.5 ? 'Male' : 'Female',
    age,
    tenure,
    balance: balanceBase,
    productNumbers: getRandomNumber(1, 4), // Number of products
    creditCard: getRandomBoolean(), // Has credit card or not
    activeMember: getRandomBoolean(), // Is active member or not
    estimatedSalary: adjustedSalary,
    churn: getRandomNumber(0, 10) < 2 ? 1 : 0, // 20% churn rate
    name: name || generateIndianName(),
    location: location || indianCities[Math.floor(Math.random() * indianCities.length)],
    email: email || null
  };
};

// Seed the database
const seedDatabase = async () => {
  try {
    // Load environment variables
    dotenv.config();
    
    await connectDB();
    
    // Clear existing data
    await Data.deleteMany({});
    
    // Create specified users
    const specificUsers = [
      {
        customerId: 1001,
        name: 'Sagnik Datta',
        email: 'sagnikmis.datta@gmail.com',
        location: 'Kolkata'
      },
      {
        customerId: 1002,
        name: 'Swapnendu Banerjee',
        email: 'swaps.b003@gmail.com',
        location: 'Kolkata'
      },
      {
        customerId: 1003,
        name: 'Adrita Chakraborty',
        email: 'chakrabortyadrita04@gmail.com',
        location: 'Delhi'
      },
      {
        customerId: 1004,
        name: 'Moyukh Chowdhurry',
        email: 'moyukhforstudies@gmail.com',
        location: 'Mumbai'
      }
    ];
    
    const specificUserData = specificUsers.map(user => 
      generateMockData(user.customerId, user.name, user.email, user.location)
    );
    
    // Generate random users (100 additional users)
    const randomUserData = Array.from({ length: 100 }, (_, i) => {
      const name = generateIndianName();
      return generateMockData(1005 + i, name, generateEmail(name));
    });
    
    // Combine specific and random users
    const allUserData = [...specificUserData, ...randomUserData];
    
    // Insert all users to the specific collection
    await Data.insertMany(allUserData);
    
    console.log('Database seeded successfully! Data inserted into collection:', Data.collection.name);
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();