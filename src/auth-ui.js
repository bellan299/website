// Authentication UI Handler
// Note: Using the global auth instance from firebase-config.js
// Global functions are now defined in the HTML head section

// Wait for Firebase to be initialized before setting up auth
let auth = null;
let recaptchaVerifier = null;

// Initialize auth and reCAPTCHA when Firebase is ready
function initializeAuthUI() {
    if (window.firebase && window.firebase.auth) {
        auth = window.firebase.auth();
        
        // Set language for SMS messages
        if (auth) {
            auth.languageCode = 'en'; // Set to English for US phone numbers
            // To apply the default browser preference instead of explicitly setting it.
            // auth.useDeviceLanguage();
        }
        
        // Initialize reCAPTCHA for phone auth
        if (auth && window.firebase && window.firebase.auth) {
            recaptchaVerifier = new window.firebase.auth.RecaptchaVerifier('recaptcha-container', {});
            window.recaptchaVerifier = recaptchaVerifier;
        }
        
    } else {
        console.error('Firebase not available for AuthUI initialization');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize auth first
    initializeAuthUI();
    
    // Create AuthUI instance and make it globally available
    try {
        window.authUI = new AuthUI();
    } catch (error) {
        console.error('Error creating AuthUI instance:', error);
        window.authUI = null;
    }
    
    // Handle any pending modals that were queued before AuthUI was ready
    if (window.pendingModals && window.pendingModals.length > 0) {
        const modalType = window.pendingModals.shift(); // Get the first pending modal
        if (modalType && window.authUI) {
            window.authUI.showModal(modalType);
        }
        window.pendingModals = []; // Clear the queue
    }
    
    // Test if buttons are working
    setTimeout(() => {
        const signInBtn = document.querySelector('.signin-btn');
        const signUpBtn = document.querySelector('.signup-btn');
        
        if (signInBtn) {
        }
        if (signUpBtn) {
        }
    }, 1000);
});

// Also initialize immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    initializeAuthUI();
    
    try {
        window.authUI = new AuthUI();
    } catch (error) {
        console.error('Error creating AuthUI instance (immediate):', error);
        window.authUI = null;
    }
    
    // Handle any pending modals
    if (window.pendingModals && window.pendingModals.length > 0) {
        const modalType = window.pendingModals.shift();
        if (modalType && window.authUI) {
            window.authUI.showModal(modalType);
        }
        window.pendingModals = [];
    }
}

// Authentication UI Handler
class AuthUI {
    constructor() {
        this.currentModal = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupFormValidation();
    }

