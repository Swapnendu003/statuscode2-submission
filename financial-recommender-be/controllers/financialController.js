require('dotenv').config();
const OpenAI = require("openai");
const Product = require('../models/Product');
const { Data } = require('../models/userData');

const openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function fetchInterestRates() {
  try {
    const products = await Product.find({
      specialInformation: { $regex: /interest rate/i }
    });
    
    let interestRates = "Current Interest Rates:\n";
    
    if (products.length > 0) {
      products.forEach(product => {
        interestRates += `- ${product.name}: ${product.specialInformation}\n`;
      });
    } else {
      interestRates += "- Savings Account: 3.5% p.a.\n";
      interestRates += "- Fixed Deposit: 6.0% p.a.\n";
      interestRates += "- Recurring Deposit: 5.5% p.a.\n";
    }
    
    return interestRates;
  } catch (error) {
    console.error('Error fetching interest rates:', error);
    return "Interest rate information unavailable.";
  }
}

async function fetchProducts(filterProducts = null) {
  try {
    const products = filterProducts || await Product.find();
    let formattedProducts = "Available Banking Products:\n\n";
    
    const groupedProducts = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});
  
    Object.keys(groupedProducts).forEach((category, index) => {
      formattedProducts += `${index + 1}. ${category} Products:\n`;
      groupedProducts[category].forEach(product => {
        let productInfo = `   - ${product.name}: ${product.description}`;
        if (product.specialInformation) {
          productInfo += ` (${product.specialInformation})`;
        }
        formattedProducts += productInfo + '\n';
      });
      formattedProducts += '\n';
    });
    
    return formattedProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    return "Error retrieving product information.";
  }
}



exports.getFinancialAdvice = async (req, res) => {
  const {
    customer_id, credit_score, country, gender, age,
    tenure, balance, products_number, credit_card,
    active_member, estimated_salary, churn
  } = req.body;
  const interestRates = await fetchInterestRates();
  const products = await fetchProducts();

  const prompt = `
  Customer Information:
  - Customer ID: ${customer_id}
  - Credit Score: ${credit_score}
  - Country: ${country}
  - Gender: ${gender}
  - Age: ${age}
  - Tenure: ${tenure}
  - Balance: ${balance}
  - Number of Products: ${products_number}
  - Credit Card: ${credit_card}
  - Active Member: ${active_member}
  - Estimated Salary: ${estimated_salary}
  - Churn: ${churn}

  Based on the above customer information, think yourself as an Expert Bank Executive provide the following recommendations:
  1. Suggested Financial Instruments:
  2. Credit Improvement Programs:
  3. Savings Plans:
  4. Investment Options:
  5. Budgeting Tools:
  6. Educational Loans:

  Additional Information:
  ${interestRates}

  ${products} 
  Based on these create educational content and make a customised email
  `;

  try {
    const completion = await openAi.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    const modelResponse = completion.choices[0].message.content;
    res.json({ recommendations: modelResponse });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Error fetching recommendations' });
  }
};

exports.getBatchRecommendations = async (req, res) => {
  try {
    const { customers, productIds } = req.body;
    
    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid array of customer data'
      });
    }
    
    if (customers.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 customers can be processed at once'
      });
    }
    let allProducts;
    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      allProducts = await Product.find({ _id: { $in: productIds } });
      
      if (allProducts.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'None of the provided product IDs were found in the database'
        });
      }
    } else {
      allProducts = await Product.find();
    }
    
    const productsInfo = await fetchProducts(allProducts);
    const recommendations = await Promise.all(
      customers.map(async (customer) => {

        const {
          customer_id, credit_score, country, gender, age,
          tenure, balance, products_number, credit_card,
          active_member, estimated_salary, churn
        } = customer;
        const userDetails = await Data.findOne({ customerId: customer_id });
        
   
            const prompt = `
            Customer Profile:
            - Customer ID: ${customer_id}
            - Credit Score: ${credit_score}
            - Country: ${country}
            - Gender: ${gender}
            - Age: ${age}
            - Tenure: ${tenure} years
            - Balance: $${balance}
            - Number of Products: ${products_number}
            - Credit Card: ${credit_card === 1 ? 'Yes' : 'No'}
            - Active Member: ${active_member === 1 ? 'Yes' : 'No'}
            - Estimated Salary: $${estimated_salary}
            - Churn Risk: ${churn === 1 ? 'High' : 'Low'}

            ${productsInfo}

            Carefully analyze the above customer attributes and the available products. Recommend EXACTLY THREE DISTINCT banking products that are the best fit for this customer, prioritizing their suitability based on the customer's financial profile, needs, and risk factors. Your output must consist solely of the exact names of THREE DIFFERENT products from the list above, separated by commas, with no additional text or explanation.
            `;
          try {
            const completion = await openAi.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [{ role: "user", content: prompt }],
              max_tokens: 50,
              temperature: 0.3
            });

            const recommendedProductNames = completion.choices[0].message.content.trim().split(',').map(name => name.trim());

            if ( recommendedProductNames[0]) {
              bestProduct = allProducts.find(prod => 
                prod.name.toLowerCase().includes(recommendedProductNames[0].toLowerCase()));
            }
            
            if ( recommendedProductNames[1]) {
              secondProduct = allProducts.find(prod => 
                prod.name.toLowerCase().includes(recommendedProductNames[1].toLowerCase()));
            }
            
            if (recommendedProductNames[2]) {
              thirdProduct = allProducts.find(prod => 
                prod.name.toLowerCase().includes(recommendedProductNames[2].toLowerCase()));
            }
          } catch (error) {
            console.error(`Error with LLM recommendation for customer ${customer_id}:`, error);
          }
        

        const responseObj = {
          customer_id,
          recommendation: bestProduct ? {
            product_id: bestProduct._id,
            name: bestProduct.name,
            description: bestProduct.description,
            category: bestProduct.category,
            specialInformation: bestProduct.specialInformation,
            suitabilityFactors: bestProduct.targetCustomer ? [
              ...bestProduct.targetCustomer.idealFor || []
            ] : [],
            riskLevel: bestProduct.riskLevel || "Unknown",
            user_email: userDetails?.email || "",
            user_name: userDetails?.name || "",
          } : { error: "No suitable product found" }
        };
        if (secondProduct) {
          responseObj.recommendation.product_id2 = secondProduct._id;
          responseObj.recommendation.name2 = secondProduct.name;
          responseObj.recommendation.description2 = secondProduct.description;
          responseObj.recommendation.category2 = secondProduct.category;
          responseObj.recommendation.specialInformation2 = secondProduct.specialInformation;
          responseObj.recommendation.riskLevel2 = secondProduct.riskLevel || "Unknown";
          responseObj.recommendation.suitabilityFactors2 = secondProduct.targetCustomer ? [
            ...secondProduct.targetCustomer.idealFor || []
          ] : [];
      
        }
        if (thirdProduct) {
          responseObj.recommendation.product_id3 = thirdProduct._id;
          responseObj.recommendation.name3 = thirdProduct.name;
          responseObj.recommendation.description3 = thirdProduct.description;
          responseObj.recommendation.category3 = thirdProduct.category;
          responseObj.recommendation.specialInformation3 = thirdProduct.specialInformation;
          responseObj.recommendation.riskLevel3 = thirdProduct.riskLevel || "Unknown";
          responseObj.recommendation.suitabilityFactors3 = thirdProduct.targetCustomer ? [
            ...thirdProduct.targetCustomer.idealFor || []
          ] : [];
  
        }
        
        return responseObj;
      })
    );

    res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error('Error in batch recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Server error processing batch recommendations'
    });
  }
};
