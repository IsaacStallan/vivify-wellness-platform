// Node.js script to automatically add PWA code to all HTML files
// Run with: node update-pwa.js

const fs = require('fs');
const path = require('path');

// PWA code to inject into <head>
const HEAD_CODE = `
<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json">

<!-- iOS PWA Support -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="performance Hub">
<link rel="apple-touch-icon" href="/icons/icon-192x192.png">
<link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png">

<!-- Microsoft Tiles -->
<meta name="msapplication-TileImage" content="/icons/icon-144x144.png">
<meta name="msapplication-TileColor" content="#f39c12">

<!-- Theme Color -->
<meta name="theme-color" content="#f39c12">

<!-- Viewport for PWA -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">

<!-- Preload PWA installer script -->
<link rel="preload" href="/pwa-install.js" as="script">`;

// PWA code to inject before </body>
const BODY_CODE = `
<!-- PWA Scripts -->


<script>
// Additional PWA features for each page
document.addEventListener('DOMContentLoaded', function() {
    // Add PWA-specific styles
    if (window.matchMedia('(display-mode: standalone)').matches) {
        document.body.classList.add('pwa-mode');
        
        // Hide address bar on mobile when in PWA mode
        window.scrollTo(0, 1);
    }
    
    // Handle network status
    function updateOnlineStatus() {
        const statusElement = document.getElementById('network-status');
        if (statusElement) {
            if (navigator.onLine) {
                statusElement.textContent = 'Online';
                statusElement.className = 'online';
            } else {
                statusElement.textContent = 'Offline';
                statusElement.className = 'offline';
            }
        }
    }
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
    
    // Add network status indicator if it doesn't exist
    if (!document.getElementById('network-status')) {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'network-status';
        statusDiv.style.cssText = \`
            position: fixed;
            top: 10px;
            left: 10px;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
            z-index: 1000;
            transition: all 0.3s ease;
        \`;
        document.body.appendChild(statusDiv);
        updateOnlineStatus();
    }
});
</script>`;

// CSS to add to styles.css
const PWA_CSS = `
/* PWA-specific styles */
.pwa-mode {
    margin: 0;
    padding: 0;
}

/* PWA display mode styles */
@media (display-mode: standalone) {
    body {
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
        padding-left: env(safe-area-inset-left);
        padding-right: env(safe-area-inset-right);
    }
    
    .browser-only {
        display: none;
    }
}

/* Network status indicator styles */
#network-status.online {
    background-color: #2ecc71;
    color: white;
    opacity: 0.8;
}

#network-status.offline {
    background-color: #e74c3c;
    color: white;
    opacity: 1;
    animation: pulse 1s infinite;
}

/* Hide install button when PWA is already installed */
.pwa-installed .pwa-install-button {
    display: none !important;
}

/* Loading states for offline functionality */
.loading {
    opacity: 0.7;
    pointer-events: none;
}

.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;
    border: 2px solid #f39c12;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Responsive PWA styles */
@media (max-width: 768px) {
    .pwa-mode {
        font-size: 16px;
    }
}

/* Dark mode support for PWA */
@media (prefers-color-scheme: dark) {
    .pwa-mode {
        background-color: #000;
        color: #fff;
    }
}
`;

class PWAUpdater {
    constructor() {
        this.projectDir = process.cwd();
        this.htmlFiles = [];
        this.backupDir = path.join(this.projectDir, 'backup-' + Date.now());
    }

    // Find all HTML files in the project
    findHtmlFiles(dir = this.projectDir) {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                this.findHtmlFiles(filePath);
            } else if (file.endsWith('.html')) {
                this.htmlFiles.push(filePath);
            }
        }
    }

    // Create backup of all files
    createBackup() {
        console.log('📦 Creating backup...');
        fs.mkdirSync(this.backupDir, { recursive: true });
        
        for (const htmlFile of this.htmlFiles) {
            const relativePath = path.relative(this.projectDir, htmlFile);
            const backupPath = path.join(this.backupDir, relativePath);
            const backupDirPath = path.dirname(backupPath);
            
            fs.mkdirSync(backupDirPath, { recursive: true });
            fs.copyFileSync(htmlFile, backupPath);
        }
        
        console.log(`✅ Backup created at: ${this.backupDir}`);
    }

    // Update a single HTML file
    updateHtmlFile(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = false;
            
            // Check if PWA code already exists
            if (content.includes('PWA Manifest') || content.includes('manifest.json')) {
                console.log(`⚠️  PWA code already exists in ${path.basename(filePath)}, skipping...`);
                return false;
            }
            
            // Add to <head> section
            if (content.includes('<!-- CSS Loading Order Fix -->

<link rel="stylesheet" href="styles.css">

<!-- FOUC Prevention -->
<style>
    html { visibility: hidden; opacity: 0; }
    html.loaded { visibility: visible; opacity: 1; transition: opacity 0.3s ease; }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        document.documentElement.classList.add('loaded');
    });
    window.addEventListener('load', function() {
        document.documentElement.classList.add('loaded');
    });
</script>
</head>')) {
                content = content.replace('<!-- CSS Loading Order Fix -->

<link rel="stylesheet" href="styles.css">

<!-- FOUC Prevention -->
<style>
    html { visibility: hidden; opacity: 0; }
    html.loaded { visibility: visible; opacity: 1; transition: opacity 0.3s ease; }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        document.documentElement.classList.add('loaded');
    });
    window.addEventListener('load', function() {
        document.documentElement.classList.add('loaded');
    });
