#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 CupNote Performance Optimization Check');
console.log('=========================================\n');

// 1. Check bundle size
console.log('📦 Bundle Size Analysis:');
console.log('------------------------');

const largePackages = [
  { name: 'realm', expectedSize: 50, actualPath: 'node_modules/realm' },
  { name: '@tamagui', expectedSize: 20, actualPath: 'node_modules/@tamagui' },
  { name: 'react-native', expectedSize: 85, actualPath: 'node_modules/react-native' },
];

largePackages.forEach(pkg => {
  if (fs.existsSync(pkg.actualPath)) {
    try {
      const size = execSync(`du -sm ${pkg.actualPath} | cut -f1`, { encoding: 'utf-8' }).trim();
      const sizeNum = parseInt(size);
      const status = sizeNum <= pkg.expectedSize ? '✅' : '⚠️';
      console.log(`${status} ${pkg.name}: ${size}MB (expected: <${pkg.expectedSize}MB)`);
    } catch (e) {
      console.log(`❌ ${pkg.name}: Could not measure`);
    }
  }
});

// 2. Check React.memo usage
console.log('\n⚛️  React Optimization:');
console.log('----------------------');

const memoizedComponents = execSync(
  'grep -r "React.memo\\|memo(" src/components src/screens-tamagui --include="*.tsx" --include="*.jsx" | wc -l',
  { encoding: 'utf-8' }
).trim();

console.log(`✅ Memoized components: ${memoizedComponents}`);

// 3. Check lazy loading
console.log('\n🦥 Lazy Loading:');
console.log('----------------');

const lazyImports = execSync(
  'grep -r "lazy(" src/ --include="*.tsx" --include="*.jsx" | wc -l',
  { encoding: 'utf-8' }
).trim();

console.log(`✅ Lazy loaded modules: ${lazyImports}`);

// 4. Check Metro config
console.log('\n🚇 Metro Configuration:');
console.log('----------------------');

const metroConfig = fs.readFileSync('metro.config.js', 'utf-8');
const hasMinifier = metroConfig.includes('minifierConfig');
const hasBlocklist = metroConfig.includes('blockList');

console.log(`${hasMinifier ? '✅' : '❌'} Minifier configured`);
console.log(`${hasBlocklist ? '✅' : '❌'} Test files excluded`);

// 5. Check iOS optimizations
console.log('\n🍎 iOS Build Optimizations:');
console.log('---------------------------');

const podfile = fs.readFileSync('ios/Podfile', 'utf-8');
const hasOptimizations = podfile.includes('SWIFT_OPTIMIZATION_LEVEL');
const hasDeadCodeStripping = podfile.includes('DEAD_CODE_STRIPPING');

console.log(`${hasOptimizations ? '✅' : '❌'} Swift optimization enabled`);
console.log(`${hasDeadCodeStripping ? '✅' : '❌'} Dead code stripping enabled`);

// Summary
console.log('\n📊 Optimization Summary:');
console.log('------------------------');

const totalChecks = 7;
const passedChecks = [
  hasMinifier,
  hasBlocklist,
  hasOptimizations,
  hasDeadCodeStripping,
  parseInt(memoizedComponents) > 0,
  parseInt(lazyImports) > 0,
  true // Bundle size check is informational
].filter(Boolean).length;

const percentage = Math.round((passedChecks / totalChecks) * 100);
console.log(`Overall optimization score: ${percentage}%`);

if (percentage >= 80) {
  console.log('🎉 Excellent! Your app is well optimized.');
} else if (percentage >= 60) {
  console.log('👍 Good progress, but there\'s room for improvement.');
} else {
  console.log('⚠️  Consider implementing more optimizations.');
}