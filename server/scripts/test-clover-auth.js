require('dotenv').config();
const axios = require('axios');

// [STUBBED FOR PUBLIC DEPLOYMENT]
// All Clover API logic is disabled. Restore this logic when enabling API functionality.
const config = {
  apiKey: null,
  merchantId: null,
  locationId: null
};

console.warn('Clover API test is disabled for public deployment. Restore logic to enable.');

if (!config.apiKey) throw new Error('CLOVER_API_KEY is missing.');
if (!config.merchantId) throw new Error('CLOVER_MERCHANT_ID is missing.');

console.log('🔍 Clover API Authentication Test');
console.log('================================');
console.log(`API Key: ${config.apiKey.substring(0, 8)}...${config.apiKey.substring(config.apiKey.length - 4)}`);
console.log(`Merchant ID: ${config.merchantId}`);
console.log(`Location ID: ${config.locationId}`);
console.log('');

async function testEndpoint(endpoint, description) {
  try {
    console.log(`Testing: ${description}`);
    console.log(`Endpoint: ${endpoint}`);
    
    const response = await axios.get(`${config.baseURL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log(`✅ SUCCESS - Status: ${response.status}`);
    console.log(`Response data keys: ${Object.keys(response.data).join(', ')}`);
    if (response.data.elements) {
      console.log(`Items found: ${response.data.elements.length}`);
    }
    console.log('');
    return true;
  } catch (error) {
    console.log(`❌ FAILED - Status: ${error.response?.status || 'No response'}`);
    if (error.response?.data) {
      console.log(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
    console.log('');
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  // Test 1: Basic merchant info
  await testEndpoint(
    `/v3/merchants/${config.merchantId}`,
    'Merchant Information'
  );
  
  // Test 2: Merchant locations
  await testEndpoint(
    `/v3/merchants/${config.merchantId}/locations`,
    'Merchant Locations'
  );
  
  // Test 3: Categories
  await testEndpoint(
    `/v3/merchants/${config.merchantId}/categories`,
    'Categories'
  );
  
  // Test 4: Items (basic)
  await testEndpoint(
    `/v3/merchants/${config.merchantId}/items?limit=5`,
    'Items (limited to 5)'
  );
  
  // Test 5: Location-specific items
  await testEndpoint(
    `/v3/merchants/${config.merchantId}/items?locationId=${config.locationId}&limit=5`,
    'Location-specific Items'
  );
  
  console.log('🏁 Test completed!');
  console.log('\n💡 Troubleshooting Tips:');
  console.log('1. If all tests fail with 401: Check API key type and permissions');
  console.log('2. If merchant test fails: Check merchant ID');
  console.log('3. If location test fails: Check location ID and permissions');
  console.log('4. If items test fails: Check if inventory exists');
  console.log('\n🔗 Clover Dashboard: https://sandbox.dev.clover.com/');
}

runTests().catch(console.error); 