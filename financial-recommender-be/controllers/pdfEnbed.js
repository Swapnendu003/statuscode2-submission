// pdfEmbedController.js

// import * as dotenv from "dotenv";
// dotenv.config();

// import fs from "fs";
// import { PDFLoader } from "langchain/document_loaders/fs/pdf";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { Pinecone } from "@pinecone-database/pinecone";
// import { PineconeStore } from "@langchain/community/vectorstores/pinecone";
const dotenv = require("dotenv");
dotenv.config();
const pdfParse = require("pdf-parse");


const fs = require("fs");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { Pinecone } = require("@pinecone-database/pinecone");
const { PineconeStore } = require("@langchain/community/vectorstores/pinecone");


// Constants
// const PINECONE_INDEX = "banking-products";
const PINECONE_INDEX = "banking-index-call";
// const PINECONE_INDEX = "sample-index"; // <- modify as needed


const CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 200;
const EMBEDDING_DIMENSION = 1536; 

const ensureIndexExists = async (pc) => {
  const { indexes = [] } = await pc.listIndexes();
  const exists = indexes.some(i => i.name === PINECONE_INDEX);
  if (exists) return;                          // done

  try {
    console.log(`📦 Creating index ${PINECONE_INDEX} …`);
    await pc.createIndex({
      name: PINECONE_INDEX,
      dimension: EMBEDDING_DIMENSION,
      metric: 'cosine',
      spec: { serverless: { cloud: 'aws', region: 'us-east-1' } },
    });
  } catch (err) {
    if (err.status !== 409) throw err;         // 409 = someone else already started
    console.log('Another process is already creating it – waiting.');
  }

  // Poll until the control‑plane marks it ready
  let state = 'Creating';
  while (state !== 'Ready') {
    await new Promise(r => setTimeout(r, 5000));
    const { status } = await pc.describeIndex({ indexName: PINECONE_INDEX });
    state = status?.state;
    console.log(`⏳ Index state: ${state}`);
  }
};

/**
 * Embed a PDF file into Pinecone via LangChain
 * @param {string} filePath - Absolute or relative path to the PDF file
 * @param {string} productName - Name of the product
 * @param {string} category - Category of the document
 */
 const embedPDF = async (filePath, productName="Axis Products", category="general") => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error("Invalid or missing PDF file path.");
    }

    console.log(`📄 Loading PDF: ${filePath}`);
    const dataBuffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(dataBuffer);
    const rawText = parsed.text;
    const documents = [{ pageContent: rawText, metadata: {} }];

    console.log(`✂️ Splitting PDF into chunks...`);
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
    });
    const splitDocs = await splitter.splitDocuments(documents);
    const enrichedDocs = splitDocs.map((doc, idx) => ({
      ...doc,
      metadata: {
        chunk_index: idx,
        product_name: productName,
        category: category,
      },
    }));

    console.log(`🧠 Connecting to Pinecone index: ${PINECONE_INDEX}`);
     const pinecone = new Pinecone({
      // apiKey: process.env.PINECONE_API_KEY,
      apiKey:""
    });
    await ensureIndexExists(pinecone);

    const index = pinecone.index(PINECONE_INDEX);


    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: "",
      model:"text-embedding-ada-002"
    });

    // const namespace = productName.replace(/\s+/g, "_").toLowerCase();
    const namespace = "axis-products";


    console.log(`📥 Storing ${enrichedDocs.length} chunks to Pinecone (namespace: ${namespace})`);
const pineconeStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex: index,
  namespace: namespace,
});

await pineconeStore.addDocuments(enrichedDocs);
    console.log(`✅ Embedding complete: ${enrichedDocs.length} chunks embedded for "${productName}"`);
    return {
      success: true,
      chunks: enrichedDocs.length,
      namespace,
      message: `Successfully embedded PDF for '${productName}'`,
    };
  } catch (err) {
    console.error("❌ Embedding failed:", err);
    return {
      success: false,
      error: err.message || "Unknown error",
    };
  }
};
module.exports={embedPDF}
