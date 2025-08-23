const dotenv = require("dotenv");
const { Product } = require("../models/productData"); 
const mongoose = require("mongoose");
dotenv.config();
const connectDB = require("../config/database");

const products = [
  {
    name: "Small Cap Equity Fund",
    description: "Aggressive equity fund investing in small-cap companies with high growth potential but higher volatility.",
    category: "Investment",
    targetCustomer: {
      ageRange: {
        min: 25,
        max: 40
      },
      incomeRange: {
        min: 800000,
        max: 3000000
      },
      creditScoreRange: {
        min: 700,
        max: 900
      },
      preferredGender: "Any",
      requiredDocuments: [
        "PAN Card",
        "Aadhaar Card",
        "KYC Documents",
        "Bank Statement"
      ],
      idealFor: [
        "Risk-tolerant investors",
        "Early career professionals"
      ]
    },
    riskLevel: "High",
    minBalance: 10000,
    minTenure: 7,
    specialInformation: "High volatility expected. Recommended for investors with high risk tolerance.",
    benefits: [
      "Potential for outsized returns",
      "Exposure to emerging businesses",
      "Long-term wealth creation",
      "Diversification benefits"
    ],
    requirementsCriteria: "KYC compliance mandatory. Investment horizon of at least 7 years recommended."
  },
  {
    name: "Child Education Insurance Plan",
    description: "Combined insurance and investment plan designed to secure child's future education needs.",
    category: "Insurance",
    targetCustomer: {
      ageRange: {
        min: 21,
        max: 50
      },
      incomeRange: {
        min: 400000,
        max: 2000000
      },
      creditScoreRange: {
        min: 650,
        max: 850
      },
      preferredGender: "Any",
      requiredDocuments: [
        "ID Proof",
        "Address Proof",
        "Child's Birth Certificate"
      ],
      idealFor: [
        "Parents with young children",
        "Education planning"
      ]
    },
    riskLevel: "Medium",
    minBalance: 15000,
    minTenure: 10,
    specialInformation: "Structured payouts corresponding to child's educational milestones.",
    benefits: [
      "Guaranteed education funding",
      "Waiver of premium on parent's death",
      "Partial withdrawals for emergency needs",
      "Tax benefits under Section 80C and 10(10D)"
    ],
    requirementsCriteria: "Child should be below 15 years of age at policy inception. Premium payment term options from 5-20 years."
  },
  {
    name: "Debt Income Fund",
    description: "A conservative debt fund investing in government securities and high-rated corporate bonds for regular income.",
    category: "Investment",
    targetCustomer: {
      ageRange: {
        min: 40,
        max: 70
      },
      incomeRange: {
        min: 300000,
        max: 2000000
      },
      creditScoreRange: {
        min: 600,
        max: 850
      },
      preferredGender: "Any",
      requiredDocuments: [
        "PAN Card",
        "Aadhaar Card",
        "KYC Documents"
      ],
      idealFor: [
        "Retirees",
        "Conservative investors",
        "Income seekers"
      ]
    },
    riskLevel: "Low",
    minBalance: 10000,
    minTenure: 1,
    specialInformation: "More stable returns compared to equity funds but lower growth potential.",
    benefits: [
      "Stable returns",
      "Lower volatility than equity funds",
      "Regular income option available",
      "Liquidity within 2-3 business days"
    ],
    requirementsCriteria: "KYC compliance mandatory. Investment horizon of at least 1 year recommended."
  },
  {
    name: "Commodity Trading Account",
    description: "Trading platform for commodities like gold, silver, crude oil, and agricultural products.",
    category: "Investment",
    targetCustomer: {
      ageRange: {
        min: 30,
        max: 55
      },
      incomeRange: {
        min: 1000000,
        max: 5000000
      },
      creditScoreRange: {
        min: 750,
        max: 900
      },
      preferredGender: "Any",
      requiredDocuments: [
        "PAN Card",
        "Aadhaar Card",
        "Income Proof",
        "Bank Statement",
        "Demat Account"
      ],
      idealFor: [
        "Active traders",
        "Market enthusiasts",
        "Diversified investors"
      ]
    },
    riskLevel: "High",
    minBalance: 25000,
    minTenure: 1,
    specialInformation: "Trading in commodities involves substantial risk of loss and is not suitable for all investors.",
    benefits: [
      "Hedge against inflation",
      "Portfolio diversification",
      "Trading opportunities in multiple markets",
      "Lower correlation with equity markets"
    ],
    requirementsCriteria: "Trading experience preferred. Margin requirements apply. Daily settlement of mark-to-market positions."
  },
  {
    name: "Education Loan",
    description: "Specialized loan for higher education in India or abroad with moratorium period during study.",
    category: "Loan",
    targetCustomer: {
      ageRange: {
        min: 18,
        max: 35
      },
      incomeRange: {
        min: 200000,
        max: 1500000
      },
      creditScoreRange: {
        min: 650,
        max: 900
      },
      preferredGender: "Any",
      requiredDocuments: [
        "Admission Letter",
        "Course Details",
        "Academic Records",
        "Co-applicant Details",
        "Collateral Documents (for loans > 4 lakhs)"
      ],
      idealFor: [
        "Students pursuing higher education",
        "Professional courses",
        "Study abroad aspirants"
      ]
    },
    riskLevel: "Medium",
    minBalance: 50000,
    minTenure: 5,
    specialInformation: "Interest subsidy available for economically weaker sections under CSIS scheme. Moratorium period covers course duration plus 6-12 months.",
    benefits: [
      "No repayment during study period",
      "Tax benefits under Section 80E on interest payment",
      "Covers tuition fees, hostel fees, books, equipment",
      "No prepayment penalties"
    ],
    requirementsCriteria: "Admission to recognized institution. Co-applicant (usually parent) required. Collateral needed for loans above Rs. 4 lakhs for Indian education and Rs. 7.5 lakhs for foreign education."
  },
  {
    name: "Senior Citizen Savings Scheme",
    description: "Government-backed savings scheme offering high returns and tax benefits for senior citizens.",
    category: "Deposit",
    targetCustomer: {
      ageRange: {
        min: 60,
        max: 90
      },
      incomeRange: {
        min: 200000,
        max: 1500000
      },
      creditScoreRange: {
        min: 600,
        max: 900
      },
      preferredGender: "Any",
      requiredDocuments: [
        "Age Proof",
        "Address Proof",
        "PAN Card",
        "Aadhaar Card",
        "Passport Size Photo"
      ],
      idealFor: [
        "Retirees",
        "Senior citizens seeking guaranteed returns",
        "Pension planning"
      ]
    },
    riskLevel: "Low",
    minBalance: 1000,
    minTenure: 5,
    specialInformation: "Interest rates set by government and revised quarterly. Current rate is 8.2% p.a. (as of 2023). Maximum investment limit of Rs. 15 lakhs.",
    benefits: [
      "Higher interest rate than regular FDs",
      "Quarterly interest payout",
      "Tax benefits under Section 80C",
      "Premature withdrawal allowed after 1 year (with penalty)"
    ],
    requirementsCriteria: "Minimum age of 60 years (55 years for those who have retired under VRS). Joint account allowed only with spouse. Can be opened at post offices and authorized banks."
  },
  {
    name: "Balanced Advantage Fund",
    description: "A dynamic asset allocation fund that adjusts equity and debt exposure based on market conditions.",
    category: "Investment",
    targetCustomer: {
      ageRange: {
        min: 30,
        max: 60
      },
      incomeRange: {
        min: 400000,
        max: 2000000
      },
      creditScoreRange: {
        min: 650,
        max: 850
      },
      preferredGender: "Any",
      requiredDocuments: [
        "PAN Card",
        "Aadhaar Card",
        "KYC Documents"
      ],
      idealFor: [
        "First-time investors",
        "Risk-averse equity investors"
      ]
    },
    riskLevel: "Medium",
    minBalance: 5000,
    minTenure: 3,
    specialInformation: "Dynamic allocation between equity and debt based on market valuations.",
    benefits: [
      "Automatic asset rebalancing",
      "Reduced market timing risk",
      "Better downside protection",
      "Tax efficiency"
    ],
    requirementsCriteria: "KYC compliance mandatory. SIP option available from Rs. 1,000 per month."
  },
  {
    name: "National Pension System (NPS)",
    description: "Voluntary retirement savings scheme aimed at providing retirement income along with tax benefits.",
    category: "Investment",
    targetCustomer: {
      ageRange: {
        min: 18,
        max: 65
      },
      incomeRange: {
        min: 300000,
        max: 1500000
      },
      creditScoreRange: {
        min: 600,
        max: 850
      },
      preferredGender: "Any",
      requiredDocuments: [
        "PAN Card",
        "Aadhaar Card",
        "Bank Account Details",
        "Address Proof"
      ],
      idealFor: [
        "Salaried individuals",
        "Professionals",
        "Tax-conscious investors"
      ]
    },
    riskLevel: "Medium",
    minBalance: 500,
    minTenure: 15,
    specialInformation: "Flexible investment options across equity, corporate debt, government securities, and alternative investments.",
    benefits: [
      "Tax benefits under Section 80CCD(1) and 80CCD(1B)",
      "Flexibility to choose investment mix",
      "Option for partial withdrawal for specific needs",
      "Low fund management charges"
    ],
    requirementsCriteria: "Minimum contribution of Rs. 500 per month or Rs. 1,000 per annum. PRAN (Permanent Retirement Account Number) required."
  },
  {
    name: "Term Life Insurance Plan",
    description: "Pure protection plan offering high life cover at affordable premiums with no maturity benefits.",
    category: "Insurance",
    targetCustomer: {
      ageRange: {
        min: 21,
        max: 65
      },
      incomeRange: {
        min: 250000,
        max: 2000000
      },
      creditScoreRange: {
        min: 650,
        max: 900
      },
      preferredGender: "Any",
      requiredDocuments: [
        "ID Proof",
        "Address Proof",
        "Income Proof",
        "Medical Reports (if required)"
      ],
      idealFor: [
        "Primary breadwinners",
        "Those with dependents",
        "Loan holders"
      ]
    },
    riskLevel: "Low",
    minBalance: 3000,
    minTenure: 10,
    specialInformation: "Covers death during policy term. No survival or maturity benefits.",
    benefits: [
      "High sum assured at low premium",
      "Tax benefits under Section 80C and 10(10D)",
      "Rider options for critical illness, accidental death",
      "Option to increase cover at life stages"
    ],
    requirementsCriteria: "Medical examination may be required based on age, sum assured and health declaration."
  },
  {
    name: "MSME Business Loan",
    description: "Customized loan for micro, small and medium enterprises to meet working capital or expansion needs.",
    category: "Loan",
    targetCustomer: {
      ageRange: {
        min: 21,
        max: 65
      },
      incomeRange: {
        min: 500000,
        max: 5000000
      },
      creditScoreRange: {
        min: 700,
        max: 900
      },
      preferredGender: "Any",
      requiredDocuments: [
        "Business Registration Proof",
        "GST Registration",
        "ITR for 2 years",
        "Bank Statements",
        "Business Plan"
      ],
      idealFor: [
        "Small business owners",
        "Manufacturers",
        "Service providers",
        "Retailers"
      ]
    },
    riskLevel: "Medium",
    minBalance: 100000,
    minTenure: 1,
    specialInformation: "Available under MUDRA scheme (for loans up to 10 lakhs) and CGTMSE scheme for collateral-free loans up to 2 crores.",
    benefits: [
      "Collateral-free options available",
      "Flexible repayment options",
      "Lower interest rates under government schemes",
      "Quick processing and disbursal"
    ],
    requirementsCriteria: "Business vintage of at least 2 years preferred. Positive net worth and profitable operations. GST registration for businesses with turnover above threshold."
  },
  {
    name: "Home Loan",
    description: "Long-term loan for purchasing, constructing, or renovating residential property with competitive interest rates.",
    category: "Loan",
    targetCustomer: {
      ageRange: {
        min: 21,
        max: 70
      },
      incomeRange: {
        min: 300000,
        max: 3000000
      },
      creditScoreRange: {
        min: 700,
        max: 900
      },
      preferredGender: "Any",
      requiredDocuments: [
        "ID Proof",
        "Address Proof",
        "Income Documents",
        "Property Documents",
        "ITR for last 2 years"
      ],
      idealFor: [
        "First-time home buyers",
        "Property investors",
        "Home renovation needs"
      ]
    },
    riskLevel: "Medium",
    minBalance: 500000,
    minTenure: 5,
    specialInformation: "Interest rates linked to repo rate with reset every 3 months. Maximum loan up to 80% of property value.",
    benefits: [
      "Tax benefits on principal under Section 80C",
      "Tax benefits on interest under Section 24",
      "No prepayment penalties on floating rate loans",
      "Doorstep service for document collection"
    ],
    requirementsCriteria: "CIBIL score above 700 preferred. Maximum tenure up to 30 years. Age at loan maturity should not exceed 70 years."
  },
  {
    name: "Startup Venture Fund",
    description: "Alternative investment fund focused on early-stage startup investments with potential for exponential returns.",
    category: "Investment",
    targetCustomer: {
      ageRange: {
        min: 35,
        max: 60
      },
      incomeRange: {
        min: 2500000,
        max: 10000000
      },
      creditScoreRange: {
        min: 780,
        max: 900
      },
      preferredGender: "Any",
      requiredDocuments: [
        "PAN Card",
        "Aadhaar Card",
        "Income Tax Returns",
        "Net Worth Certificate",
        "KYC Documents"
      ],
      idealFor: [
        "High net worth individuals",
        "Angel investors",
        "Experienced investors"
      ]
    },
    riskLevel: "High",
    minBalance: 1000000,
    minTenure: 8,
    specialInformation: "Illiquid investment with lock-in period. High risk of capital loss but potential for significant returns.",
    benefits: [
      "Exposure to innovative startups",
      "Potential for outsized returns",
      "Portfolio diversification",
      "Participating in the growth story of emerging companies"
    ],
    requirementsCriteria: "Accredited investor status required. Minimum investment of Rs. 10 lakhs. Lock-in period of 5-7 years."
  },
  {
    name: "Equity Growth Fund",
    description: "A high-growth equity mutual fund focusing on large-cap Indian companies with strong potential for capital appreciation.",
    category: "Investment",
    targetCustomer: {
      ageRange: {
        min: 25,
        max: 45
      },
      incomeRange: {
        min: 500000,
        max: 2500000
      },
      creditScoreRange: {
        min: 650,
        max: 900
      },
      preferredGender: "Any",
      requiredDocuments: [
        "PAN Card",
        "Aadhaar Card",
        "KYC Documents",
        "Bank Statement"
      ],
      idealFor: [
        "Young professionals",
        "Long-term investors"
      ]
    },
    riskLevel: "High",
    minBalance: 5000,
    minTenure: 5,
    specialInformation: "Investment subject to market risks. Past performance is not indicative of future returns.",
    benefits: [
      "Potential for high returns",
      "Professionally managed portfolio",
      "Tax benefits under Section 80C (for ELSS funds)",
      "SIP option available"
    ],
    requirementsCriteria: "KYC compliance mandatory. Minimum investment of Rs. 5,000 required."
  }
];

const seedProducts = async () => {
  try {
    await connectDB();
    await Product.insertMany(products);
    console.log("✅ Seeded products successfully.");
  } catch (error) {
    console.error("❌ Product seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from DB.");
  }
};

seedProducts();