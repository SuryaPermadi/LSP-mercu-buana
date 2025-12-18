// LSP Universitas Mercu Buana - JavaScript Functions

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
      navMenu.classList.toggle('active');
      
      // Change icon
      const icon = this.querySelector('span');
      if (navMenu.classList.contains('active')) {
        icon.textContent = '✕';
      } else {
        icon.textContent = '☰';
      }
    });
  }
  
  // Close mobile menu when clicking on a link
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        navMenu.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('span');
        icon.textContent = '☰';
      }
    });
  });
});

// Set active navigation link based on current page
document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
});

// Smooth scroll for anchor links
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

// Add animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe cards and other animated elements
document.addEventListener('DOMContentLoaded', function() {
  const animatedElements = document.querySelectorAll('.card, .info-box, .download-card');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
});

// Form validation (if needed for future forms)
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;
  
  const inputs = form.querySelectorAll('input[required], textarea[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.style.borderColor = 'var(--error)';
      isValid = false;
    } else {
      input.style.borderColor = 'var(--gray)';
    }
  });
  
  return isValid;
}

// Download file function
function downloadFile(filename) {
  // This would trigger actual file download
  // For now, it just shows an alert
  alert('Download ' + filename + ' akan segera dimulai...');
  // In production, you would use:
  // window.location.href = 'path/to/' + filename;
}

// Print page function
function printPage() {
  window.print();
}

// Back to top button
window.addEventListener('scroll', function() {
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    if (window.pageYOffset > 300) {
      backToTop.style.display = 'flex';
    } else {
      backToTop.style.display = 'none';
    }
  }
});

// Search functionality (if needed)
function searchContent(searchTerm) {
  // Implement search logic here
  console.log('Searching for: ' + searchTerm);
}
