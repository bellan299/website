# Clover API Setup Guide

This guide will help you set up Clover API integration to fetch inventory data for your website.

## Prerequisites

1. A Clover merchant account
2. Access to the Clover Developer Dashboard
3. Your merchant ID and location ID

## Step 1: Get Your Clover API Key

1. Go to the [Clover Developer Dashboard](https://sandbox.dev.clover.com/)
2. Sign in with your Clover merchant account
3. Navigate to **Apps** → **My Apps**
4. Create a new app or use an existing one
5. Go to the **API Keys** section
6. Generate a new API key with the following permissions:
   - `merchant.read`
   - `items.read`
   - `categories.read`

## Step 2: Find Your Merchant and Location IDs

### Merchant ID
1. In the Clover Developer Dashboard, go to **Merchants**
2. Your merchant ID will be displayed in the URL or merchant details

### Location ID
1. In the Clover Developer Dashboard, go to **Merchants** → **Your Merchant** → **Locations**
2. Note down the location ID for the location you want to fetch inventory from

## Step 3: Configure Environment Variables

1. Navigate to your server directory:
   ```bash
   cd server
   ```

2. Create the environment file:
   ```bash
   node create-env.js
   ```

3. Edit the `.env` file and replace the placeholder values:
   ```env
   CLOVER_API_KEY=your_actual_api_key_here
   CLOVER_MERCHANT_ID=your_merchant_id_here
   CLOVER_LOCATION_ID=your_location_id_here
   PORT=5000
   ```

## Step 4: Test the Connection

1. Run the Clover API test:
   ```bash
   npm run test:clover
   ```

2. If successful, you should see:
   - ✅ Merchant Information
   - ✅ Merchant Locations
   - ✅ Categories
   - ✅ Items (limited to 5)
   - ✅ Location-specific Items

## Step 5: Import Inventory Data

1. Run the inventory import script:
   ```bash
   npm run import:inventory
   ```

2. This will fetch all items from Clover and save them to `server/data/inventory.json`

## Step 6: Start the Server

1. Start your server:
   ```bash
   npm start
   ```

2. Your API endpoints will now return real data from Clover:
   - `GET /api/items` - All items
   - `GET /api/items/categories` - All categories
   - `GET /api/items/category/:category` - Items by category
   - `GET /api/items/search?q=query` - Search items
   - `GET /api/items/:id` - Single item by ID

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check your API key and permissions
2. **404 Not Found**: Verify your merchant ID and location ID
3. **No items returned**: Ensure your Clover inventory has items
4. **CORS errors**: Check your server configuration

### API Key Permissions

Make sure your API key has these permissions:
- `merchant.read` - Read merchant information
- `items.read` - Read inventory items
- `categories.read` - Read item categories

### Rate Limits

Clover API has rate limits. If you encounter rate limit errors:
- Implement caching for frequently accessed data
- Use pagination for large datasets
- Consider using the import script to cache data locally

## Production Deployment

For production deployment (e.g., Vercel):

1. Add your environment variables to your hosting platform
2. Set `CLOVER_API_KEY`, `CLOVER_MERCHANT_ID`, and `CLOVER_LOCATION_ID`
3. Deploy your application

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables for all API keys
- Regularly rotate your API keys
- Monitor API usage for security

## Support

- [Clover API Documentation](https://docs.clover.com/)
- [Clover Developer Dashboard](https://sandbox.dev.clover.com/)
- [Clover Support](https://www.clover.com/support) 