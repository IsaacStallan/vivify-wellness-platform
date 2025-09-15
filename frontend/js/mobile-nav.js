// js/flexible-mobile-nav.js - Adapts to any existing header structure

class FlexibleMobileNav {
    constructor() {
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.createMobileMenu();
            this.setupEventListeners();
            this.updateAuthState();
        });
    }
    
    createMobileMenu() {
        const header = document.querySelector('header');
        const nav = document.querySelector('nav');
        
        if (!header || !nav) return;
        
        // Add mobile menu button to existing nav
        this.addMobileMenuButton(nav);
        
        // Create mobile menu overlay
        this.createMobileMenuOverlay(header);
        
        // Add mobile styles
        this.addMobileStyles();
    }
    
    addMobileMenuButton(nav) {
        // Check if mobile button already exists
        if (nav.querySelector('.mobile-menu-btn')) return;
        
        const mobileBtn = document.createElement('button');
        mobileBtn.className = 'mobile-menu-btn';
        mobileBtn.id = 'mobile-menu-btn';
        mobileBtn.innerHTML = `
            <span class="hamburger"></span>
            <span class="hamburger"></span>
            <span class="hamburger"></span>
        `;
        
        // Add to the right side of nav
        const rightNav = nav.querySelector('.right-nav') || nav;
        rightNav.appendChild(mobileBtn);
    }
    
    createMobileMenuOverlay(header) {
        // Check if mobile menu already exists
        if (document.getElementById('mobile-menu')) return;
        
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.id = 'mobile-menu';
        
        // Extract all navigation links from existing nav
        const allLinks = this.extractNavigationLinks();
        
        mobileMenu.innerHTML = `
            <div class="mobile-menu-content">
                <div class="mobile-menu-header">
                    <div class="logo">
                        <a href="index.html">Vivify</a>
                    </div>
                    <button class="mobile-menu-close" id="mobile-menu-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mobile-menu-links">
                    ${allLinks.main}
                    ${allLinks.auth ? `<div class="mobile-menu-divider"></div>${allLinks.auth}` : ''}
                </div>
            </div>
        `;
        
        header.appendChild(mobileMenu);
    }
    
    extractNavigationLinks() {
        const nav = document.querySelector('nav');
        const links = { main: '', auth: '' };
        
        // Find all navigation links
        const allNavLinks = nav.querySelectorAll('a:not(.logo a)');
        
        allNavLinks.forEach(link => {
            const text = link.textContent.trim();
            const href = link.getAttribute('href');
            const isAuth = ['login', 'signup', 'logout', 'dashboard', 'profile'].some(term => 
                text.toLowerCase().includes(term) || href.includes(term)
            );
            
            const isCTA = link.classList.contains('cta-nav') || 
                         text.toLowerCase().includes('start') || 
                         text.toLowerCase().includes('sign up');
            
            const classes = ['mobile-menu-link'];
            if (isCTA) classes.push('mobile-cta');
            
            const linkHTML = `<a href="${href}" class="${classes.join(' ')}" ${link.id ? `id="mobile-${link.id}"` : ''}>${text}</a>`;
            
            if (isAuth) {
                links.auth += linkHTML;
            } else {
                links.main += linkHTML;
            }
        });
        
        return links;
    }
    
    addMobileStyles() {
        // Check if styles already added
        if (document.getElementById('flexible-mobile-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'flexible-mobile-styles';
        style.textContent = `
            .mobile-menu-btn {
                display: none;
                flex-direction: column;
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.5rem;
                z-index: 1001;
            }

            .hamburger {
                width: 25px;
                height: 3px;
                background: #ffffff;
                margin: 3px 0;
                transition: 0.3s;
                border-radius: 2px;
            }

            .mobile-menu-btn.active .hamburger:nth-child(1) {
                transform: rotate(-45deg) translate(-5px, 6px);
            }

            .mobile-menu-btn.active .hamburger:nth-child(2) {
                opacity: 0;
            }

            .mobile-menu-btn.active .hamburger:nth-child(3) {
                transform: rotate(45deg) translate(-5px, -6px);
            }

            .mobile-menu {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: rgba(10, 10, 10, 0.98);
                backdrop-filter: blur(20px);
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .mobile-menu.active {
                opacity: 1;
                visibility: visible;
            }

            .mobile-menu-content {
                height: 100%;
                display: flex;
                flex-direction: column;
                padding: 2rem;
            }

            .mobile-menu-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 3rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 2rem;
            }

            .mobile-menu-close {
                background: none;
                border: none;
                color: #ffffff;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.5rem;
                transition: color 0.3s ease;
            }

            .mobile-menu-close:hover {
                color: #f39c12;
            }

            .mobile-menu-links {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .mobile-menu-link {
                color: #ffffff;
                text-decoration: none;
                font-size: 1.2rem;
                font-weight: 500;
                padding: 1rem 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
            }

            .mobile-menu-link:hover {
                color: #f39c12;
                padding-left: 1rem;
            }

            .mobile-menu-link.mobile-cta {
                background: linear-gradient(135deg, #f39c12, #e67e22);
                color: #000 !important;
                border-radius: 12px;
                margin-top: 1rem;
                text-align: center;
                justify-content: center;
                font-weight: 600;
                border: none;
            }

            .mobile-menu-link.mobile-cta:hover {
                color: #000 !important;
                padding-left: 0;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(243, 156, 18, 0.4);
            }

            .mobile-menu-divider {
                height: 1px;
                background: rgba(255, 255, 255, 0.1);
                margin: 1rem 0;
            }

            @media (max-width: 768px) {
                nav ul:not(.mobile-menu-links) {
                    display: none !important;
                }
                
                .mobile-menu-btn {
                    display: flex;
                }
                
                .mobile-menu {
                    display: block;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    setupEventListeners() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuClose = document.getElementById('mobile-menu-close');
        
        if (!mobileMenuBtn || !mobileMenu) return;
        
        mobileMenuBtn.addEventListener('click', () => this.toggleMenu());
        
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', () => this.closeMenu());
        }
        
        // Close menu when clicking on links
        mobileMenu.querySelectorAll('.mobile-menu-link').forEach(link => {
            link.addEventListener('click', (e) => {
                if (!link.getAttribute('href').startsWith('#')) {
                    this.closeMenu();
                } else {
                    setTimeout(() => this.closeMenu(), 300);
                }
            });
        });
        
        // Close menu when clicking outside
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                this.closeMenu();
            }
        });
    }
    
    toggleMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        mobileMenuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }
    
    closeMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        mobileMenuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    updateAuthState() {
        // This can be called externally to update mobile menu
        const authToken = localStorage.getItem('authToken');
        const userLoggedIn = localStorage.getItem('userLoggedIn');
        const isLoggedIn = !!(authToken || userLoggedIn === 'true');
        
        // Update mobile menu links based on auth state
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && isLoggedIn) {
            // Update any mobile menu links that need auth context
            const dashboardLink = mobileMenu.querySelector('[href*="dashboard"]');
            if (dashboardLink) {
                dashboardLink.textContent = 'Continue Training';
                dashboardLink.classList.add('mobile-cta');
            }
        }
    }
}

// Initialize
const flexibleMobileNav = new FlexibleMobileNav();

// Export for external use
window.FlexibleMobileNav = FlexibleMobileNav;