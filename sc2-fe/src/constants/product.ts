export interface ProductCategory {
  name: string;
  products: string[];
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    name: "Deposit",
    products: [
      "Auto Fixed Deposit",
      "Credit Card against FD",
      "Digital FD",
      "Open Fixed Deposit",
      "Recurring Deposit",
      "Tax Saver Fixed Deposit"
    ]
  },
  {
    name: "Insurance",
    products: [
      "General Insurance for Home Travel Vehicle",
      "Health Insurance",
      "Insurance Partnerships",
      "Life Insurance",
      "Max Life Pradhan Mantri Jeevan Jyoti Bima Yojana",
      "Pradhan Mantri Suraksha Bima Yojana"
    ]
  },
  {
    name: "Loans",
    products: [
      "Business Loan",
      "Car Loan",
      "Education Loan",
      "Home Loan",
      "Mortgage Loan",
      "Personal Loan",
      "Two Wheeler Loan"
    ]
  },
  {
    name: "Mutual Funds",
    products: [

      "Axis Large Cap Fund",
      "Axis Focused Fund",
      "Axis ELSS Tax Saver Fund",
      "Axis Large & Mid Cap Fund",
      "Axis Flexi Cap Fund",
      "Axis Multicap Fund",
      "Axis Midcap Fund",
      "Axis Innovation Fund",
      "Axis Small Cap Fund",
      "Axis ESG Integration Strategy Fund",
      "Axis Quant Fund",
      "Axis Value Fund",
      "Axis Business Cycles Fund",
      "Axis India Manufacturing Fund",
      "Axis Consumption Fund",
      "Axis Momentum Fund",
      
      // ETFs
      "Axis NIFTY 50 ETF",
      "Axis NIFTY Bank ETF",
      "Axis NIFTY IT ETF",
      "Axis NIFTY Healthcare ETF",
      "Axis NIFTY India Consumption ETF",
      "Axis BSE Sensex ETF",
      "Axis Nifty500 Value 50 ETF",
      
      // Index Funds
      "Axis Nifty 100 Index Fund",
      "Axis Nifty 50 Index Fund",
      "Axis BSE Sensex Index Fund",
      "Axis Nifty Next 50 Index Fund",
      "Axis Nifty Smallcap 50 Index Fund",
      "Axis Nifty Midcap 50 Index Fund",
      "Axis Nifty IT Index Fund",
      "Axis Nifty Bank Index Fund",
      "Axis Nifty 500 Index Fund",
      "Axis Nifty500 Value 50 Index Fund",
      "Axis Nifty500 Momentum 50 Index Fund",
      
      // Fund of Funds
      "Axis Equity ETFs Fund of Fund",
      "Axis Global Equity Alpha Fund of Fund",
      "Axis Greater China Equity Fund of Fund",
      "Axis Global Innovation Fund of Fund",
      "Axis Nasdaq 100 Fund of Fund",
      
      // Debt Funds
      "Axis Overnight Fund",
      "Axis Liquid Fund",
      "Axis Ultra Short Duration Fund",
      "Axis Floater Fund",
      "Axis Treasury Advantage Fund",
      "Axis Money Market Fund",
      "Axis Corporate Bond Fund",
      "Axis Banking & PSU Debt Fund",
      "Axis Short Duration Fund",
      "Axis Credit Risk Fund",
      "Axis Dynamic Bond Fund",
      "Axis Strategic Bond Fund",
      "Axis Long Duration Fund",
      "Axis Gilt Fund",
      
      "Axis Nifty AAA Bond Plus SDL Apr 2026 50:50 ETF",
      "Axis Nifty AAA Bond Plus SDL Apr 2026 50:50 ETF FOF",
      "Axis US Treasury Dynamic Bond ETF Fund of Fund",
      "Axis CRISIL IBX SDL May 2027 Index Fund",
      "Axis Nifty SDL September 2026 Debt Index Fund",
      "Axis Crisil IBX 50:50 Gilt Plus SDL June 2028 Index Fund",
      "Axis Crisil IBX 50:50 Gilt Plus SDL September 2027 Index Fund",
      "Axis CRISIL IBX SDL June 2034 Debt Index Fund",
      "Axis CRISIL IBX AAA Bond NBFC Jun 2027 Index Fund",
      "Axis CRISIL-IBX AAA Bond Financial Services - Sep 2027 Index Fund",
      "Axis CRISIL-IBX AAA Bond NBFC-HFC - JUN 2027 Index Fund",
      
      // Hybrid & Solution Oriented
      "Axis Conservative Hybrid Fund",
      "Axis Equity Savings Fund",
      "Axis Multi Asset Allocation Fund",
      "Axis Aggressive Hybrid Fund",
      "Axis Children's Fund",
      "Axis Balanced Advantage Fund",
      "Axis Arbitrage Fund",
      "Axis Retirement Fund - Aggressive Plan",
      "Axis Retirement Fund - Dynamic Plan",
      "Axis Retirement Fund - Conservative Plan",
      "Axis Income Plus Arbitrage Active FOF",
      
      // Commodity
      "Axis Gold Fund",
      "Axis Silver ETF",
      "Axis Gold ETF",
      "Axis Silver Fund of Fund"
    ]
  },
  {
    name: "Government Schemes",
    products: [
      "Public Provident Fund",
      "Sukanya Samriddhi Yojana",
      "Kisan Vikas Patra",
      "Atal Pension Yojana",

    ]
  }
];

// Helper function to get all product names
export const getAllProductNames = (): string[] => {
  return PRODUCT_CATEGORIES.reduce((acc, category) => {
    return [...acc, ...category.products];
  }, [] as string[]);
};

// Helper function to get products by category
export const getProductsByCategory = (categoryName: string): string[] => {
  const category = PRODUCT_CATEGORIES.find(cat => cat.name === categoryName);
  return category ? category.products : [];
};
