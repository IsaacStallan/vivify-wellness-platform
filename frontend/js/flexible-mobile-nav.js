// Simple mobile navigation
document.addEventListener('DOMContentLoaded', function() {
    // Basic mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
        });
    }
    
    console.log('Mobile navigation loaded');
});
