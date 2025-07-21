const xlsx = require('xlsx');
const fs = require('fs');

// Load the workbook
const workbook = xlsx.readFile('inventory-export-v2.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert the sheet to an array of arrays (raw rows)
const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

// Find the header row (row containing both 'Name' and 'Price')
let headerRowIndex = -1;
for (let i = 0; i < Math.min(50, rawRows.length); i++) {
  const row = rawRows[i].map(cell => String(cell).trim());
  if (row.includes('Name') && row.includes('Price')) {
    headerRowIndex = i;
    break;
  }
}

if (headerRowIndex === -1) {
  console.error('Could not find a header row with both Name and Price in the first 50 rows.');
  process.exit(1);
}

// Use the found header row to parse the sheet
const data = xlsx.utils.sheet_to_json(sheet, { defval: '', range: headerRowIndex });
console.log('Detected column headers:', Object.keys(data[0]));

const nameCol = 'Name';
const priceCol = 'Price';

if (!(nameCol in data[0]) || !(priceCol in data[0])) {
  console.error('Could not find Name or Price column after header row detection.');
  process.exit(1);
}

const products = data.map(row => ({
  name: row[nameCol],
  price: row[priceCol]
})).filter(p => p.name && p.price);

fs.writeFileSync('server/data/extracted_products.json', JSON.stringify(products, null, 2));
console.log(`Extracted ${products.length} products to server/data/extracted_products.json`); 