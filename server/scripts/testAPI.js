const axios = require('axios');
require('dotenv').config();

class APITester {
  constructor() {
    this.baseURL = 'http://localhost:5000';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000
    });
  }

  /**
   * Test all API endpoints
   */
  async testAllEndpoints() {
    console.log('🧪 Testing Jp\'s Liquor API endpoints...\n');

    try {
      // Test health endpoint
      await this.testHealth();
      
      // Test categories endpoint
      await this.testCategories();
      
      // Test items endpoint
      await this.testItems();
      
      // Test search endpoint
      await this.testSearch();
      
      console.log('\n✅ All API tests completed successfully!');
      
    } catch (error) {
      console.error('\n❌ API test failed:', error.message);
      throw error;
    }
  }

  /**
   * Test health endpoint
   */
  async testHealth() {
    console.log('🔍 Testing health endpoint...');
    const response = await this.client.get('/health');
    console.log(`✅ Health check: ${response.data.message}`);
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Timestamp: ${response.data.timestamp}\n`);
  }

  /**
   * Test categories endpoint
   */
  async testCategories() {
    console.log('🔍 Testing categories endpoint...');
    const response = await this.client.get('/api/items/categories');
    
    if (response.data.success) {
      console.log(`✅ Categories: Found ${response.data.data.length} categories`);
      if (response.data.data.length > 0) {
        console.log('   Sample categories:');
        response.data.data.slice(0, 5).forEach(cat => {
          console.log(`   - ${cat.name} (ID: ${cat.id})`);
        });
      }
    } else {
      console.log('❌ Categories endpoint failed');
    }
    console.log('');
  }

  /**
   * Test items endpoint
   */
  async testItems() {
    console.log('🔍 Testing items endpoint...');
    const response = await this.client.get('/api/items?limit=5');
    
    if (response.data.success) {
      console.log(`✅ Items: Found ${response.data.data.length} items (showing first 5)`);
      console.log(`   Total in response: ${response.data.pagination.total}`);
      
      if (response.data.data.length > 0) {
        console.log('   Sample items:');
        response.data.data.forEach(item => {
          const price = (item.price / 100).toFixed(2); // Convert cents to dollars
          console.log(`   - ${item.name}: $${price}`);
        });
      }
    } else {
      console.log('❌ Items endpoint failed');
    }
    console.log('');
  }

  /**
   * Test search endpoint
   */
  async testSearch() {
    console.log('🔍 Testing search endpoint...');
    
    // Test with a common search term
    const searchTerms = ['wine', 'beer', 'vodka'];
    
    for (const term of searchTerms) {
      try {
        const response = await this.client.get(`/api/items/search?q=${term}&limit=3`);
        
        if (response.data.success) {
          console.log(`✅ Search "${term}": Found ${response.data.data.length} results`);
          if (response.data.data.length > 0) {
            const firstItem = response.data.data[0];
            const price = (firstItem.price / 100).toFixed(2);
            console.log(`   Sample: ${firstItem.name} - $${price}`);
          }
        } else {
          console.log(`❌ Search "${term}" failed`);
        }
      } catch (error) {
        console.log(`❌ Search "${term}" error: ${error.message}`);
      }
    }
    console.log('');
  }

  /**
   * Test category-specific endpoint
   */
  async testCategoryItems() {
    console.log('🔍 Testing category items endpoint...');
    
    try {
      // First get categories
      const categoriesResponse = await this.client.get('/api/items/categories');
      
      if (categoriesResponse.data.success && categoriesResponse.data.data.length > 0) {
        const firstCategory = categoriesResponse.data.data[0];
        const categoryName = firstCategory.name;
        
        const response = await this.client.get(`/api/items/category/${encodeURIComponent(categoryName)}?limit=3`);
        
        if (response.data.success) {
          console.log(`✅ Category "${categoryName}": Found ${response.data.data.length} items`);
          if (response.data.data.length > 0) {
            const firstItem = response.data.data[0];
            const price = (firstItem.price / 100).toFixed(2);
            console.log(`   Sample: ${firstItem.name} - $${price}`);
          }
        } else {
          console.log(`❌ Category "${categoryName}" failed`);
        }
      } else {
        console.log('❌ No categories available for testing');
      }
    } catch (error) {
      console.log(`❌ Category test error: ${error.message}`);
    }
    console.log('');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new APITester();
  tester.testAllEndpoints()
    .then(() => {
      console.log('\n🎉 API testing completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 API testing failed:', error.message);
      process.exit(1);
    });
}

module.exports = APITester; 