</script>
</head>', `${HEAD_CODE}\n<!-- CSS Loading Order Fix -->

<link rel="stylesheet" href="styles.css">

<!-- FOUC Prevention -->
<style>
    html { visibility: hidden; opacity: 0; }
    html.loaded { visibility: visible; opacity: 1; transition: opacity 0.3s ease; }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        document.documentElement.classList.add('loaded');
    });
    window.addEventListener('load', function() {
        document.documentElement.classList.add('loaded');
    });
</script>
</head>`);
                updated = true;
            }
            
            // Add before </body> section
            if (content.includes('</body>')) {
                content = content.replace('</body>', `${BODY_CODE}\n</body>`);
                updated = true;
            }
            
            if (updated) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ Updated: ${path.basename(filePath)}`);
                return true;
            } else {
                console.log(`❌ Could not update: ${path.basename(filePath)} (missing <head> or <body> tags)`);
                return false;
            }
            
        } catch (error) {
            console.error(`❌ Error updating ${filePath}:`, error.message);
            return false;
        }
    }

    // Update CSS file
    updateCssFile() {
        const cssPath = path.join(this.projectDir, 'styles.css');
        
        if (fs.existsSync(cssPath)) {
            try {
                let cssContent = fs.readFileSync(cssPath, 'utf8');
                
                // Check if PWA CSS already exists
                if (cssContent.includes('PWA-specific styles')) {
                    console.log('⚠️  PWA CSS already exists in styles.css, skipping...');
                    return false;
                }
                
                // Add PWA CSS at the end
                cssContent += '\n\n' + PWA_CSS;
                fs.writeFileSync(cssPath, cssContent, 'utf8');
                console.log('✅ Updated: styles.css');
                return true;
                
            } catch (error) {
                console.error('❌ Error updating styles.css:', error.message);
                return false;
            }
        } else {
            console.log('⚠️  styles.css not found, creating it...');
            fs.writeFileSync(cssPath, PWA_CSS, 'utf8');
            console.log('✅ Created: styles.css');
            return true;
        }
    }

    // Create PWA files
    createPwaFiles() {
        const files = {
            'manifest.json': `{
  "name": "Student performance Hub",
  "short_name": "performanceHub",
  "description": "Focus & Resilience, nutrition, fitness and life skills for Australian students (Years 7-12)",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#f39c12",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "en-AU",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}`,
            'sw.js': '// Service Worker - Use the complete version from the artifacts above',
            'pwa-install.js': '// PWA Installer - Use the complete version from the artifacts above',
            'offline.html': '<!-- Use the complete offline.html from the artifacts above -->'
        };

        for (const [filename, content] of Object.entries(files)) {
            const filePath = path.join(this.projectDir, filename);
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ Created: ${filename}`);
            } else {
                console.log(`⚠️  ${filename} already exists, skipping...`);
            }
        }

        // Create icons directory
        const iconsDir = path.join(this.projectDir, 'icons');
        if (!fs.existsSync(iconsDir)) {
            fs.mkdirSync(iconsDir);
            console.log('✅ Created: icons/ directory');
            console.log('📝 Don\'t forget to add your icon files to the icons/ folder!');
        }
    }

    // Main update function
    async run() {
        console.log('🚀 Starting PWA Auto-Updater...\n');
        
        // Find all HTML files
        this.findHtmlFiles();
        console.log(`📁 Found ${this.htmlFiles.length} HTML files:`);
        this.htmlFiles.forEach(file => console.log(`   - ${path.basename(file)}`));
        console.log('');

        // Create backup
        this.createBackup();
        console.log('');

        // Update HTML files
        console.log('📝 Updating HTML files...');
        let updatedCount = 0;
        for (const htmlFile of this.htmlFiles) {
            if (this.updateHtmlFile(htmlFile)) {
                updatedCount++;
            }
        }
        console.log('');

        // Update CSS
        console.log('🎨 Updating CSS file...');
        this.updateCssFile();
        console.log('');

        // Create PWA files
        console.log('📱 Creating PWA files...');
        this.createPwaFiles();
        console.log('');

        // Summary
        console.log('🎉 PWA Auto-Update Complete!');
        console.log(`✅ Updated ${updatedCount} HTML files`);
        console.log(`📦 Backup created at: ${this.backupDir}`);
        console.log('');
        console.log('📋 Next Steps:');
        console.log('1. Add your icon files to the icons/ folder');
        console.log('2. Copy the complete sw.js, pwa-install.js, and offline.html from the artifacts');
        console.log('3. Test your PWA by deploying to Netlify');
        console.log('4. Check for any issues and restore from backup if needed');
    }
}

// Run the updater
if (require.main === module) {
    const updater = new PWAUpdater();
    updater.run().catch(console.error);
}

module.exports = PWAUpdater;