// Main Website Script
class JpsLiquorWebsite {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentCategory = '';
        this.currentSort = 'name';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadProducts();
        this.setupMobileMenu();
    }

    bindEvents() {
        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterProducts(e.target.value, this.currentSort);
            });
        }

        // Sort filter
        const sortFilter = document.getElementById('sort-filter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.filterProducts(this.currentCategory, e.target.value);
            });
        }

        // Contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navAuth = document.querySelector('.nav-auth');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
                
                // Also toggle auth buttons on mobile
                if (navAuth) {
                    navAuth.classList.toggle('active');
                }
            });
        }
    }

    async loadProducts() {
        try {
            this.showLoading(true);
            
            // Simulate loading products from Clover API
            // In production, this would be a real API call
            await this.simulateProductLoading();
            
            this.renderProducts();
            this.renderBestSellers();
            this.renderNewArrivals();
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Failed to load products. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async simulateProductLoading() {
        try {
            // Fetch real products from Clover API
            const response = await fetch('/api/products');
            const data = await response.json();
            
            if (data.success) {
                this.products = data.products.map(product => ({
                    ...product,
                    // Add fallback image if no image from Clover
                    image: product.image || this.getDefaultImageForCategory(product.category)
                }));
                console.log(`Loaded ${this.products.length} products from Clover`);
            } else {
                console.error('Failed to load products:', data.error);
                this.products = [];
            }
        } catch (error) {
            console.error('Error loading products from Clover:', error);
            this.products = [];
        }
        
        this.filteredProducts = [...this.products];
    }

    getDefaultImageForCategory(category) {
        // Return default images based on category
        const defaultImages = {
            'wine': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&h=300&fit=crop',
            'spirits': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
            'beer': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
            'seltzer': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
            'thc': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
            'other': 'https://via.placeholder.com/160x180/f3e9e6/7b1e3a?text=Product'
        };
        
        return defaultImages[category] || defaultImages['other'];
    }

    filterProducts(category = '', sort = 'name') {
        this.currentCategory = category;
        this.currentSort = sort;
        
        // Filter by category
        let filtered = this.products;
        if (category) {
            filtered = this.products.filter(product => product.category === category);
        }
        
        // Sort products
        filtered.sort((a, b) => {
            switch (sort) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'popularity':
                    return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });
        
        this.filteredProducts = filtered;
        this.renderProducts();
    }

    renderProducts() {
        const grid = document.getElementById('all-products-grid');
        if (!grid) return;
        
        grid.innerHTML = this.filteredProducts.map(product => this.createProductCard(product)).join('');
    }

    renderBestSellers() {
        const grid = document.getElementById('bestsellers-grid');
        if (!grid) return;
        
        const bestSellers = this.products.filter(product => product.isBestSeller);
        grid.innerHTML = bestSellers.map(product => this.createProductCard(product)).join('');
    }

    renderNewArrivals() {
        const grid = document.getElementById('newarrivals-grid');
        if (!grid) return;
        
        const newArrivals = this.products.filter(product => product.isNewArrival);
        grid.innerHTML = newArrivals.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        const badge = product.isBestSeller ? '<div class="product-badge">Best Seller</div>' : 
                     product.isNewArrival ? '<div class="product-badge new">New</div>' : '';
        
        return `
            <div class="product-card">
                ${badge}
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/160x180/f3e9e6/7b1e3a?text=Product'">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
    }

    showLoading(show) {
        const loadingModal = document.getElementById('loading-modal');
        if (loadingModal) {
            if (show) {
                loadingModal.classList.add('active');
            } else {
                loadingModal.classList.remove('active');
            }
        }
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
            border-radius: 14px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async handleContactForm(e) {
        e.preventDefault();
        
        const form = e.target;
        const button = form.querySelector('.submit-button');
        const originalText = button.textContent;
        
        // Show loading state
        button.textContent = 'Sending...';
        button.disabled = true;
        
        try {
            // Simulate form submission
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success message
            this.showSuccess('Message sent successfully! We\'ll get back to you soon.');
            form.reset();
            
        } catch (error) {
            this.showError('Failed to send message. Please try again.');
        } finally {
            // Reset button
            button.textContent = originalText;
            button.disabled = false;
        }
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
            background: #2e7d32;
            color: white;
            padding: 12px 20px;
            border-radius: 14px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Cart functionality
function addToCart(productId) {
    // Get product details
    const product = window.website.products.find(p => p.id === productId);
    if (!product) return;
    
    // Add to cart (implement cart logic here)
    console.log('Added to cart:', product);
    
    // Show success message
    window.website.showSuccess(`${product.name} added to cart!`);
}

// Initialize website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.website = new JpsLiquorWebsite();
}); 