// Enhanced responsive navigation with mobile menu support
let lastScrollY = window.scrollY;
let ticking = false;
const header = document.querySelector('.header');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navMenu = document.getElementById('nav-menu');
const SCROLL_THRESHOLD = 5;

// Mobile menu toggle functionality
function toggleMobileMenu() {
    const isActive = navMenu.classList.contains('active');
    
    if (isActive) {
        navMenu.classList.remove('active');
        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
    } else {
        navMenu.classList.add('active');
        mobileMenuToggle.innerHTML = '<i class="fas fa-times"></i>';
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
    }
}

// Close mobile menu when clicking on a link
function closeMobileMenu() {
    navMenu.classList.remove('active');
    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
}

// Close mobile menu when clicking outside
function handleClickOutside(event) {
    if (!header.contains(event.target)) {
        closeMobileMenu();
    }
}

// Enhanced header scroll behavior
function updateHeader() {
    const currentScrollY = window.scrollY;
    
    if (!header) return;
    
    // Only show header when at the very top (within threshold)
    if (currentScrollY <= SCROLL_THRESHOLD) {
        header.style.transform = 'translateY(0)';
        header.classList.add('header-visible');
        header.classList.remove('header-hidden');
    } 
    // Hide header when scrolling down from top
    else if (currentScrollY > lastScrollY && currentScrollY > SCROLL_THRESHOLD) {
        header.style.transform = 'translateY(-100%)';
        header.classList.remove('header-visible');
        header.classList.add('header-hidden');
        // Close mobile menu when hiding header
        closeMobileMenu();
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
    }
}

// Form validation and error handling
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    
    // Basic validation
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            field.style.borderColor = '#e0e0e0';
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Show loading state
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Submit form
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Thank you! Your message has been sent successfully.');
            form.reset();
        } else {
            throw new Error('Network response was not ok');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Sorry, there was an error sending your message. Please try again or call us directly.');
    })
    .finally(() => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Force page to start at top on load/refresh (mobile + desktop)
    window.scrollTo({ top: 0, behavior: 'auto' });

    // Event listeners
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Close menu when clicking on navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', handleClickOutside);
    
    // Throttled scroll event with requestAnimationFrame for smooth performance
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // Handle window resize for responsive behavior
    window.addEventListener('resize', () => {
        if (window.innerWidth > 767) {
            closeMobileMenu();
        }
    });

    // Initialize header state
    updateHeader();
    
    // Add form validation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    // FAQ accordion toggle for desktop + mobile
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!questionBtn || !answer) return;

        questionBtn.addEventListener('click', () => {
            const isExpanded = questionBtn.getAttribute('aria-expanded') === 'true';
            // Close all other items
            faqItems.forEach(otherItem => {
                const otherBtn = otherItem.querySelector('.faq-question');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                if (otherBtn && otherAnswer) {
                    const shouldOpen = otherItem === item && !isExpanded;
                    otherBtn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
                    otherAnswer.hidden = !shouldOpen;
                }
            });
        });
    });
});

// Handle bfcache restores to keep page at top
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.scrollTo({ top: 0, behavior: 'auto' });
    }
});
