//  const {embedPDF}=require("./pdfEnbed")

//  const filePath = "./uploads/Axis_Fund.pdf";
// const productName = "Axis Fund";
// const category = "Mutual Funds";

// embedPDF(filePath, productName, category).then((res) => {
//   console.log(res);
// });










//runTest.js
// const retrieveAndGenerate = require("./retrieveGenerateCOntroller");
// retrieveAndGenerate();














const fs = require("fs");
const path = require("path");
const { embedPDF } = require("./pdfEnbed");

const baseDir = "../uploads";

// Read the category folders inside `uploads/`
fs.readdirSync(baseDir).forEach((categoryFolder) => {
  const categoryPath = path.join(baseDir, categoryFolder);

  // Check if it's a directory (category like mutualFunds, loan, etc.)
  if (fs.lstatSync(categoryPath).isDirectory()) {
    // Read all PDF files inside that category
    fs.readdirSync(categoryPath).forEach((file) => {
      const ext = path.extname(file).toLowerCase();
      if (ext === ".pdf") {
        const filePath = path.join(categoryPath, file);
        const productName = path.basename(file, ext); // File name without extension
        const category = categoryFolder; // The folder name acts as category

        embedPDF(filePath, productName, category)
          .then((res) => {
            console.log(`✅ Embedded: ${productName} [${category}]`);
          })
          .catch((err) => {
            console.error(`❌ Failed: ${productName} [${category}]`, err);
          });
      }
    });
  }
});
