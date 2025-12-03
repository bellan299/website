// Enhanced responsive navigation with mobile menu support
let lastScrollY = window.scrollY;
let ticking = false;
const header = document.querySelector('.header');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navMenu = document.getElementById('nav-menu');
const SCROLL_THRESHOLD = 10;

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
    
    const scrollingDown = currentScrollY > lastScrollY + SCROLL_THRESHOLD;
    const scrollingUp = currentScrollY < lastScrollY - SCROLL_THRESHOLD;

    // Show when near top or scrolling up
    if (currentScrollY <= SCROLL_THRESHOLD || scrollingUp) {
        header.style.transform = 'translateY(0)';
        header.classList.add('header-visible');
        header.classList.remove('header-hidden');
    } else if (scrollingDown) {
        header.style.transform = 'translateY(-100%)';
        header.classList.remove('header-visible');
        header.classList.add('header-hidden');
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
    const form = event.target;
    if (!window.fetch) {
        return; // Allow native form submission if fetch is unavailable
    }

    event.preventDefault();
    const formData = new FormData(form);
    const submitButton = form.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    const honeypot = form.querySelector('input[name=\"company\"]');
    if (honeypot && honeypot.value.trim()) {
        return; // Likely bot submission
    }
    
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

    // FAQ accordion
    const faqButtons = document.querySelectorAll('.faq-question');
    faqButtons.forEach((btn) => {
        const answer = btn.nextElementSibling;
        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!expanded));
            if (answer) {
                answer.hidden = expanded;
            }
        });
    });
});
