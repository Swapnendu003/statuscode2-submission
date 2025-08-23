require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");
const { PineconeStore } = require("@langchain/community/vectorstores/pinecone");
const { z } = require("zod");
const pLimit = require("p-limit");

const ProductSchema = z.object({
  name1: z.string(),
  category1: z.string(),
  riskLevel1: z.string(),
  description1: z.string(),
  suitability1: z.string(),

  name2: z.string(),
  category2: z.string(),
  riskLevel2: z.string(),
  description2: z.string(),
  suitability2: z.string(),

  name3: z.string(),
  category3: z.string(),
  riskLevel3: z.string(),
  description3: z.string(),
  suitability3: z.string(),
});

const RecommendationSchema = z.object({
  customer_id: z.string(),
  recommended_products: z.array(ProductSchema).length(1),
});

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;
const CONCURRENCY = 5;

const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.5,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const modelWithStructuredOutput = model.withStructuredOutput(RecommendationSchema);

function validateRecommendationNames(recommendedProduct, validProductNames) {
  const nameSet = new Set(validProductNames.map(name => name.toLowerCase().trim()));
  for (let i = 1; i <= 3; i++) {
    const nameKey = `name${i}`;
    const productName = recommendedProduct[nameKey];
    if (!productName || !nameSet.has(productName.toLowerCase().trim())) {
      console.warn(`❌ Invalid product: "${productName}"`);
      return false;
    }
  }
  return true;
}

