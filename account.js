// Account Page JavaScript
class AccountPage {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthState();
        this.bindEvents();
        this.setupAuthListener();
    }

    setupAuthListener() {
        if (auth) {
            auth.onAuthStateChanged((user) => {
                console.log('Account page auth state changed:', user ? 'User signed in' : 'User signed out');
                
                if (user) {
                    this.currentUser = user;
                    this.loadUserData();
                } else {
                    // Only redirect if we're sure the user is signed out
                    console.log('User signed out, redirecting to home page');
                    window.location.href = 'index.html';
                }
            });
        }
    }

    checkAuthState() {
        console.log('Checking auth state on account page...');
        
        // Wait for Firebase to initialize
        const checkAuth = () => {
            if (auth && auth.currentUser) {
                console.log('User is signed in:', auth.currentUser);
                this.currentUser = auth.currentUser;
                this.loadUserData();
            } else {
                console.log('No user found, checking again in 1 second...');
                // Try again after a short delay
                setTimeout(checkAuth, 1000);
            }
        };
        
        // Start checking
        checkAuth();
    }

    bindEvents() {
        // Form submissions
        document.getElementById('account-form')?.addEventListener('submit', (e) => this.handleAccountUpdate(e));
        document.getElementById('change-password-form')?.addEventListener('submit', (e) => this.handlePasswordChange(e));
        document.getElementById('preferences-form')?.addEventListener('submit', (e) => this.handlePreferencesUpdate(e));
        
        // Password toggle
        document.querySelectorAll('.password-toggle').forEach(button => {
            button.addEventListener('click', (e) => {
                const input = e.target.closest('.password-input').querySelector('input');
                this.togglePassword(input);
            });
        });
    }

    loadUserData() {
        if (!this.currentUser) return;

        // Populate form fields with user data
        const firstName = this.currentUser.displayName?.split(' ')[0] || '';
        const lastName = this.currentUser.displayName?.split(' ').slice(1).join(' ') || '';
        
        document.getElementById('account-firstname').value = firstName;
        document.getElementById('account-lastname').value = lastName;
        document.getElementById('account-email').value = this.currentUser.email || '';
        
        // Load additional user data from localStorage if available
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        document.getElementById('account-phone').value = userData.phone || '';
        document.getElementById('account-dob').value = userData.dateOfBirth || '';
        
        // Load preferences
        document.getElementById('email-notifications').checked = userData.emailNotifications || false;
        document.getElementById('sms-notifications').checked = userData.smsNotifications || false;
        document.getElementById('marketing-emails').checked = userData.marketingEmails || false;
    }

    async handleAccountUpdate(e) {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('.account-button');
        const buttonText = button.querySelector('.button-text');
        const spinner = button.querySelector('.loading-spinner');
        
        // Show loading state
        buttonText.style.display = 'none';
        spinner.style.display = 'inline-block';
        button.disabled = true;

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Update user data in localStorage
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            userData.firstName = data.firstName;
            userData.lastName = data.lastName;
            userData.phone = data.phone;
            userData.dateOfBirth = data.dateOfBirth;
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showSuccess('Profile updated successfully!');
            
        } catch (error) {
            this.showError('Failed to update profile. Please try again.');
        } finally {
            // Reset button state
            buttonText.style.display = 'inline-block';
            spinner.style.display = 'none';
            button.disabled = false;
        }
    }

    async handlePasswordChange(e) {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('.account-button');
        const buttonText = button.querySelector('.button-text');
        const spinner = button.querySelector('.loading-spinner');
        
        // Show loading state
        buttonText.style.display = 'none';
        spinner.style.display = 'inline-block';
        button.disabled = true;

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Validate passwords match
            if (data.newPassword !== data.confirmNewPassword) {
                throw new Error('New passwords do not match');
            }
            
            // Simulate password change
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showSuccess('Password changed successfully!');
            form.reset();
            
        } catch (error) {
            this.showError(error.message || 'Failed to change password. Please try again.');
        } finally {
            // Reset button state
            buttonText.style.display = 'inline-block';
            spinner.style.display = 'none';
            button.disabled = false;
        }
    }

    async handlePreferencesUpdate(e) {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('.account-button');
        const buttonText = button.querySelector('.button-text');
        const spinner = button.querySelector('.loading-spinner');
        
        // Show loading state
        buttonText.style.display = 'none';
        spinner.style.display = 'inline-block';
        button.disabled = true;

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Update preferences in localStorage
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            userData.emailNotifications = data.emailNotifications === 'on';
            userData.smsNotifications = data.smsNotifications === 'on';
            userData.marketingEmails = data.marketingEmails === 'on';
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showSuccess('Preferences updated successfully!');
            
        } catch (error) {
            this.showError('Failed to update preferences. Please try again.');
        } finally {
            // Reset button state
            buttonText.style.display = 'inline-block';
            spinner.style.display = 'none';
            button.disabled = false;
        }
    }

    togglePassword(input) {
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        
        const button = input.nextElementSibling;
        const icon = button.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        if (type === 'success') {
            notification.style.background = '#10b981';
        } else {
            notification.style.background = '#ef4444';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Global functions
function showAccountPage() {
    window.location.href = 'account.html';
}

function showDeleteAccountModal() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        // Handle account deletion
        logout();
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        
        const button = input.nextElementSibling;
        const icon = button.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.accountPage = new AccountPage();
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
    
    .account-section {
        padding: 80px 0;
        min-height: calc(100vh - 200px);
    }
    
    .account-header {
        text-align: center;
        margin-bottom: 40px;
    }
    
    .account-header h1 {
        font-size: 2.5rem;
        color: var(--primary);
        margin-bottom: 10px;
    }
    
    .account-content {
        max-width: 800px;
        margin: 0 auto;
    }
    
    .account-card {
        background: white;
        border-radius: 12px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .account-card h2 {
        font-size: 1.5rem;
        color: var(--primary);
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .account-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .form-group label {
        font-weight: 500;
        color: var(--text);
    }
    
    .form-group input {
        padding: 12px 16px;
        border: 2px solid var(--border);
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s;
    }
    
    .form-group input:focus {
        outline: none;
        border-color: var(--primary);
    }
    
    .form-group input[readonly] {
        background-color: var(--background);
        color: var(--muted);
    }
    
    .form-help {
        font-size: 0.875rem;
        color: var(--muted);
    }
    
    .account-button {
        background: var(--primary);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    
    .account-button:hover {
        background: var(--primary-dark);
    }
    
    .account-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .secondary-button {
        background: var(--secondary);
        color: var(--text);
        border: 2px solid var(--border);
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
    }
    
    .secondary-button:hover {
        background: var(--background);
        border-color: var(--text);
    }
    
    .danger-zone {
        border: 2px solid #ef4444;
    }
    
    .danger-zone h2 {
        color: #ef4444;
    }
    
    .danger-button {
        background: #ef4444;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
    }
    
    .danger-button:hover {
        background: #dc2626;
    }
    
    @media (max-width: 768px) {
        .form-row {
            grid-template-columns: 1fr;
        }
        
        .account-card {
            padding: 20px;
        }
    }
`;
document.head.appendChild(style); 