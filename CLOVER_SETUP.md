# Clover API Setup Guide for Jp's Liquor Website

## Prerequisites
- Node.js installed on your computer
- Your Clover Merchant ID and API Key
- Access to your Clover Developer Dashboard

## Step 1: Install Dependencies

Open your terminal/command prompt in the project directory and run:

```bash
npm install
```

This will install all the required packages (Express, Axios, CORS, etc.).

## Step 2: Configure Clover API Credentials

1. **Create a `.env` file** in your project root directory
2. **Add your Clover credentials** to the `.env` file:

```env
CLOVER_MERCHANT_ID=your_merchant_id_here
CLOVER_API_KEY=your_api_key_here
PORT=3001
```

### How to Get Your Clover Credentials:

1. **Log into your Clover Developer Dashboard** at https://www.clover.com/developers
2. **Find your Merchant ID**:
   - Go to "Apps" → "My Apps"
   - Look for your merchant ID in the URL or app settings
3. **Get your API Key**:
   - Go to "Apps" → "My Apps" → "Create App"
   - Or use an existing app's API key
   - Make sure the app has the necessary permissions (read access to items, categories, etc.)

## Step 3: Start the Server

Run the following command to start the server:

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

## Step 4: Test the Connection

1. **Open your browser** and go to `http://localhost:3001`
2. **Check the server console** for connection status
3. **Test the API** by visiting `http://localhost:3001/api/health`

## Step 5: Configure Product Categories in Clover

For best results, organize your products in Clover with these categories:

### Recommended Category Names:
- **Wine** (for wine products)
- **Spirits** (for whiskey, vodka, rum, etc.)
- **Beer** (for beer products)
- **Seltzer** (for hard seltzers)
- **THC** (for THC products)

### Adding Tags for Special Features:
- Add tag "Best Seller" to popular products
- Add tag "New" or "New Arrival" to new products

## Step 6: Customize Category Mapping

If your Clover categories don't match exactly, you can edit the mapping in `server.js`:

```javascript
const categoryMapping = {
    'wine': ['wine', 'red wine', 'white wine', 'rosé', 'sparkling'],
    'spirits': ['spirits', 'whiskey', 'vodka', 'rum', 'gin', 'tequila', 'bourbon', 'scotch'],
    'beer': ['beer', 'ale', 'lager', 'craft beer'],
    'seltzer': ['seltzer', 'hard seltzer', 'spritzer'],
    'thc': ['thc', 'cannabis', 'marijuana']
};
```

## Troubleshooting

### Common Issues:

1. **"CLOVER_MERCHANT_ID not configured"**
   - Check your `.env` file exists and has the correct values
   - Make sure there are no spaces around the `=` sign

2. **"Failed to fetch products from Clover"**
   - Verify your API key is correct and has proper permissions
   - Check that your merchant ID is correct
   - Ensure your Clover account has products

3. **"CORS error"**
   - The server includes CORS headers, but if you're accessing from a different domain, you may need to configure it

4. **Products not showing up**
   - Make sure products are marked as "available" in Clover
   - Check that products have proper categories assigned
   - Verify the category mapping matches your Clover categories

### API Endpoints Available:

- `GET /api/products` - Get all products
- `GET /api/products/bestsellers` - Get best sellers
- `GET /api/products/newarrivals` - Get new arrivals
- `GET /api/products/category/:category` - Get products by category
- `GET /api/health` - Health check

## Production Deployment

When ready to deploy to production:

1. **Set up environment variables** on your hosting platform
2. **Update the API base URL** in `config.js` if needed
3. **Configure your domain** and SSL certificates
4. **Set up proper security headers**

## Support

If you encounter issues:
1. Check the server console for error messages
2. Verify your Clover API credentials
3. Test the API endpoints directly
4. Check the browser console for frontend errors

## Next Steps

Once connected:
- Add product images to Clover for better display
- Set up inventory tracking
- Configure real-time stock updates
- Add order management features 

---

## **How to Fix a Clover 401 Unauthorized Error**

### 1. **Double-check your API key**
- Make sure you copied the API key exactly, with no extra spaces or characters.
- If you regenerated the key, use the latest one.

### 2. **Check API Key Permissions**
- The API key must have permission to access the Clover Items API.
- In your Clover Developer Dashboard, make sure your app has at least **read access** to:
  - Items
  - Categories
  - Inventory (if you want stock info)
- If you’re not sure, try creating a new API key/app and give it all permissions.

### 3. **Check if the API key is for the correct environment**
- If you have multiple Clover accounts (sandbox vs. production), make sure the key is for the correct merchant/account.

### 4. **Test the API key manually**
- Try making a request with your API key using a tool like [Postman](https://www.postman.com/) or `curl`:
  ```sh
  curl -H "Authorization: Bearer YOUR_API_KEY" "https://api.clover.com/v3/merchants/{merchant_id}/items"
  ```
  (Replace `{merchant_id}` with your actual merchant ID if you have it.)

### 5. **Check for Merchant ID requirement**
- Some Clover endpoints require the merchant ID in the URL.
- If you can get your merchant ID, add it to your `.env` and restart the server:
  ```
  CLOVER_MERCHANT_ID=your_merchant_id_here
  CLOVER_API_KEY=your_api_key_here
  PORT=3001
  ```

---

## **Summary of Next Steps**
1. **Double-check your API key for typos.**
2. **Check your Clover app’s permissions.**
3. **If possible, get your Merchant ID and add it to your `.env`.**
4. **Try the API key in Postman or curl to see if it works outside your app.**
5. **If you still get 401, regenerate the API key in Clover and try again.**

---

If you need help with any of these steps, let me know which one you want to try or if you want help finding your Merchant ID! 