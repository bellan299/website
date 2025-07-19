const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// [STUBBED FOR PUBLIC DEPLOYMENT]
// All Clover API logic is disabled. Restore this logic when enabling API functionality.
class Importer {
  constructor() {
    this.apiKey = null;
    this.merchantId = null;
    this.locationId = null;
  }

  async import() {
    // Stub: Do nothing
    console.warn('Import is disabled for public deployment. Restore logic to enable.');
    return [];
  }
}

module.exports = Importer; 