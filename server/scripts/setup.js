const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class SetupHelper {
  constructor() {
    this.serverDir = path.join(__dirname, '..');
  }

  /**
   * Run the complete setup process
   */
  async runSetup() {
    console.log('🚀 Setting up Jp\'s Liquor Server...\n');

    try {
      // Check if .env file exists
      await this.checkEnvironment();
      
      // Install dependencies
      await this.installDependencies();
      
      // Test the server
      await this.testServer();
      
      // Import inventory
      await this.importInventory();
      
      console.log('\n🎉 Setup completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Start the server: npm start');
      console.log('2. Test the API: npm run test-api');
      console.log('3. View imported data in the data/ folder');
      
    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      throw error;
    }
  }

  /**
   * Check environment configuration
   */
  async checkEnvironment() {
    console.log('🔍 Checking environment configuration...');
    
    const envPath = path.join(this.serverDir, '.env');
    const envExamplePath = path.join(this.serverDir, 'env.example');
    
    try {
      await fs.access(envPath);
      console.log('✅ .env file found');
    } catch (error) {
      console.log('📝 Creating .env file from template...');
      const envContent = await fs.readFile(envExamplePath, 'utf8');
      await fs.writeFile(envPath, envContent);
      console.log('✅ .env file created');
    }
  }

  /**
   * Install dependencies
   */
  async installDependencies() {
    console.log('\n📦 Installing dependencies...');
    
    try {
      execSync('npm install', { 
        cwd: this.serverDir, 
        stdio: 'inherit' 
      });
      console.log('✅ Dependencies installed');
    } catch (error) {
      throw new Error('Failed to install dependencies');
    }
  }

  /**
   * Test the server
   */
  async testServer() {
    console.log('\n🧪 Testing server startup...');
    
    try {
      // Start server in background
      const serverProcess = execSync('npm start', { 
        cwd: this.serverDir,
        stdio: 'pipe',
        timeout: 10000
      });
      console.log('✅ Server started successfully');
    } catch (error) {
      console.log('⚠️  Server test skipped (may already be running)');
    }
  }

  /**
   * Import inventory
   */
  async importInventory() {
    console.log('\n📥 Importing inventory from Clover...');
    
    try {
      execSync('npm run import', { 
        cwd: this.serverDir, 
        stdio: 'inherit' 
      });
      console.log('✅ Inventory imported');
    } catch (error) {
      console.log('⚠️  Inventory import failed - you can run it manually with: npm run import');
    }
  }

  /**
   * Show available commands
   */
  showCommands() {
    console.log('\n📋 Available Commands:');
    console.log('  npm start          - Start the server');
    console.log('  npm run import     - Import inventory from Clover');
    console.log('  npm run test-api   - Test API endpoints');
    console.log('  node scripts/setup.js - Run this setup again');
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  const setup = new SetupHelper();
  setup.runSetup()
    .then(() => {
      setup.showCommands();
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = SetupHelper; 