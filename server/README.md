# Jp's Liquor Server

Backend server for Jp's Liquor website that integrates with the Clover REST API to manage inventory and product data.

## Features

- RESTful API endpoints for product management
- Integration with Clover POS system
- Category-based product filtering
- Search functionality
- Pagination support
- Error handling and logging

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - Copy `env.example` to `.env`
   - The environment file is already configured with:
     - `CLOVER_API_KEY`: Your Clover API key
     - `CLOVER_MERCHANT_ID`: Your Clover merchant ID
     - `CLOVER_LOCATION_ID`: Your Clover location ID
     - `PORT`: Server port (5000)

3. **Start the server:**
   ```bash
   npm start
   ```

## API Endpoints

### Health Check
- `GET /health` - Server status check

### Items
- `GET /api/items` - Get all items with optional filtering
- `GET /api/items/category/:category` - Get items by category
- `GET /api/items/search?q=query` - Search items by name/description
- `GET /api/items/:id` - Get single item by ID
- `GET /api/items/categories` - Get all available categories

### Query Parameters

#### For `/api/items`:
- `limit` (number): Number of items to return (default: 50)
- `offset` (number): Number of items to skip (default: 0)
- `category` (string): Filter by category
- `price_min` (number): Minimum price filter
- `price_max` (number): Maximum price filter

#### For `/api/items/search`:
- `q` (string, required): Search query
- `limit` (number): Number of items to return (default: 50)
- `offset` (number): Number of items to skip (default: 0)

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 25
  }
}
```

## Error Handling

Errors are returned in this format:

```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

## Clover API Integration

The server uses the Clover REST API v3 to fetch:
- Product inventory
- Categories
- Product details
- Pricing information

The API key is configured in the environment variables and automatically included in all requests.

## Development

### Project Structure
```
server/
├── index.js              # Main server file
├── package.json          # Dependencies and scripts
├── env.example           # Environment variables template
├── routes/
│   └── itemRoutes.js     # API route definitions
├── controllers/
│   └── itemController.js # Request handlers
└── utils/
    └── cloverClient.js   # Clover API client
```

### Adding New Endpoints

1. Add route in `routes/itemRoutes.js`
2. Create controller method in `controllers/itemController.js`
3. Update Clover client if needed in `utils/cloverClient.js`

## Security

- CORS protection configured
- Helmet.js for security headers
- Request logging with Morgan
- Environment variable protection
- Input validation and sanitization

## Troubleshooting

1. **API Key Issues**: Verify your Clover API key is correct
2. **Merchant ID**: Ensure your merchant ID is set in environment variables
3. **CORS Errors**: Check that `CORS_ORIGIN` matches your frontend URL
4. **Rate Limiting**: Clover API has rate limits; implement caching if needed

## License

ISC License 