    bindEvents() {
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('auth-modal')) {
                this.closeCurrentModal();
            }
        });

        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeCurrentModal();
            }
        });

        // Form submissions
        document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form')?.addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('forgot-password-form')?.addEventListener('submit', (e) => this.handleForgotPassword(e));
        document.getElementById('phone-login-form')?.addEventListener('submit', (e) => this.handlePhoneLogin(e));
        document.getElementById('phone-register-form')?.addEventListener('submit', (e) => this.handlePhoneRegister(e));
        
        // Initialize auth state observer
        this.initializeAuthObserver();
    }

    showModal(modalType) {
        
        const modal = document.getElementById(`${modalType}-modal`);
        
        if (modal) {
            this.closeCurrentModal();
            modal.classList.add('active');
            this.currentModal = modalType;
            
            // Focus first input
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
            
        } else {
            console.error('Modal not found for type:', modalType);
            console.error('Available modals:', document.querySelectorAll('.auth-modal').length);
            document.querySelectorAll('.auth-modal').forEach(m => {
                console.log('Available modal ID:', m.id);
            });
        }
    }

    closeCurrentModal() {
        if (this.currentModal) {
            const modal = document.getElementById(`${this.currentModal}-modal`);
            if (modal) {
                modal.classList.remove('active');
            }
            this.currentModal = null;
        }
    }

    setupFormValidation() {
        // Password strength checker
        const passwordInput = document.getElementById('register-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
        }

        // Password confirmation
        const confirmPassword = document.getElementById('register-confirm-password');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', (e) => this.checkPasswordMatch(e.target.value));
        }

        // Age verification
        const dobInput = document.getElementById('register-dob');
        if (dobInput) {
            dobInput.addEventListener('change', (e) => this.verifyAge(e.target.value));
        }

        // Phone number formatting
        const phoneLoginInput = document.getElementById('phone-login-number');
        if (phoneLoginInput) {
            phoneLoginInput.addEventListener('input', (e) => this.formatPhoneInput(e.target));
        }

        const phoneRegisterInput = document.getElementById('phone-register-number');
        if (phoneRegisterInput) {
            phoneRegisterInput.addEventListener('input', (e) => this.formatPhoneInput(e.target));
        }
    }

    formatPhoneInput(input) {
        // Remove all non-digit characters
        let value = input.value.replace(/\D/g, '');
        
        // Limit to 10 digits
        value = value.substring(0, 10);
        
        // Format as (XXX) XXX-XXXX
        if (value.length >= 6) {
            value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
        } else if (value.length >= 3) {
            value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
        } else if (value.length > 0) {
            value = `(${value}`;
        }
        
        input.value = value;
    }

    checkPasswordStrength(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        // Update requirement indicators
        Object.keys(requirements).forEach(req => {
            const element = document.querySelector(`[data-requirement="${req}"]`);
            if (element) {
                const icon = element.querySelector('i');
                if (requirements[req]) {
                    icon.className = 'fas fa-check';
                    element.style.color = 'var(--success)';
                } else {
                    icon.className = 'fas fa-circle';
                    element.style.color = 'var(--muted)';
                }
            }
        });

        // Calculate strength
        const strength = Object.values(requirements).filter(Boolean).length;
        const strengthFill = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');
        
        if (strengthFill && strengthText) {
            const percentage = (strength / 5) * 100;
            strengthFill.style.width = `${percentage}%`;
            
            if (strength <= 2) {
                strengthFill.style.backgroundColor = '#ff4444';
                strengthText.textContent = 'Weak';
            } else if (strength <= 3) {
                strengthFill.style.backgroundColor = '#ffaa00';
                strengthText.textContent = 'Fair';
            } else if (strength <= 4) {
                strengthFill.style.backgroundColor = '#ffdd00';
                strengthText.textContent = 'Good';
            } else {
                strengthFill.style.backgroundColor = '#00aa00';
                strengthText.textContent = 'Strong';
            }
        }
    }

    checkPasswordMatch(confirmPassword) {
        const password = document.getElementById('register-password')?.value;
        const errorElement = document.getElementById('register-confirm-password-error');
        
        if (errorElement) {
            if (confirmPassword && password !== confirmPassword) {
                errorElement.textContent = 'Passwords do not match';
                errorElement.style.display = 'block';
            } else {
                errorElement.style.display = 'none';
            }
        }
    }

    verifyAge(dob) {
        const errorElement = document.getElementById('register-dob-error');
        if (errorElement) {
            const birthDate = new Date(dob);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            if (age < 21) {
                errorElement.textContent = 'You must be 21 or older to create an account';
                errorElement.style.display = 'block';
            } else {
                errorElement.style.display = 'none';
            }
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('.auth-button');
        const buttonText = button.querySelector('.button-text');
        const spinner = button.querySelector('.loading-spinner');
        
        // Show loading state
        buttonText.style.display = 'none';
        spinner.style.display = 'inline-block';
        button.disabled = true;

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Check if Firebase is available
            if (!auth) {
                throw new Error('Authentication not available. Please refresh the page.');
            }
            
            // Sign in with Firebase
            const userCredential = await auth.signInWithEmailAndPassword(data.email, data.password);
            const user = userCredential.user;
            
            // Check if email is verified
            if (!user.emailVerified) {
                // Sign out and show verification message
                await auth.signOut();
                throw new Error('Please verify your email address before signing in. Check your inbox for a verification link.');
            }
            
            this.showSuccess('Login successful!');
            this.closeCurrentModal();
            
        } catch (error) {
            console.error('Login error:', error);
            
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email address.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password. Please try again.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.';
            } else if (error.code === 'auth/user-disabled') {
                errorMessage = 'This account has been disabled. Please contact support.';
            } else if (error.message.includes('verify your email')) {
                errorMessage = error.message;
            }
            
            this.showError(errorMessage);
        } finally {
            // Reset button state
            buttonText.style.display = 'inline-block';
            spinner.style.display = 'none';
            button.disabled = false;
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('.auth-button');
        const buttonText = button.querySelector('.button-text');
        const spinner = button.querySelector('.loading-spinner');
        
        // Show loading state
        buttonText.style.display = 'none';
        spinner.style.display = 'inline-block';
        button.disabled = true;

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Validate required fields
            if (!this.validateRegistration(data)) {
                throw new Error('Please fill in all required fields correctly');
            }
            
            // Check if Firebase is available
            if (!auth) {
                throw new Error('Authentication not available. Please refresh the page.');
            }
            
            // Create Firebase account with email and password
            const userCredential = await auth.createUserWithEmailAndPassword(data.email, data.password);
            const user = userCredential.user;
            
            // Update user profile with name
            await user.updateProfile({
                displayName: `${data.firstName} ${data.lastName}`
            });
            
            // Send email verification
            await user.sendEmailVerification();
            
            // Store additional user data in localStorage
            const userData = {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone || '',
                dateOfBirth: data.dateOfBirth || '',
                emailNotifications: data.emailNotifications === 'on',
                smsNotifications: data.smsNotifications === 'on',
                marketingEmails: data.marketingEmails === 'on'
            };
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Show verification modal
            this.closeCurrentModal();
            this.showModal('verification');
            
        } catch (error) {
            console.error('Registration error:', error);
            
            let errorMessage = 'Registration failed. Please try again.';
            
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'An account with this email already exists.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Please choose a stronger password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.';
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = 'Email/password registration is not enabled. Please contact support.';
            }
            
            this.showError(errorMessage);
        } finally {
            // Reset button state
            buttonText.style.display = 'inline-block';
            spinner.style.display = 'none';
            button.disabled = false;
        }
    }

    async handleForgotPassword(e) {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('.auth-button');
        const buttonText = button.querySelector('.button-text');
        const spinner = button.querySelector('.loading-spinner');
        
        // Show loading state
        buttonText.style.display = 'none';
        spinner.style.display = 'inline-block';
        button.disabled = true;

        try {
            const formData = new FormData(form);
            const email = formData.get('email');
            
            // Check if Firebase is available
            if (!auth) {
                throw new Error('Authentication not available. Please refresh the page.');
            }
            
            // Send password reset email through Firebase
            await auth.sendPasswordResetEmail(email);
            
            this.showSuccess('Password reset link sent to your email!');
            this.closeCurrentModal();
            
        } catch (error) {
            console.error('Password reset error:', error);
            
            let errorMessage = 'Failed to send reset link. Please try again.';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email address.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.';
            }
            
            this.showError(errorMessage);
        } finally {
            // Reset button state
            buttonText.style.display = 'inline-block';
            spinner.style.display = 'none';
            button.disabled = false;
        }
    }

    async handlePhoneLogin(e) {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('.auth-button');
        const buttonText = button.querySelector('.button-text');
        const spinner = button.querySelector('.loading-spinner');
        const verificationGroup = document.getElementById('verification-code-group');
        let phoneNumber = document.getElementById('phone-login-number').value;
        
        // Show loading state
        buttonText.style.display = 'none';
        spinner.style.display = 'inline-block';
        button.disabled = true;

        try {
            if (!verificationGroup.style.display || verificationGroup.style.display === 'none') {
                // First step: Send verification code
                if (!auth) {
                    throw new Error('Authentication not available. Please refresh the page.');
                }
                
                // Format phone number to E.164 format
                phoneNumber = this.formatPhoneNumber(phoneNumber);
                if (!phoneNumber) {
                    throw new Error('Please enter a valid phone number in format: (555) 123-4567');
                }
                
                // Send SMS verification code using modern Firebase SDK
                const confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier);
                window.phoneConfirmationResult = confirmationResult;
                
                verificationGroup.style.display = 'block';
                buttonText.textContent = 'Verify Code';
                document.getElementById('verification-code').focus();
                
                this.showSuccess(`Verification code sent to ${phoneNumber}`);
            } else {
                // Second step: Verify code
                const code = document.getElementById('verification-code').value;
                
                if (!code || code.length !== 6) {
                    throw new Error('Please enter a valid 6-digit code');
                }
                
                if (!window.phoneConfirmationResult) {
                    throw new Error('Verification session expired. Please try again.');
                }
                
                // Verify the SMS code using modern Firebase SDK
                const result = await window.phoneConfirmationResult.confirm(code);
                const user = result.user;
                
                console.log('Phone authentication successful:', user);
                
                this.showSuccess('Phone verification successful!');
                this.closeCurrentModal();
            }
            
        } catch (error) {
            console.error('Phone authentication error:', error);
            
            let errorMessage = 'Phone verification failed. Please try again.';
            
            if (error.code === 'auth/invalid-phone-number') {
                errorMessage = 'Please enter a valid phone number in format: (555) 123-4567';
            } else if (error.code === 'auth/invalid-verification-code') {
                errorMessage = 'Invalid verification code. Please try again.';
            } else if (error.code === 'auth/quota-exceeded') {
                errorMessage = 'Too many attempts. Please try again later.';
            } else if (error.message.includes('valid 6-digit code')) {
                errorMessage = error.message;
            } else if (error.message.includes('valid phone number')) {
                errorMessage = error.message;
            }
            
            this.showError(errorMessage);
        } finally {
            // Reset button state
            buttonText.style.display = 'inline-block';
            spinner.style.display = 'none';
            button.disabled = false;
        }
    }

    async handlePhoneRegister(e) {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('.auth-button');
        const buttonText = button.querySelector('.button-text');
        const spinner = button.querySelector('.loading-spinner');
        const verificationGroup = document.getElementById('phone-verification-code-group');
        
        // Show loading state
        buttonText.style.display = 'none';
        spinner.style.display = 'inline-block';
        button.disabled = true;

        try {
            if (!verificationGroup.style.display || verificationGroup.style.display === 'none') {
                // First step: Validate form and send verification code
                const formData = new FormData(form);
                const data = Object.fromEntries(formData);
                
                if (!this.validatePhoneRegistration(data)) {
                    throw new Error('Please fill in all required fields correctly');
                }
                
                if (!auth) {
                    throw new Error('Authentication not available. Please refresh the page.');
                }
                
                // Format phone number to E.164 format
                let phoneNumber = this.formatPhoneNumber(data.phoneNumber);
                if (!phoneNumber) {
                    throw new Error('Please enter a valid phone number in format: (555) 123-4567');
                }
                
                // Send SMS verification code using modern Firebase SDK
                const confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier);
                window.phoneConfirmationResult = confirmationResult;
                
                verificationGroup.style.display = 'block';
                buttonText.textContent = 'Verify Code';
                document.getElementById('phone-verification-code').focus();
                
                this.showSuccess(`Verification code sent to ${phoneNumber}`);
            } else {
                // Second step: Verify code and complete registration
                const code = document.getElementById('phone-verification-code').value;
                
                if (!code || code.length !== 6) {
                    throw new Error('Please enter a valid 6-digit code');
                }
                
                if (!window.phoneConfirmationResult) {
                    throw new Error('Verification session expired. Please try again.');
                }
                
                // Verify the SMS code using modern Firebase SDK
                const result = await window.phoneConfirmationResult.confirm(code);
                const user = result.user;
                
                // Update user profile with name
                await user.updateProfile({
                    displayName: `${document.getElementById('phone-register-firstname').value} ${document.getElementById('phone-register-lastname').value}`
                });
                
                // Store additional user data
                const userData = {
                    firstName: document.getElementById('phone-register-firstname').value,
                    lastName: document.getElementById('phone-register-lastname').value,
                    phone: document.getElementById('phone-register-number').value,
                    dateOfBirth: document.getElementById('phone-register-dob').value,
                    smsNotifications: document.getElementById('phone-marketing-consent').checked
                };
                localStorage.setItem('userData', JSON.stringify(userData));
                
                console.log('Phone registration successful:', user);
                
                this.showSuccess('Account created successfully!');
                this.closeCurrentModal();
            }
            
        } catch (error) {
            console.error('Phone registration error:', error);
            
            let errorMessage = 'Phone registration failed. Please try again.';
            
            if (error.code === 'auth/invalid-phone-number') {
                errorMessage = 'Please enter a valid phone number in format: (555) 123-4567';
            } else if (error.code === 'auth/invalid-verification-code') {
                errorMessage = 'Invalid verification code. Please try again.';
            } else if (error.code === 'auth/quota-exceeded') {
                errorMessage = 'Too many attempts. Please try again later.';
            } else if (error.message.includes('valid 6-digit code')) {
                errorMessage = error.message;
            } else if (error.message.includes('valid phone number')) {
                errorMessage = error.message;
            }
            
            this.showError(errorMessage);
        } finally {
            // Reset button state
            buttonText.style.display = 'inline-block';
            spinner.style.display = 'none';
            button.disabled = false;
        }
    }

    validatePhoneRegistration(data) {
        // Basic validation
        if (!data.firstName || !data.lastName || !data.phoneNumber || !data.dateOfBirth) {
            return false;
        }
        
        if (!data.termsAccept) {
            return false;
        }
        
        return true;
    }

    validateRegistration(data) {
        // Basic validation
        if (!data.firstName || !data.lastName || !data.email || !data.password) {
            return false;
        }
        
        if (data.password !== data.confirmPassword) {
            return false;
        }
        
        if (!data.termsAccept) {
            return false;
        }
        
        return true;
    }

    showSuccess(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 12px 20px;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 12px 20px;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    initializeAuthObserver() {
        // Check if Firebase auth is available
        if (window.firebaseAuth && window.firebaseAuth.auth) {
            window.firebaseAuth.auth.onAuthStateChanged((user) => {
                if (user) {
                    console.log('User is signed in:', user);
                    // Update auth instance
                    if (window.auth) {
                        window.auth.setUser({
                            id: user.uid,
                            email: user.email,
                            name: user.displayName,
                            firstName: user.displayName?.split(' ')[0] || '',
                            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                            picture: user.photoURL,
                            provider: user.providerData[0]?.providerId || 'unknown'
                        });
                    }
                } else {
                    console.log('User is signed out');
                    if (window.auth) {
                        window.auth.logout();
                    }
                }
            });
        }
    }

    formatPhoneNumber(phoneNumber) {
        // Remove all non-digit characters
        const digits = phoneNumber.replace(/\D/g, '');
        
        // Check if it's a valid US phone number (10 digits)
        if (digits.length === 10) {
            // Add US country code (+1)
            return `+1${digits}`;
        }
        
        // Check if it already has country code (+1 and 10 digits = 11 digits total)
        if (digits.length === 11 && digits.startsWith('1')) {
            return `+${digits}`;
        }
        
        // Check if it already has +1 prefix
        if (phoneNumber.startsWith('+1') && digits.length === 11) {
            return phoneNumber;
        }
        
        // Invalid format
        return null;
    }
}

