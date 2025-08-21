// PWA Installation and Management Script
class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    init() {
        // Check if already installed
        this.checkInstallStatus();
        
        // Register service worker
        this.registerServiceWorker();
        
        // Set up install prompt
        this.setupInstallPrompt();
        
        // Create install button
        this.createInstallButton();
        
        // Handle app installed event
        this.handleAppInstalled();
        
        // Set up update notifications
        this.setupUpdateNotifications();
    }

    checkInstallStatus() {
        // Check if running as PWA
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            this.isInstalled = true;
            document.body.classList.add('pwa-installed');
        }
        
        // Check if installed via browser
        if ('getInstalledRelatedApps' in navigator) {
            navigator.getInstalledRelatedApps().then(relatedApps => {
                if (relatedApps.length > 0) {
                    this.isInstalled = true;
                    document.body.classList.add('pwa-installed');
                }
            });
        }
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully:', registration);
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
                
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('Install prompt available');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
    }

    createInstallButton() {
        // Create install button if it doesn't exist
        if (!document.getElementById('pwa-install-btn') && !this.isInstalled) {
            const installBtn = document.createElement('button');
            installBtn.id = 'pwa-install-btn';
            installBtn.className = 'pwa-install-button';
            installBtn.innerHTML = `
                <span class="install-icon">📱</span>
                <span class="install-text">Install App</span>
            `;
            installBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #f39c12, #e67e22);
                color: white;
                border: none;
                border-radius: 50px;
                padding: 12px 20px;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
                z-index: 1000;
                display: none;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                animation: pulse 2s infinite;
            `;
            
            installBtn.addEventListener('click', () => this.installApp());
            document.body.appendChild(installBtn);
            
            // Add CSS for animations
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                .pwa-install-button:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 20px rgba(243, 156, 18, 0.4) !important;
                }
                
                .pwa-install-button:active {
                    transform: translateY(0) !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    showInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn && !this.isInstalled) {
            installBtn.style.display = 'flex';
        }
    }

    hideInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    async installApp() {
        if (!this.deferredPrompt) {
            this.showInstallInstructions();
            return;
        }

        try {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user's response
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
                this.hideInstallButton();
                this.showInstallSuccess();
            } else {
                console.log('User dismissed the install prompt');
            }
            
            // Clear the deferredPrompt
            this.deferredPrompt = null;
            
        } catch (error) {
            console.error('Error during app installation:', error);
            this.showInstallInstructions();
        }
    }

    showInstallInstructions() {
        const modal = document.createElement('div');
        modal.className = 'install-instructions-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <button class="close-btn" onclick="this.closest('.install-instructions-modal').remove()">×</button>
                    <h3>📱 Install Wellness Hub</h3>
                    <div class="install-steps">
                        <div class="step">
                            <h4>📱 On Mobile (iOS):</h4>
                            <ol>
                                <li>Tap the Share button <span class="icon">📤</span></li>
                                <li>Scroll down and tap "Add to Home Screen"</li>
                                <li>Tap "Add" to confirm</li>
                            </ol>
                        </div>
                        <div class="step">
                            <h4>📱 On Mobile (Android):</h4>
                            <ol>
                                <li>Tap the menu button <span class="icon">⋮</span></li>
                                <li>Tap "Add to Home screen" or "Install app"</li>
                                <li>Tap "Add" to confirm</li>
                            </ol>
                        </div>
                        <div class="step">
                            <h4>💻 On Desktop:</h4>
                            <ol>
                                <li>Look for the install icon in your address bar</li>
                                <li>Click it and follow the prompts</li>
                                <li>Or use browser menu > "Install Wellness Hub"</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
        `;
        
        // Add styles for the modal
        const modalStyle = document.createElement('style');
        modalStyle.textContent = `
            .modal-overlay {
                background: rgba(0, 0, 0, 0.8);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .modal-content {
                background: #1a1a1a;
                color: white;
                border-radius: 12px;
                padding: 30px;
                max-width: 500px;
                width: 100%;
                position: relative;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            }
            
            .close-btn {
                position: absolute;
                top: 15px;
                right: 20px;
                background: none;
                border: none;
                color: #ccc;
                font-size: 24px;
                cursor: pointer;
            }
            
            .modal-content h3 {
                color: #f39c12;
                margin-bottom: 20px;
                text-align: center;
            }
            
            .install-steps {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .step {
                background: rgba(255, 255, 255, 0.05);
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #f39c12;
            }
            
            .step h4 {
                color: #f39c12;
                margin-bottom: 10px;
            }
            
            .step ol {
                margin: 0;
                padding-left: 20px;
            }
            
            .step li {
                margin-bottom: 5px;
                line-height: 1.5;
            }
            
            .icon {
                background: #f39c12;
                color: #000;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: bold;
            }
            
            @media (max-width: 600px) {
                .modal-content {
                    padding: 20px;
                    margin: 10px;
                }
                
                .install-steps {
                    gap: 15px;
                }
            }
        `;
        document.head.appendChild(modalStyle);
        document.body.appendChild(modal);
    }

    showInstallSuccess() {
        const notification = document.createElement('div');
        notification.className = 'install-success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="success-icon">✅</span>
                <span class="success-text">App installed successfully!</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #2ecc71, #27ae60);
            color: white;
            padding: 15px 25px;
            border-radius: 50px;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
            animation: slideDown 0.5s ease;
        `;
        
        const notificationStyle = document.createElement('style');
        notificationStyle.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: bold;
            }
        `;
        document.head.appendChild(notificationStyle);
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
            notificationStyle.remove();
        }, 3000);
    }

    handleAppInstalled() {
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.isInstalled = true;
            this.hideInstallButton();
            document.body.classList.add('pwa-installed');
            
            // Track installation
            this.trackInstallation();
        });
    }

    setupUpdateNotifications() {
        // Listen for service worker updates
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    }

    showUpdateNotification() {
        const updateNotification = document.createElement('div');
        updateNotification.className = 'update-notification';
        updateNotification.innerHTML = `
            <div class="update-content">
                <span class="update-icon">🔄</span>
                <span class="update-text">New version available!</span>
                <button class="update-btn" onclick="this.closest('.update-notification').updateApp()">Update</button>
                <button class="dismiss-btn" onclick="this.closest('.update-notification').remove()">×</button>
            </div>
        `;
        
        updateNotification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            padding: 15px;
            border-radius: 12px;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
            animation: slideUp 0.5s ease;
        `;
        
        updateNotification.updateApp = () => {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            }
        };
        
        const updateStyle = document.createElement('style');
        updateStyle.textContent = `
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .update-content {
                display: flex;
                align-items: center;
                gap: 15px;
                justify-content: space-between;
            }
            
            .update-btn {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
                padding: 8px 16px;
                border-radius: 20px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            
            .update-btn:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .dismiss-btn {
                background: none;
                color: white;
                border: none;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .dismiss-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            @media (max-width: 600px) {
                .update-content {
                    flex-direction: column;
                    gap: 10px;
                    text-align: center;
                }
            }
        `;
        document.head.appendChild(updateStyle);
        document.body.appendChild(updateNotification);
    }

    trackInstallation() {
        // Track PWA installation for analytics
        const installData = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            standalone: window.navigator.standalone,
            displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
        };
        
        // Store locally or send to analytics
        localStorage.setItem('pwaInstallData', JSON.stringify(installData));
        
        // If you have analytics, send the data
        // analytics.track('PWA_INSTALLED', installData);
    }

    // Method to check if app needs update
    async checkForUpdates() {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                registration.update();
            }
        }
    }

    // Method to enable push notifications
    async enablePushNotifications() {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            console.log('Push notifications not supported');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Push notifications enabled');
                
                // Register for push notifications
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    const subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: this.urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY') // Replace with your VAPID key
                    });
                    
                    // Send subscription to server
                    // await this.sendSubscriptionToServer(subscription);
                    return true;
                }
            }
        } catch (error) {
            console.error('Error enabling push notifications:', error);
        }
        return false;
    }

    // Helper method for VAPID key conversion
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}

// Initialize PWA installer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pwaInstaller = new PWAInstaller();
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAInstaller;
}