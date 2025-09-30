#!/bin/bash

# Accessibility testing script for CI
# This script runs basic accessibility checks that can be automated

set -e

echo "🔍 Running accessibility audit for portfolio app..."

# Check if required commands are available
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }

# Create a simple Node.js script to check color contrast and basic accessibility rules
cat > /tmp/a11y-check.js << 'EOF'
const colors = {
  // Text colors from globals.css
  textPrimary: '#000',      // black text
  textLight: 'rgba(0, 0, 0, 0.25)', // footer text
  
  // Background colors
  bgPrimary: '#fff',        // white background
  bgAccent: '#49fcd4',      // accent cyan background
  
  // Interactive colors
  linkBorder: '#43d9b8',    // link borders and accents
  focusOutline: '#49fcd4'   // focus outline color
};

// Simple contrast ratio calculator
function hexToRgb(hex) {
  // Handle both 3-character and 6-character hex codes
  hex = hex.replace('#', '');
  
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function luminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(color1, color2) {
  const l1 = luminance(color1);
  const l2 = luminance(color2);
  
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

// Test the calculation
console.log('🧪 Testing contrast calculation...');
console.log('Black on white should be ~21:1, actual:', contrastRatio('#000000', '#ffffff').toFixed(2));
console.log('');

// WCAG AA requires 4.5:1 for normal text, 3:1 for large text
const WCAG_AA_NORMAL = 4.5;
const WCAG_AA_LARGE = 3.0;

console.log('🎨 Checking color contrast ratios...\n');

let violations = 0;

// Check main text contrast
const mainTextContrast = contrastRatio('#000', '#fff');
console.log(`📝 Main text (#000 on #fff): ${mainTextContrast.toFixed(2)}:1`);
if (mainTextContrast >= WCAG_AA_NORMAL) {
  console.log('   ✅ PASS - Meets WCAG AA standard');
} else {
  console.log('   ❌ FAIL - Does not meet WCAG AA standard');
  violations++;
}

// Check footer text contrast (using equivalent gray value for rgba(0,0,0,0.6))
// rgba(0,0,0,0.6) on white is equivalent to #666666
const footerTextContrast = contrastRatio('#666666', '#fff');
console.log(`📝 Footer text (rgba(0,0,0,0.6) ≈ #666 on #fff): ${footerTextContrast.toFixed(2)}:1`);
if (footerTextContrast >= WCAG_AA_NORMAL) {
  console.log('   ✅ PASS - Meets WCAG AA standard');
} else {
  console.log('   ❌ FAIL - Does not meet WCAG AA standard (recommend darker color)');
  violations++;
}

// Check text on accent background
const accentTextContrast = contrastRatio('#000', '#49fcd4');
console.log(`📝 Text on accent background (#000 on #49fcd4): ${accentTextContrast.toFixed(2)}:1`);
if (accentTextContrast >= WCAG_AA_NORMAL) {
  console.log('   ✅ PASS - Meets WCAG AA standard');
} else {
  console.log('   ❌ FAIL - Does not meet WCAG AA standard');
  violations++;
}

console.log('\n🔧 Checking semantic structure...');

// Check for common accessibility issues in the codebase
const fs = require('fs');
const path = require('path');

// Read the main page component
const homePage = fs.readFileSync('app/page.tsx', 'utf8');
const layoutFile = fs.readFileSync('app/layout.tsx', 'utf8');

// Check for skip link
if (layoutFile.includes('skip-link')) {
  console.log('✅ Skip navigation link present');
} else {
  console.log('❌ Skip navigation link missing');
  violations++;
}

// Check for proper heading hierarchy
if (homePage.includes('Title = intro ? \'h1\' : \'h2\'') || homePage.includes('SectionTitle')) {
  console.log('✅ Proper heading hierarchy (SectionTitle components with h1/h2 logic present)');
} else {
  console.log('❌ Improper heading hierarchy');
  violations++;
}

// Check for main landmark
if (homePage.includes('id="content"') && homePage.includes('<main')) {
  console.log('✅ Main landmark with proper id present');
} else {
  console.log('❌ Main landmark missing or improperly configured');
  violations++;
}

// Check for aria-labels on interactive elements
const contactFile = fs.readFileSync('app/_components/contact.tsx', 'utf8');
if (contactFile.includes('aria-label=')) {
  console.log('✅ ARIA labels present on interactive elements');
} else {
  console.log('❌ ARIA labels missing');
  violations++;
}

console.log(`\n📊 Summary: ${violations} accessibility violations found`);

if (violations > 0) {
  console.log('❌ Accessibility audit failed');
  process.exit(1);
} else {
  console.log('✅ Accessibility audit passed');
  process.exit(0);
}
EOF

# Run the accessibility check
cd apps/portfolio
node /tmp/a11y-check.js

echo "✅ Accessibility audit completed successfully!"