// Close user dropdown when clicking outside
document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('user-dropdown');
    
    if (userMenu && dropdown && !userMenu.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// Google Identity Services Integration
function handleGoogleSignIn(response) {
    // Decode the JWT token
    const responsePayload = decodeJwtResponse(response.credential);
    
    console.log("Google Sign-In Response:", responsePayload);
    
    // Extract user information
    const userData = {
        id: responsePayload.sub,
        email: responsePayload.email,
        name: responsePayload.name,
        firstName: responsePayload.given_name,
        lastName: responsePayload.family_name,
        picture: responsePayload.picture,
        provider: 'google'
    };
    
    // Send to your backend for verification and session creation
    authenticateWithBackend(userData, 'google');
}

function handleGoogleSignUp(response) {
    // Decode the JWT token
    const responsePayload = decodeJwtResponse(response.credential);
    
    console.log("Google Sign-Up Response:", responsePayload);
    
    // Extract user information
    const userData = {
        id: responsePayload.sub,
        email: responsePayload.email,
        name: responsePayload.name,
        firstName: responsePayload.given_name,
        lastName: responsePayload.family_name,
        picture: responsePayload.picture,
        provider: 'google'
    };
    
    // Send to your backend for account creation
    registerWithBackend(userData, 'google');
}

function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
}

