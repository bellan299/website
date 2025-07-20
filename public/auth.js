// Authentication Utilities
class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        this.checkAuthState();
    }

    checkAuthState() {
        // Check localStorage for existing session
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            try {
                this.currentUser = JSON.parse(user);
                this.isAuthenticated = true;
                this.updateUI();
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                this.logout();
            }
        }
    }

    updateUI() {
        if (this.isAuthenticated && this.currentUser) {
            // Update navigation to show user menu
            const navAuth = document.querySelector('.nav-auth');
            if (navAuth) {
                navAuth.innerHTML = `
                    <div class="user-menu">
                        <button class="user-btn" onclick="showUserMenu()">
                            <img src="${this.currentUser.picture || '/default-avatar.png'}" alt="${this.currentUser.name}" class="user-avatar">
                            <span>${this.currentUser.firstName || this.currentUser.name}</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="user-dropdown" id="user-dropdown">
                            <a href="#" onclick="showAuthModal('profile')">Profile</a>
                            <a href="#" onclick="logout()">Sign Out</a>
                        </div>
                    </div>
                `;
            }
        } else {
            // Show sign-in/sign-up buttons
            const navAuth = document.querySelector('.nav-auth');
            if (navAuth) {
                navAuth.innerHTML = `
                    <button class="auth-btn signin-btn" onclick="showAuthModal('login')">Sign In</button>
                    <button class="auth-btn signup-btn" onclick="showAuthModal('register')">Sign Up</button>
                `;
            }
        }
    }

    setUser(userData) {
        this.currentUser = userData;
        this.isAuthenticated = true;
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authToken', 'dummy-token'); // Replace with real token
        
        this.updateUI();
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        
        this.updateUI();
    }

    getUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.isAuthenticated;
    }
}

// Initialize auth instance
window.auth = new Auth(); 