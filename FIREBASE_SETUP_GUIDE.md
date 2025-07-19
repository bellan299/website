# Firebase Setup Guide for Google Sign-In

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "jps-liquor-website")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Google" as a sign-in provider:
   - Click on "Google"
   - Toggle "Enable"
   - Add your support email
   - Click "Save"

## Step 3: Get Your Firebase Config

1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app:
   - Enter app nickname (e.g., "Jp's Liquor Website")
   - Check "Also set up Firebase Hosting" if you want to host your site
   - Click "Register app"
6. Copy the Firebase config object (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 4: Update Your Firebase Config

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY_HERE",
    authDomain: "YOUR_ACTUAL_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_ACTUAL_PROJECT_ID",
    storageBucket: "YOUR_ACTUAL_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
    appId: "YOUR_ACTUAL_APP_ID"
};
```

## Step 5: Authorize Your Domain (Important!)

1. In Firebase Console, go to Authentication → Settings
2. Scroll down to "Authorized domains"
3. Add your domain:
   - For local testing: `localhost`
   - For production: your actual domain (e.g., `jpsliquor.com`)
4. Click "Add"

## Step 6: Test Google Sign-In

1. Open your website in a browser
2. Click "Sign In" or "Sign Up"
3. Click the "Google" button
4. You should see a Google sign-in popup

## Troubleshooting

### If you see "Firebase Configuration Error":
- Make sure you've updated `firebase-config.js` with your actual Firebase credentials
- Check that all values are correct and not placeholder text

### If you see "This domain is not authorized":
- Add your domain to the authorized domains list in Firebase Console
- For local testing, make sure `localhost` is added

### If popup is blocked:
- Allow popups for your website in your browser settings
- Try using a different browser

### If you see "Google sign-in failed":
- Check the browser console for specific error messages
- Make sure Google sign-in is enabled in Firebase Console
- Verify your Firebase config is correct

## Security Notes

- Never commit your Firebase API keys to public repositories
- For production, consider using environment variables
- The API key is safe to expose in client-side code (Firebase handles security)

## Next Steps

Once Google sign-in is working, you can:
1. Add more authentication providers (Apple, Facebook, etc.)
2. Set up user profile management
3. Connect to your backend API
4. Add user roles and permissions 