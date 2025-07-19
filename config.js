// Website Configuration
const CONFIG = {
    // API Endpoints
    API_BASE_URL: 'http://localhost:3001/api',
    
    // Clover API Configuration (for product data)
    CLOVER: {
        BASE_URL: 'https://api.clover.com',
        // Do NOT store sensitive credentials in frontend config!
        // Use environment variables or secure backend storage for API keys and merchant IDs.
        // MERCHANT_ID and API_KEY should be injected from a secure source, not hardcoded here.
    },
    
    // Firebase Configuration (moved to firebase-config.js)
    FIREBASE: {
        // Configuration is in firebase-config.js
    },
    
    // Website Settings
    SITE: {
        NAME: "Jp's Liquor",
        DESCRIPTION: "Premium Spirits & Wine",
        ADDRESS: "6501 Ware Rd, Lino Lakes, MN 55014",
        PHONE: "(651) 483-1605",
        EMAIL: "jpsliquor@gmail.com"
    },
    
    // Product Categories
    CATEGORIES: {
        WINE: 'wine',
        SPIRITS: 'spirits', 
        BEER: 'beer',
        SELTZER: 'seltzer',
        THC: 'thc'
    }
};

// Export for use in other files
window.CONFIG = CONFIG; 