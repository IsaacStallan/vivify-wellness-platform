#!/bin/bash

echo "🔥 AGGRESSIVE CLEANUP - This will delete most of your files!"
echo "Current directory: $(pwd)"
echo "You have $(ls -1 *.html | wc -l) HTML files currently"
echo ""
echo "This will keep ONLY these 9 files:"
echo "- index.html"
echo "- Dashboard.html" 
echo "- habits-tracker.html"
echo "- challenges.html"
echo "- community.html"
echo "- profile.html"
echo "- login.html"
echo "- signup.html"
echo "- card-collection.html"
echo ""
echo "Type 'DELETE_EVERYTHING' to proceed:"
read confirmation

if [ "$confirmation" != "DELETE_EVERYTHING" ]; then
    echo "Aborted. No files were deleted."
    exit 1
fi

# Create final backup
echo "Creating final backup..."
backup_dir="../frontend_final_backup_$(date +%Y%m%d_%H%M%S)"
cp -r . "$backup_dir"
echo "Backup created at: $backup_dir"

# Files to keep - ONLY these 9 core files
keep_files=(
    "index.html"
    "Dashboard.html" 
    "habits-tracker.html"
    "challenges.html"
    "community.html"
    "profile.html"
    "login.html"
    "signup.html"
    "card-collection.html"
    "package.json"
    "package-lock.json"
    "netlify.toml"
    ".env"
    ".gitignore"
    "README.md"
    "styles.css"
    "script.js"
    "app.js"
    "auth-utils.js"
)

echo "Deleting ALL HTML files except the 9 core ones..."

# Delete all HTML files except the ones we want to keep
for file in *.html; do
    if [[ ! " ${keep_files[@]} " =~ " ${file} " ]]; then
        echo "Deleting: $file"
        rm "$file"
    fi
done

# Create missing flexible-mobile-nav.js file (simple version)
echo "Creating missing js/flexible-mobile-nav.js..."
mkdir -p js
cat > js/flexible-mobile-nav.js << 'EOF'
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
EOF

# Create missing class-management.js file (empty placeholder)
echo "Creating missing class-management.js..."
cat > class-management.js << 'EOF'
// Class management placeholder
console.log('Class management loaded (placeholder)');

// Empty functions to prevent errors
function initializeClassManagement() {
    // Placeholder function
}

// Basic user management
const ClassManagement = {
    init: function() {
        console.log('Class management initialized');
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', function() {
    ClassManagement.init();
});
EOF

echo ""
echo "Cleanup complete!"
echo "Remaining HTML files:"
ls -la *.html
echo ""
echo "Remaining files: $(ls -1 *.html | wc -l) HTML files"

echo ""
echo "Next steps:"
echo "1. Test each of your 9 core pages"
echo "2. Remove any remaining broken links in the navigation"
echo "3. Focus on getting basic functionality working"
echo "4. Don't worry about complex features yet"

echo ""
echo "If you want to fix the remaining missing JS references, run:"
echo "sed -i.bak 's|js/flexible-mobile-nav.js|js/mobile-nav.js|g' *.html"