require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");
const { PineconeStore } = require("@langchain/community/vectorstores/pinecone");
const { Data } = require('../models/userData');
const OpenAI = require("openai");
const openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const { z } = require("zod");

const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.3,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const SuitabilitySchema = z.object({
  suitable: z.boolean(),
  reason: z.string(),
});

const modelWithStructuredOutput = model.withStructuredOutput(SuitabilitySchema);


async function checkProductSuitability(req, res) {
  try {
        const { customerIds, productName } = req.body;

    if (!customerIds || !Array.isArray(customerIds) || !productName || typeof productName !== "string") {
      return res.status(400).json({ error: "Missing or invalid input fields." });
    }

    // 🔍 Fetch full customer details from DB
    const customers = await Data.find({ customerId: { $in: customerIds } });

    if (customers.length === 0) {
      return res.status(404).json({ error: "No customer records found for given IDs." });
    }


    // 1️⃣ Init Pinecone & Embeddings
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

    // 2️⃣ Retrieve Product Details from Pinecone
    const namespace = mutualFundProducts.includes(productName)
      ? "axis_fund"
      : productName.replace(/\s+/g, "_").toLowerCase();

    console.log(`🔍 Fetching product chunks from Pinecone (namespace: ${namespace})`);
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: namespace,
    });

    const query = `Give relevant features, eligibility, benefits, and details of the product: ${productName}`;
    const results = await vectorStore.similaritySearch(query, 4);

    const chunkTexts = results.map((r) => `- ${r.pageContent}`).join("\n");
    const productDetail = `Product: ${productName}\n${chunkTexts}`;

    console.log("📦 Product Detail:\n", productDetail);


    const suitableCustomers = [];
    const notSuitableCustomers = [];

    for (const customer of customers) {
      const promptText = `
Customer Profile:
- Customer ID: ${customer.customerId}
- Credit Score: ${customer.creditScore}
- Gender: ${customer.gender}
- Age: ${customer.age}
- Tenure with Bank: ${customer.tenure} years
- Current Account Balance: ₹${customer.balance}
- Number of Products Owned: ${customer.productNumbers}
- Holds a Credit Card: ${customer.creditCard >= 1 ? 'Yes' : 'No'}
- Is an Active Member: ${customer.activeMember === 1 ? 'Yes' : 'No'}
- Annual Estimated Salary: ₹${customer.estimatedSalary}

Product Details:
${productDetail}

You are a financial advisor for an Indian bank. Your task is to evaluate whether a specific financial product is SUITABLE, BORDERLINE SUITABLE, or NOT SUITABLE for a given customer.

Your goal is to identify high-potential, marketing-worthy leads who can both afford and benefit from the product. Use the following structured framework to guide your evaluation. Do NOT hallucinate.

---

**EVALUATION FRAMEWORK:**

**Step 1: Product Category Analysis**
- **Credit Products (Loans, Credit Cards)**: Evaluate creditworthiness, repayment capacity, debt-to-income ratio, banking relationship strength
- **Investment Products (Mutual Funds, ETFs)**: Consider risk tolerance based on age, investment horizon, surplus income, financial sophistication
- **Deposit Products (FDs, Savings Plans)**: Focus on liquidity preferences, conservative investment appetite, capital preservation needs
- **Insurance Products**: Assess life stage appropriateness, premium paying capacity, dependents, existing coverage gaps

**Step 2: Age-Based Risk Assessment**
**RETIREMENT PRODUCTS:**
- **Age 20-35**: TOO EARLY - Should focus on emergency funds, basic insurance, skill development
- **Age 35-50**: IDEAL AGE - Peak earning years, retirement planning becomes priority
- **Age 50-60**: URGENT NEED - Last chance for meaningful retirement accumulation
- **Age 60+**: TOO LATE - Should focus on income generation, not long-term accumulation

**INSURANCE PRODUCTS:**
- **Age 20-30**: Term insurance priority, basic health coverage
- **Age 30-50**: Comprehensive family protection, higher coverage amounts
- **Age 50-65**: Health insurance critical, life insurance review needed
- **Age 65+**: Health insurance only, avoid new life insurance

**INVESTMENT PRODUCTS:**
- **Age 20-35**: High-risk equity, long-term SIPs acceptable
- **Age 35-50**: Balanced approach, mix of equity and debt
- **Age 50-60**: Conservative shift, reduce equity exposure
- **Age 60+**: Capital preservation only, avoid growth products

**LOAN PRODUCTS:**
- **Age 20-35**: Education, car loans acceptable
- **Age 35-50**: Home loans, business loans prime time
- **Age 50-60**: Avoid long-term loans, focus on repayment
- **Age 60+**: Avoid new loans unless secured

---

**Step 3: Financial Capacity Evaluation**
- **Income Stability**: Minimum 3x monthly income for loan EMIs, adequate surplus for investments
- **Banking Relationship**: Active membership and multiple products indicate trust and engagement
- **Credit Discipline**: Score >650 for premium products, >600 for standard products, >550 for basic products
- **Liquidity Position**: Balance should support minimum investment amounts and emergency needs

**Step 4: Indian Market Context**
- **Tax-Saving Products**: Consider salary bracket for 80C benefits (ELSS, Tax Saver FDs)
- **Government Schemes**: Age and income eligibility for schemes like PMJJBY, PMSBY
- **Regional Preferences**: Conservative approach in tier-2/tier-3 cities, higher risk appetite in metros
- **Family Financial Planning**: Joint decision-making culture, dependents' needs

**5. RISK CAPACITY vs RISK TOLERANCE**
- **Risk Capacity**: Actual ability to absorb losses based on income, age, dependents
- **Risk Tolerance**: Willingness to take risk (inferred from banking behavior)
- Both must align with product risk level


---

**SUITABILITY CRITERIA:**

**SUITABLE if customer meets ALL of:**
1. **Age Appropriateness**: Product aligns with life stage and risk tolerance
2. **Financial Capacity**: Adequate income/balance for the product commitment
3. **Credit Eligibility**: Meets minimum credit requirements (for credit products)
4. **Banking Engagement**: Shows active relationship with the bank
5. **Genuine Need**: Product addresses a real financial need or goal

**BORDERLINE SUITABLE if customer meets MOST criteria but has:**
- Slightly lower credit score but compensated by high income/balance
- New banking relationship but strong financial profile
- Age at the edge of target range but other factors support suitability

**NOT SUITABLE if customer has:**
- **Fundamental Age Mismatch**: 60+ for high-risk equity funds, 25- for retirement products
- **Insufficient Financial Capacity**: Cannot afford minimum investment or loan EMIs
- **Poor Credit Profile**: Credit score too low for credit products (below 550)
- **No Banking Engagement**: Inactive member with single product relationship
- **Inappropriate Product**: Product doesn't match customer's financial stage or goals

---

BANKING RELATIONSHIP INDICATORS:

- ActiveMember = 1 → Good engagement
- productNumbers ≥ 2 → Diversified product use
- creditCard = 1 → Credit-qualified
- tenure > 5 years → Trust and stability

---

**SPECIFIC EVALUATION RULES:**

**AUTOMATIC REJECTION CRITERIA:**
1. **Age Mismatch**: 60+ for retirement funds, 20-30 for retirement products
2. **Insufficient Income**: Cannot afford minimum product requirements
3. **Liquidity Issues**: Balance <₹10,000 for investment products
4. **Overextension**: Product cost >30% of disposable income
5. **Life Stage Mismatch**: Products that don't serve current needs

**AUTOMATIC APPROVAL CRITERIA:**
1. **Perfect Age Match**: Product designed for customer's exact life stage
2. **Strong Affordability**: Can easily afford without financial stress
3. **Genuine Need**: Product addresses real financial gap
4. **Sustainable Commitment**: Customer can maintain long-term
---

**EXAMPLE EVALUATIONS:**

**REJECT**: 23-year-old, ₹30,000 salary, ₹12,000 balance → Any insurance >₹2000/year premium
**REASON**: Cannot afford without compromising basic needs

**ACCEPT**: 42-year-old, ₹720,000 salary, ₹1,650,000 balance → Health insurance ₹15,000/year
**REASON**: Adequate surplus income, family protection need, can sustain long-term

**REJECT**: 68-year-old → High-risk equity fund
**REASON**: Age-inappropriate, capital preservation priority

---
**RESPONSE REQUIREMENTS:**

For each customer, calculate:
1. Monthly disposable income
2. Product affordability threshold
3. Age appropriateness score
4. Life stage relevance
5. Genuine need assessment


Focus on REAL financial impact, not credit scores. Explain affordability, life stage fit, and genuine need.

For SUITABLE customers, mention:
- Specific affordability calculation
- Life stage relevance
- How product benefits their situation
- Sustainability of commitment

For UNSUITABLE customers, mention:
- Specific affordability concerns
- Life stage mismatch
- Better alternatives if any
- Why product doesn't serve their needs

Only return a valid JSON **with no extra text, markdown, or formatting**.

If the product is suitable for the customer:

{
  "suitable": true,
  "reason": "Detailed explanation of why this product matches the customer's financial profile, life stage, risk tolerance, and capacity. Include specific metrics that support the recommendation (e.g., age-appropriate risk level, adequate surplus income, strong banking relationship, genuine financial need)."

If the product is not suitable for the customer:

{
  "suitable": false,
  "reason": "Specific explanation of why the product is not appropriate - cite exact mismatches like age-risk mismatch, insufficient income, poor credit profile, or product irrelevance to customer's needs. Be precise about which criteria are not met."
}


**Only respond with valid JSON. No extra text, no markdown, no commentary.**
`.trim();

      let parsed;
      let isValid = false;
      let retries = 3;

      while (!isValid && retries-- > 0) {
        try {
          const output = await modelWithStructuredOutput.invoke(promptText);
          parsed = output;
          isValid = true;
        } catch (e) {
          console.warn(`⚠️ Invalid JSON received for customer ${customer.customerId}. Retrying...`);
        }
      }

      const customerInfo = {
        customer_id: customer.customerId,
        name: customer.name,
        email: customer.email,
        location: customer.location,
        gender: customer.gender,
        estimated_salary: customer.estimatedSalary,
        credit_score: customer.creditScore,
        age: customer.age,
        balance: customer.balance,
        tenure: customer.tenure,
        product_numbers: customer.productNumbers,
        credit_card: customer.creditCard === 1,
        reason: parsed?.reason || "No valid reason received.",
      };

      if (isValid && parsed.suitable) {
        suitableCustomers.push(customerInfo);
        console.log(`✅ Suitable for ${customer.customerId}: ${parsed.reason}`);
      } else {
        notSuitableCustomers.push(customerInfo);
        console.log(`❌ Not suitable for ${customer.customerId}: ${parsed?.reason}`);
      }
    }

    res.status(200).json({
      success: true,
      product: productName,
      total_customers: customers.length,
      qualified_customers: suitableCustomers.length,
      unqualified_customers: notSuitableCustomers.length,
      suitable_customers: suitableCustomers,
      not_suitable_customers: notSuitableCustomers,
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
}

module.exports= checkProductSuitability;