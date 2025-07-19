// Firebase Configuration
// Your web app's Firebase configuration
// [STUBBED FOR PUBLIC DEPLOYMENT]
// Replace these placeholder values with your real Firebase config when enabling API functionality.
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Stub out Firebase initialization and API usage for public deployment
function isFirebaseConfigured() {
  return false; // Always false while stubbed
}

// Declare auth and provider variables first
let auth = null;
let googleProvider = null;
let appleProvider = null;

// Initialize Firebase only if config is valid
if (isFirebaseConfigured()) {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
    
    // Initialize auth and providers
    auth = firebase.auth();
    googleProvider = new firebase.auth.GoogleAuthProvider();
    appleProvider = new firebase.auth.OAuthProvider('apple.com');
    
    // Configure providers
    if (googleProvider) {
        googleProvider.addScope('email');
        googleProvider.addScope('profile');
    }
    
    if (appleProvider) {
        appleProvider.addScope('email');
        appleProvider.addScope('name');
    }
    
    // Set up auth state observer
    if (auth) {
        console.log('Setting up auth state observer...');
        auth.onAuthStateChanged((user) => {
            console.log('=== AUTH STATE CHANGED ===');
            console.log('User object:', user);
            console.log('User UID:', user?.uid);
            console.log('User email:', user?.email);
            console.log('User displayName:', user?.displayName);
            console.log('Auth currentUser:', auth.currentUser);
            console.log('========================');
            
            if (user) {
                // User is signed in
                const userData = {
                    id: user.uid,
                    email: user.email,
                    name: user.displayName,
                    firstName: user.displayName?.split(' ')[0] || '',
                    lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                    picture: user.photoURL,
                    provider: user.providerData[0]?.providerId || 'unknown'
                };
                
                console.log('Updating UI for signed-in user:', userData);
                
                // Update local auth system
                if (window.auth && window.auth.setUser) {
                    window.auth.setUser(userData);
                }
                
                // Update UI to show My Account button
                updateAuthUIForSignedInUser(userData);
                
            } else {
                // User is signed out
                console.log('Updating UI for signed-out user');
                
                if (window.auth && window.auth.setUser) {
                    window.auth.setUser(null);
                }
                
                // Reset UI to show sign-in/sign-up buttons
                updateAuthUIForSignedOutUser();
            }
        });
    } else {
        console.error('Auth not available for state observer');
    }
} else {
    console.error('Firebase not configured! Please update firebase-config.js with your actual Firebase credentials.');
    // Show user-friendly error
    if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', () => {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #dc2626;
                color: white;
                padding: 16px;
                border-radius: 8px;
                z-index: 10000;
                max-width: 300px;
                font-family: Arial, sans-serif;
            `;
            errorDiv.innerHTML = `
                <strong>Firebase Configuration Error</strong><br>
                Please update firebase-config.js with your Firebase credentials to enable Google sign-in.
            `;
            document.body.appendChild(errorDiv);
        });
    }
}

// Phone Auth Settings
const phoneAuthSettings = {
    recaptchaVerifier: null,
    appVerifier: null
};

// Initialize reCAPTCHA for phone auth
function initializeRecaptcha() {
    if (!isFirebaseConfigured()) {
        console.error('Firebase not configured for phone auth');
        return;
    }
    
    if (!phoneAuthSettings.recaptchaVerifier) {
        phoneAuthSettings.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                console.log('reCAPTCHA solved');
            }
        });
    }
}

// Google Sign-In with Firebase (Popup method - more reliable)
async function signInWithGoogle() {
    console.log('Google sign-in initiated (popup method)...');
    
    if (!isFirebaseConfigured()) {
        console.error('Firebase not configured');
        alert('Firebase not configured. Please contact support.');
        return;
    }
    
    if (!auth) {
        console.error('Firebase Auth not initialized');
        alert('Authentication not available. Please refresh the page.');
        return;
    }
    
    if (!googleProvider) {
        console.error('Google provider not initialized');
        alert('Google sign-in not available. Please refresh the page.');
        return;
    }
    
    try {
        console.log('Attempting Google sign-in popup...');
        
        // Use popup instead of redirect
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        
        console.log('Google Sign-In Success (popup):', user);
        
        // Extract user data
        const userData = {
            id: user.uid,
            email: user.email,
            name: user.displayName,
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            picture: user.photoURL,
            provider: user.providerData[0]?.providerId || 'unknown'
        };
        
        console.log('User data extracted:', userData);
        
        // Update local auth system
        if (window.auth && window.auth.setUser) {
            window.auth.setUser(userData);
        }
        
        // Update UI to show logged-in state
        updateAuthUIForSignedInUser(userData);
        
        // Close the auth modal if it's open
        if (window.authUI && window.authUI.closeCurrentModal) {
            window.authUI.closeCurrentModal();
        }
        
        // Show success message
        if (window.authUI && window.authUI.showSuccess) {
            window.authUI.showSuccess('Successfully signed in with Google!');
        } else {
            alert('Successfully signed in with Google!');
        }
        
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        let errorMessage = 'Google sign-in failed. Please try again.';
        
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign-in cancelled';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Pop-up blocked. Please allow pop-ups for this site and try again.';
        } else if (error.code === 'auth/unauthorized-domain') {
            errorMessage = 'This domain is not authorized for Google sign-in. Please contact support.';
        } else if (error.code === 'auth/operation-not-allowed') {
            errorMessage = 'Google sign-in is not enabled. Please contact support.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Network error. Please check your internet connection.';
        }
        
        if (window.authUI && window.authUI.showError) {
            window.authUI.showError(errorMessage);
        } else {
            alert(errorMessage);
        }
    }
}

// Google Sign-Up with Firebase (same as sign-in for new users)
async function signUpWithGoogle() {
    // Firebase handles both sign-in and sign-up automatically
    await signInWithGoogle();
}

// Apple Sign-In with Firebase
async function signInWithApple() {
    if (!isFirebaseConfigured()) {
        window.authUI.showError('Firebase not configured. Please contact support.');
        return;
    }
    
    try {
        window.authUI.showSuccess('Signing in with Apple...');
        
        const result = await auth.signInWithPopup(appleProvider);
        const user = result.user;
        
        console.log('Apple Sign-In Success:', user);
        
        // Extract user data
        const userData = {
            id: user.uid,
            email: user.email,
            name: user.displayName,
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            picture: user.photoURL,
            provider: 'apple'
        };
        
        // Update local auth system
        window.auth.setUser(userData);
        
        // Close modal and show success
        window.authUI.showSuccess('Successfully signed in with Apple!');
        window.authUI.closeCurrentModal();
        
    } catch (error) {
        console.error('Apple Sign-In Error:', error);
        window.authUI.showError('Apple sign-in failed. Please try again.');
    }
}

// Enhanced backend authentication function
async function authenticateWithBackend(userData, provider) {
    try {
        // Get Firebase ID token
        const idToken = await auth.currentUser.getIdToken();
        
        // Send to your backend API
        const response = await fetch('/api/auth/social-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                userData,
                provider,
                firebaseUid: auth.currentUser.uid
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            window.authUI.showSuccess('Sign-in successful!');
            window.authUI.closeCurrentModal();
            
            // Update UI to show logged-in state
            updateAuthUI(result.user);
        } else {
            throw new Error('Authentication failed');
        }
        
    } catch (error) {
        console.error('Backend Authentication error:', error);
        window.authUI.showError('Sign-in failed. Please try again.');
    }
}

// Enhanced backend registration function
async function registerWithBackend(userData, provider) {
    try {
        // Get Firebase ID token
        const idToken = await auth.currentUser.getIdToken();
        
        // Send to your backend API
        const response = await fetch('/api/auth/social-register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                userData,
                provider,
                firebaseUid: auth.currentUser.uid
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            window.authUI.showSuccess('Account created successfully!');
            window.authUI.closeCurrentModal();
            
            // Update UI to show logged-in state
            updateAuthUI(result.user);
        } else {
            throw new Error('Registration failed');
        }
        
    } catch (error) {
        console.error('Backend Registration error:', error);
        window.authUI.showError('Account creation failed. Please try again.');
    }
}

// Enhanced logout function
async function logout() {
    if (!auth) {
        console.error('Firebase Auth not available');
        return;
    }
    
    try {
        await auth.signOut();
        console.log('User signed out successfully');
        
        // The auth state observer will automatically update the UI
        if (window.authUI && window.authUI.showSuccess) {
            window.authUI.showSuccess('Signed out successfully');
        }
        
    } catch (error) {
        console.error('Logout error:', error);
        if (window.authUI && window.authUI.showError) {
            window.authUI.showError('Logout failed. Please try again.');
        }
    }
}

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User is signed in:', user);
        // User is signed in, you can update UI here
    } else {
        console.log('User is signed out');
        // User is signed out, you can update UI here
    }
});

// Export functions for use in other files
window.firebaseAuth = {
    signInWithGoogle,
    signUpWithGoogle,
    signInWithApple,
    signInWithPhone,
    verifyPhoneCode,
    logout,
    auth
}; 

// Test function to check Firebase configuration
function testFirebaseConfig() {
    console.log('=== Firebase Configuration Test ===');
    console.log('Firebase Config:', firebaseConfig);
    console.log('isFirebaseConfigured():', isFirebaseConfigured());
    console.log('Firebase Auth available:', !!auth);
    console.log('Google Provider available:', !!googleProvider);
    console.log('Current domain:', window.location.hostname);
    console.log('Current URL:', window.location.href);
    console.log('===================================');
}

// Run test when page loads
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            testFirebaseConfig();
            // handleRedirectResult(); // Handle any redirect results - REMOVED
            checkAndUpdateAuthUI(); // Check and update auth UI
        }, 1000); // Wait for Firebase to initialize
    });
}

// Make test function globally available
if (typeof window !== 'undefined') {
    window.testFirebaseConfig = testFirebaseConfig;
} 

// UI Update Functions
function updateAuthUIForSignedInUser(userData) {
    console.log('Updating UI for signed-in user:', userData);
    const navAuth = document.querySelector('.nav-auth');
    if (navAuth) {
        navAuth.innerHTML = `
            <button class="auth-btn account-btn" onclick="showAccountPage()">
                <i class="fas fa-user"></i>
                My Account
            </button>
        `;
        console.log('UI updated: My Account button shown');
    } else {
        console.error('nav-auth element not found');
    }
}

function updateAuthUIForSignedOutUser() {
    console.log('Updating UI for signed-out user');
    const navAuth = document.querySelector('.nav-auth');
    if (navAuth) {
        navAuth.innerHTML = `
            <button class="auth-btn signin-btn" onclick="showAuthModal('login')">Sign In</button>
            <button class="auth-btn signup-btn" onclick="showAuthModal('register')">Sign Up</button>
        `;
        console.log('UI updated: Sign In/Sign Up buttons shown');
    } else {
        console.error('nav-auth element not found');
    }
}

// Manual function to check and update UI (for debugging)
function checkAndUpdateAuthUI() {
    console.log('Checking auth state...');
    if (auth && auth.currentUser) {
        console.log('User is signed in, updating UI...');
        const userData = {
            id: auth.currentUser.uid,
            email: auth.currentUser.email,
            name: auth.currentUser.displayName,
            firstName: auth.currentUser.displayName?.split(' ')[0] || '',
            lastName: auth.currentUser.displayName?.split(' ').slice(1).join(' ') || '',
            picture: auth.currentUser.photoURL,
            provider: auth.currentUser.providerData[0]?.providerId || 'unknown'
        };
        updateAuthUIForSignedInUser(userData);
    } else {
        console.log('User is signed out, updating UI...');
        updateAuthUIForSignedOutUser();
    }
} 

// Global functions
function showAccountPage() {
    console.log('Redirecting to account page...');
    window.location.href = 'account.html';
} 

// Optionally, export a stub or add a warning for developers
console.warn('Firebase API is currently disabled for public deployment. Restore config and logic to enable.'); 