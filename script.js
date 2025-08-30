const header = document.querySelector('.header');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navMenu = document.getElementById('nav-menu');
let lastScrollY = window.scrollY;
let ticking = false;

function toggleMobileMenu() {
  navMenu.classList.toggle('active');
  const expanded = navMenu.classList.contains('active');
  mobileMenuToggle.innerHTML = expanded ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  mobileMenuToggle.setAttribute('aria-expanded', expanded);
}

function closeMobileMenu() {
  navMenu.classList.remove('active');
  mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
  mobileMenuToggle.setAttribute('aria-expanded', 'false');
}

function updateHeader() {
  const currentScrollY = window.scrollY;
  if (currentScrollY <= 5) {
    header.style.transform = 'translateY(0)';
  } else if (currentScrollY > lastScrollY) {
    header.style.transform = 'translateY(-100%)';
    closeMobileMenu();
  }
  lastScrollY = currentScrollY;
  ticking = false;
}

mobileMenuToggle.addEventListener('click', toggleMobileMenu);
document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', closeMobileMenu));
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateHeader);
    ticking = true;
  }
});