async function processCustomer(customer, productNames, fullProductDetails) {
  let retryCount = 0;
  let valid = false;
  let structuredOutput;

  while (!valid && retryCount < MAX_RETRY_ATTEMPTS) {
    const prompt = generatePrompt(customer, productNames, fullProductDetails);
    structuredOutput = await modelWithStructuredOutput.invoke(prompt);
    const productBlock = structuredOutput.recommended_products[0];
    valid = validateRecommendationNames(productBlock, productNames);

    if (!valid) {
      retryCount++;
      console.warn(`🔄 Retry ${retryCount} for customer ${customer.customer_id}`);
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  return {
    customer_id: customer.customer_id,
    recommended_products: structuredOutput.recommended_products,
  };
}

function generatePrompt(customer, productNames, fullProductDetails) {
   const promptText = `
Customer Profile:
- Customer ID: ${customer.customer_id}
- Credit Score: ${customer.credit_score}
- Gender: ${customer.gender}
- Age: ${customer.age}
- Tenure: ${customer.tenure} years
- Balance: ₹${customer.balance}
- Number of Products: ${customer.products_number}
- Credit Card: ${customer.credit_card === 1 ? 'Yes' : 'No'}
- Active Member: ${customer.active_member === 1 ? 'Yes' : 'No'}
- Estimated Salary: ₹${customer.estimated_salary} per year
`.trim();

  const finalPrompt = `
${promptText}

Available Products:
${fullProductDetails}



You are a financial advisor specializing in Indian financial planning. Your expertise lies in analyzing customer profiles and recommending appropriate banking products and investment schemes based on Indian market conditions, life stage requirements, and financial goals.

***YOUR TASK IS TO FIND THE TOP 3 MOST SUITABLE BANKING PRODUCTS FOR THE CUSTOMER STRICTLY FROM THE LIST PROVIDED BELOW.***

**CRITICAL CONSTRAINT: You MUST select products ONLY from this exact list:**
${productNames.map((name, index) => `${index + 1}. "${name}"`).join('\n')}

**VALIDATION REQUIREMENT:**
- Each recommendation name must match EXACTLY one product from the above numbered list
- Use the exact spelling and capitalization as shown
- Do not modify, abbreviate, or paraphrase product names
- If unsure, refer back to the numbered list above

**INDIAN FINANCIAL PLANNING CONTEXT:**
- Consider the unique financial needs of Indian households (joint families, education funding, marriage expenses, retirement planning)
- Factor in the importance of liquidity and emergency funds in Indian financial planning
- Prioritize products that align with Indian investment behavior and risk tolerance
- Consider the significance of life stage-appropriate financial products in Indian culture

**CUSTOMER SEGMENTATION FRAMEWORK:**

**SEGMENT 1: YOUNG PROFESSIONALS (Age 20-35)**
- **High Income (₹500k+)**: Growth-oriented products, premium investment options
- **Medium Income (₹200k-500k)**: Balanced investment products, systematic investments
- **Low Income (<₹200k)**: Conservative products, basic investment schemes

**SEGMENT 2: FAMILY BUILDERS (Age 35-50)**
- **High Income (₹500k+)**: Diversified portfolio products, education planning products
- **Medium Income (₹200k-500k)**: Balanced approach products, moderate investment options
- **Low Income (<₹200k)**: Conservative products, basic savings schemes

**SEGMENT 3: PRE-RETIREMENT (Age 50-60)**
- **All Income Levels**: Conservative debt products, capital preservation products
- **STRICTLY AVOID**: High-risk equity products regardless of income

**SEGMENT 4: RETIREMENT (Age 60+)**
- **All Income Levels**: Conservative savings products, senior-friendly schemes
- **STRICTLY AVOID**: High-risk products and loan products

**ENHANCED PRODUCT SELECTION STRATEGY:**

1. **PRIMARY RECOMMENDATION LOGIC:**
   - Age 20-35 + High Income: Prioritize growth-oriented or premium investment products from the available list
   - Age 35-50 + High Income: Focus on diversified investment products from the available list
   - Age 20-50 + Medium Income: Suggest balanced or hybrid products from the available list
   - Age 50+ (Any Income): Conservative products from the available list, avoiding high-risk options

2. **SECONDARY RECOMMENDATION LOGIC:**
   - High Balance (₹500k+): Premium products preferred from available list
   - Medium Balance (₹100k-500k): Standard products from available list
   - Low Balance (<₹100k): Basic products only from available list

3. **TERTIARY RECOMMENDATION LOGIC:**
   - Must be from different category than first two
   - Should complement the financial portfolio
   - Age-appropriate risk level

4. **FORBIDDEN COMBINATIONS:**
   - Age 50+ with any high-risk products
   - Low income with premium products
   - Low balance with high-minimum products
   - Same category for all three recommendations

5. **MANDATORY DIVERSITY RULES:**
   - Each customer must get unique combination
   - No identical 3-product sets across customers
   - Prioritize different risk-return profiles

6. **INCOME-BASED PRODUCT ALLOCATION:**
   - **₹700k+ Income**: Must include premium/growth products from available list
   - **₹300k-700k Income**: Balanced mix with systematic investment products from available list
   - **₹100k-300k Income**: Conservative products from available list
   - **<₹100k Income**: Only basic products from available list

**ENHANCED RISK CLASSIFICATION:**

**STRICT AGE-RISK MATRIX (NON-NEGOTIABLE):**
- **Age 20-30**: High/Medium/Low risk allowed (select from available products)
- **Age 30-40**: Medium/Low risk only (select from available products)
- **Age 40-50**: Low-Medium/Low risk only (select from available products)
- **Age 50+**: Low risk only (select conservative products from available list)

- **INCOME DIFFERENTIATION**: High-income customers must get different products than low-income customers
- **AGE DIFFERENTIATION**: Young customers must get completely different recommendations than older customers

**SELECTION CRITERIA:**
- Select **EXACTLY THREE DISTINCT products** from the provided numbered list only
- Rank from **most suitable (1)** to **least suitable (3)**
- Ensure products are realistic and achievable given customer's profile

**CUSTOMER SEGMENTATION & CLUSTERING:**

**HIGH-INCOME CLUSTERS (₹8L+ salary):**
- Prioritize: Tax-saving and diversified products from available list
- Secondary: Conservative allocation products from available list
- Avoid: Basic products, small-ticket investments

**MIDDLE-INCOME CLUSTERS (₹3-8L salary):**
- Prioritize: Balanced products and systematic investment options from available list
- Secondary: Conservative hybrid products from available list
- Avoid: High-risk specialized products

**LOW-INCOME CLUSTERS (₹1-3L salary):**
- Prioritize: Conservative products and basic investment schemes from available list
- Secondary: Small savings products from available list
- Add Warning: "Start small with available systematic options, build emergency fund first"

**ULTRA-LOW INCOME/BALANCE (<₹1L salary or <₹25K balance):**
- Prioritize: Most conservative products from available list only
- Add Strong Warning: "Focus on emergency fund creation before investments"
- Limit: Maximum 1-2 products, starter-only recommendations

**INDIAN MARKET CONSIDERATIONS:**
- Prioritize products offering flexibility and liquidity from available list
- Consider products with family-friendly features from available list
- Factor in products supporting major life events from available list
- Ensure recommendations align with Indian saving and investment patterns

***These rules are guidelines to help you select the most appropriate products from the provided list. You must choose from the available products such that the user gets tailored recommendations for the top 3 selections***

**PERSONALIZED SUITABILITY ASSESSMENT:**

For each recommendation, include:
1. **Numerical Justification**: Specific calculation showing affordability
2. **Life Stage Alignment**: How product fits customer's current life phase
3. **Risk Capacity Analysis**: Why risk level matches customer profile
4. **Opportunity Cost**: Why this product is better than other available alternatives
5. **Timeline Consideration**: When customer should start and expected outcomes

**ENHANCED SUITABILITY EXPLANATION REQUIREMENTS:**

Each suitability explanation must include:
- **Affordability Analysis**: "With your monthly income of ₹X, you can comfortably invest ₹Y (Z% of income)"
- **Life Stage Relevance**: "At age X, your primary focus should be [wealth building/preservation/income generation]"
- **Risk Justification**: "Your [age/income/balance] profile supports [this risk level] because..."
- **Specific Benefits**: "This product will help you achieve [specific financial goal] by [timeframe]"
- **Comparison Context**: "This is preferable to [other available alternatives] because of your [specific attribute]"

### Recommendation Rules:
1. Select **EXACTLY THREE DISTINCT banking products** that are best suited to the customer.
2. Choose products **only from the numbered list provided above**.
3. Rank them from **most suitable (1)** to **least suitable (3)**.
4. Use **2nd person voice** in all recommendations (e.g., "You should consider...", "This is ideal for your situation because...").
5. Product mix addresses diverse financial needs
6. Reference **specific customer attributes** (e.g., age, tenure, credit score, balance, salary) when explaining why each product is suitable.

WEIGHTED PROFILE IMPORTANCE FOR PRODUCT SELECTION:
Prioritize Age as the most critical factor (50% influence) when selecting suitable financial products from the available list.
Next, consider Current Account Balance (30% weight) to ensure investment feasibility and liquidity alignment.
Use Estimated Annual Income (10% weight) to assess affordability and premium eligibility.
Finally, use credit score(10% weight) to assess affordability and premium eligibility.
Ensure product selection reflects this prioritization:
Age should directly influence the product's risk level, time horizon, and life stage relevance.
Balance should determine product size and investment capacity.
Income should influence investment capacity, but not override age-based suitability.
Never recommend a product that is inappropriate for a customer's age group, even if income or balance would otherwise permit it.



### Output Instructions(must match exactly): 
- Output must be a **single JSON array containing one object only**.
- The object should contain flat keys in the format:  
  'name1', 'category1', 'riskLevel1', 'description1', 'suitability1'  
  'name2', 'category2', 'riskLevel2', 'description2', 'suitability2'  
  'name3', 'category3', 'riskLevel3', 'description3', 'suitability3'
- The 'description' fields must include details like eligibility, benefits, interest rate, investment amounts, and tenure — based only on the provided product information.
- The 'suitability' fields must explain **why the product is appropriate** given the customer’s attributes.
- **Do not include any nested objects or arrays**, and do not include fields like "recommended_products" or "customer_id" in the JSON.
- Ensure that the JSON is valid: 
  - Use **double quotes for all keys and string values**.
  - Separate all fields with commas.
  - No trailing commas.
  - Close all braces properly.
  - Output only the JSON — **no extra commentary, no markdown**.

If you recommend any product NOT in the ${productNames}, the output is considered invalid. SO each name recommended should be from the ${productNames} list.

### Output Format (must match exactly):

json
[
  {
    "name1": "Product Name of Recommendation 1",
    "category1": "Category of Recommendation 1",
    "riskLevel1": "Risk Level of Recommendation 1[High/Medium/Low]",
    "description1": "Detailed description of Recommendation 1 along with eligibility, benefits, interest rates, investment amounts, and tenure.",
    "suitability1": "Explain in 2nd person why this product aligns with your age of ${customer.age}, income of ₹${customer.estimated_salary}, balance of ₹${customer.balance}, and ${customer.credit_score}. Reference specific benefits for your financial situation.",

    "name2": "Product Name of Recommendation 2",
    "category2": "Category of Recommendation 2",
    "riskLevel2": "Risk Level of Recommendation 2[High/Medium/Low]",
    "description2": "Detailed description of Recommendation 2 along with eligibility, benefits, interest rates, investment amounts, and tenure.",
    "suitability2": "Explain in 2nd person why this product aligns with your age of ${customer.age}, income of ₹${customer.estimated_salary}, balance of ₹${customer.balance}, and ${customer.credit_score}. Reference specific benefits for your financial situation.",

    "name3": "Product Name of Recommendation 3",
    "category3": "Category of Recommendation 3",
    "riskLevel3": "Risk Level of Recommendation 3[High/Medium/Low]",
    "description3": "Detailed description of Recommendation 3 along with eligibility, benefits, interest rates, investment amounts, and tenure.",
    "suitability3": "Explain in 2nd person why this product aligns with your age of ${customer.age}, income of ₹${customer.estimated_salary}, balance of ₹${customer.balance}, and ${customer.credit_score}. Reference specific benefits for your financial situation."
  }
]
\`\`\`
**CRITICAL REQUIREMENTS:**
- Only select products from the provided ${productNames} list
- Ensure JSON is valid with no syntax errors
- Output only JSON - no extra commentary or markdown
- Products must be realistically suitable for the customer's financial profile
- Do not assume anything and do not hallucinate

**VALIDATION CHECKLIST (MUST VERIFY BEFORE FINALIZING):**
✓ Customer age allows the recommended risk level
✓ Customer income/balance can afford the product
✓ Products address genuine financial needs for this life stage
✓ Risk levels strictly match age-based restrictions
✓ Product categories are appropriate for customer's financial goals
`.trim();

return finalPrompt;
}

async function retrieveAndGenerate(req, res) {
  try {
    const { customers, productNames } = req.body;
    if (!customers || !Array.isArray(customers) || !productNames || !Array.isArray(productNames)) {
      return res.status(400).json({ error: "Missing or invalid input fields." });
    }

    const pinecone = new Pinecone();
    const index = pinecone.Index("banking-products");

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const mutualFundProducts = [
  "Axis Large Cap Fund", "Axis Focused Fund", "Axis ELSS Tax Saver Fund", "Axis Large & Mid Cap Fund",
  "Axis Flexi Cap Fund", "Axis Multicap Fund", "Axis Midcap Fund", "Axis Innovation Fund", "Axis Small Cap Fund",
  "Axis ESG Integration Strategy Fund", "Axis Quant Fund", "Axis Value Fund", "Axis Business Cycles Fund",
  "Axis India Manufacturing Fund", "Axis Consumption Fund", "Axis Momentum Fund", "Axis NIFTY 50 ETF",
  "Axis NIFTY Bank ETF", "Axis NIFTY IT ETF", "Axis NIFTY Healthcare ETF", "Axis NIFTY India Consumption ETF",
  "Axis BSE Sensex ETF", "Axis Nifty500 Value 50 ETF", "Axis Nifty 100 Index Fund", "Axis Nifty 50 Index Fund",
  "Axis BSE Sensex Index Fund", "Axis Nifty Next 50 Index Fund", "Axis Nifty Smallcap 50 Index Fund",
  "Axis Nifty Midcap 50 Index Fund", "Axis Nifty IT Index Fund", "Axis Nifty Bank Index Fund",
  "Axis Nifty 500 Index Fund", "Axis Nifty500 Value 50 Index Fund", "Axis Nifty500 Momentum 50 Index Fund",
  "Axis Equity ETFs Fund of Fund", "Axis Global Equity Alpha Fund of Fund", "Axis Greater China Equity Fund of Fund",
  "Axis Global Innovation Fund of Fund", "Axis Nasdaq 100 Fund of Fund", "Axis Overnight Fund", "Axis Liquid Fund",
  "Axis Ultra Short Duration Fund", "Axis Floater Fund", "Axis Treasury Advantage Fund", "Axis Money Market Fund",
  "Axis Corporate Bond Fund", "Axis Banking & PSU Debt Fund", "Axis Short Duration Fund", "Axis Credit Risk Fund",
  "Axis Dynamic Bond Fund", "Axis Strategic Bond Fund", "Axis Long Duration Fund", "Axis Gilt Fund",
  "Axis Nifty AAA Bond Plus SDL Apr 2026 50:50 ETF", "Axis Nifty AAA Bond Plus SDL Apr 2026 50:50 ETF FOF",
  "Axis US Treasury Dynamic Bond ETF Fund of Fund", "Axis CRISIL IBX SDL May 2027 Index Fund",
  "Axis Nifty SDL September 2026 Debt Index Fund", "Axis Crisil IBX 50:50 Gilt Plus SDL June 2028 Index Fund",
  "Axis Crisil IBX 50:50 Gilt Plus SDL September 2027 Index Fund", "Axis CRISIL IBX SDL June 2034 Debt Index Fund",
  "Axis CRISIL IBX AAA Bond NBFC Jun 2027 Index Fund",
  "Axis CRISIL-IBX AAA Bond Financial Services - Sep 2027 Index Fund",
  "Axis CRISIL-IBX AAA Bond NBFC-HFC - JUN 2027 Index Fund", "Axis Conservative Hybrid Fund",
  "Axis Equity Savings Fund", "Axis Multi Asset Allocation Fund", "Axis Aggressive Hybrid Fund", "Axis Children's Fund",
  "Axis Balanced Advantage Fund", "Axis Arbitrage Fund", "Axis Retirement Fund - Aggressive Plan",
  "Axis Retirement Fund - Dynamic Plan", "Axis Retirement Fund - Conservative Plan", "Axis Income Plus Arbitrage Active FOF",
  "Axis Gold Fund", "Axis Silver ETF", "Axis Gold ETF", "Axis Silver Fund of Fund"
];

    const allChunks = [];

    for (const product of productNames) {
      const namespace = mutualFundProducts.includes(product)
        ? "axis_fund"
        : product.replace(/\s+/g, "_").toLowerCase();
    console.log(`🔍 Retrieving chunks for product: ${product} (namespace: ${namespace})`);


      const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex: index,
        namespace: namespace,
      });

      const query = `Give relevant features, eligibility, benefits, and details of the product:${product}`;
      const results = await vectorStore.similaritySearch(query, 4);
      const chunkTexts = results.map((r) => `- ${r.pageContent}`).join("\n");
      const combined = `Product: ${product}\n${chunkTexts}`;
      allChunks.push(combined);
    }

    const fullProductDetails = allChunks.join("\n\n");
console.log("🔍 Full Product Details:\n",fullProductDetails );


    const limit = pLimit.default(CONCURRENCY);

    const customerPromises = customers.map((customer) =>
      limit(() => processCustomer(customer, productNames, fullProductDetails))
    );

    const recommendations = await Promise.all(customerPromises);
    console.log(recommendations)

    res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = retrieveAndGenerate;