async function authenticateWithBackend(userData, provider) {
    try {
        window.authUI.showSuccess(`Signing in with ${provider}...`);
        
        // Send to your backend API
        const response = await fetch('/api/auth/social-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userData,
                provider
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
        console.error('Authentication error:', error);
        window.authUI.showError('Sign-in failed. Please try again.');
    }
}

async function registerWithBackend(userData, provider) {
    try {
        window.authUI.showSuccess(`Creating account with ${provider}...`);
        
        // Send to your backend API
        const response = await fetch('/api/auth/social-register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userData,
                provider
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
        console.error('Registration error:', error);
        window.authUI.showError('Account creation failed. Please try again.');
    }
}

function updateAuthUI(user) {
    // Update navigation to show user is logged in
    const navAuth = document.querySelector('.nav-auth');
    if (navAuth && user) {
        navAuth.innerHTML = `
            <div class="user-menu">
                <button class="user-btn" onclick="showUserMenu()">
                    <img src="${user.picture || '/default-avatar.png'}" alt="${user.name}" class="user-avatar">
                    <span>${user.firstName}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="user-dropdown" id="user-dropdown">
                    <a href="#" onclick="showAuthModal('profile')">Profile</a>
                    <a href="#" onclick="logout()">Sign Out</a>
                </div>
            </div>
        `;
    }
}

// Apple Sign-In (requires Apple Developer account)
function signInWithApple() {
    // Initialize Apple Sign-In
    if (typeof AppleID !== 'undefined') {
        AppleID.auth.signIn().then(function(response) {
            console.log("Apple Sign-In Response:", response);
            
            const userData = {
                id: response.user,
                email: response.email,
                name: response.fullName?.givenName + ' ' + response.fullName?.familyName,
                firstName: response.fullName?.givenName,
                lastName: response.fullName?.familyName,
                provider: 'apple'
            };
            
            authenticateWithBackend(userData, 'apple');
        }).catch(function(error) {
            console.error('Apple Sign-In Error:', error);
            window.authUI.showError('Apple sign-in failed. Please try again.');
        });
    } else {
        window.authUI.showError('Apple Sign-In not configured. Please contact support.');
    }
}

function signUpWithApple() {
    // Apple Sign-In handles both sign-in and sign-up
    signInWithApple();
}

// Legacy functions for backward compatibility
function signInWithGoogleLocal() {
    // Call the Firebase Google sign-in function
    if (typeof signInWithGoogle === 'function') {
        signInWithGoogle();
    } else {
        console.error('Firebase Google sign-in function not found');
        if (window.authUI && window.authUI.showError) {
            window.authUI.showError('Google sign-in not available. Please refresh the page.');
        } else {
            alert('Google sign-in not available. Please refresh the page.');
        }
    }
}

function signUpWithGoogleLocal() {
    // Call the Firebase Google sign-in function (same as sign-in for new users)
    if (typeof signInWithGoogle === 'function') {
        signInWithGoogle();
    } else {
        console.error('Firebase Google sign-in function not found');
        if (window.authUI && window.authUI.showError) {
            window.authUI.showError('Google sign-in not available. Please refresh the page.');
        } else {
            alert('Google sign-in not available. Please refresh the page.');
        }
    }
}

// User Menu Functions
function showUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close user dropdown when clicking outside
document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('user-dropdown');
    
    if (userMenu && dropdown && !userMenu.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

async function logout() {
    try {
        // Call backend logout endpoint
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        // Reset UI to show sign-in/sign-up buttons
        const navAuth = document.querySelector('.nav-auth');
        if (navAuth) {
            navAuth.innerHTML = `
                <button class="auth-btn signin-btn" onclick="showAuthModal('login')">Sign In</button>
                <button class="auth-btn signup-btn" onclick="showAuthModal('register')">Sign Up</button>
            `;
        }
        
        window.authUI.showSuccess('Signed out successfully');
        
    } catch (error) {
        console.error('Logout error:', error);
        window.authUI.showError('Logout failed. Please try again.');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authUI = new AuthUI();
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style); 