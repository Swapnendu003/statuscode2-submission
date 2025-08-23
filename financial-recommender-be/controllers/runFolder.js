const fs = require("fs");
const path = require("path");
const { embedPDF } = require("./pdfEnbed");


const targetCategory = "GovernmentProducts"; 
const baseDir = path.join("../uploads", targetCategory);

// Check if the directory exists
if (fs.existsSync(baseDir) && fs.lstatSync(baseDir).isDirectory()) {
  fs.readdirSync(baseDir).forEach((file) => {
    const ext = path.extname(file).toLowerCase();
    if (ext === ".pdf") {
      const filePath = path.join(baseDir, file);
      const productName = path.basename(file, ext);
      const category = "Goverment Products"; 

      embedPDF(filePath, productName, category)
        .then(() => {
          console.log(`✅ Embedded: ${productName} [${category}]`);
        })
        .catch((err) => {
          console.error(`❌ Failed: ${productName} [${category}]`, err);
        });
    }
  });
} else {
  console.error(`❌ Directory not found or is not a folder: ${baseDir}`);
}

