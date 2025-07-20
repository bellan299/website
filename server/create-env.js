const fs = require('fs');
const path = require('path');

const envContent = `CLOVER_API_KEY=YOUR_CLOVER_API_KEY
CLOVER_MERCHANT_ID=YOUR_CLOVER_MERCHANT_ID
CLOVER_LOCATION_ID=YOUR_CLOVER_LOCATION_ID
PORT=5000`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📁 Location:', envPath);
  console.log('');
  console.log('Now you can run the test script:');
  console.log('npm run test:clover');
} catch (error) {
  console.error('❌ Failed to create .env file:', error.message);
  console.log('');
  console.log('Please create the .env file manually with this content:');
  console.log('CLOVER_API_KEY=YOUR_CLOVER_API_KEY');
  console.log('CLOVER_MERCHANT_ID=YOUR_CLOVER_MERCHANT_ID');
  console.log('CLOVER_LOCATION_ID=YOUR_CLOVER_LOCATION_ID');
  console.log('PORT=5000');
} 