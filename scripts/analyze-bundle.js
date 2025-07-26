#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Bundle Analysis for CupNote');
console.log('================================\n');

// Create output directory
const outputDir = path.join(__dirname, '../bundle-analysis');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate sourcemap
console.log('📦 Generating bundle sourcemap...');
try {
  execSync('npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ./bundle-analysis/ios.bundle --sourcemap-output ./bundle-analysis/ios.bundle.map', {
    stdio: 'inherit'
  });
  
  // Run bundle visualizer
  console.log('\n📊 Analyzing bundle...');
  execSync('npx react-native-bundle-visualizer ./bundle-analysis/ios.bundle.map', {
    stdio: 'inherit'
  });
  
  console.log('\n✅ Bundle analysis complete! Check the generated report.');
} catch (error) {
  console.error('❌ Error during bundle analysis:', error.message);
}