#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { getCategoryFromPath, getComponentFromPath } = require('./migrate-console-safe');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');

// Files to exclude
const EXCLUDE_FILES = [
  'LoggingService.ts',
  'LoggingService.js',
  'logger.ts',
  'logger.js',
];

// Analyze a single file
function analyzeFile(filePath) {
  const fileName = path.basename(filePath);
  if (EXCLUDE_FILES.includes(fileName)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const category = getCategoryFromPath(filePath);
  const component = getComponentFromPath(filePath);
  
  const consolePatterns = [
    { method: 'log', pattern: /console\.log\s*\(/g },
    { method: 'error', pattern: /console\.error\s*\(/g },
    { method: 'warn', pattern: /console\.warn\s*\(/g },
    { method: 'info', pattern: /console\.info\s*\(/g },
    { method: 'debug', pattern: /console\.debug\s*\(/g },
  ];
  
  const findings = [];
  let totalCount = 0;
  
  consolePatterns.forEach(({ method, pattern }) => {
    const matches = content.match(pattern);
    if (matches) {
      const count = matches.length;
      totalCount += count;
      findings.push({ method, count });
    }
  });
  
  if (totalCount === 0) return null;
  
  // Extract sample console statements
  const samples = [];
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('console.') && samples.length < 3) {
      samples.push({
        lineNumber: index + 1,
        line: line.trim()
      });
    }
  });
  
  return {
    filePath: path.relative(process.cwd(), filePath),
    category,
    component,
    totalCount,
    findings,
    samples
  };
}

// Find all files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '__tests__') {
        findFiles(filePath, fileList);
      }
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main dry run
function main() {
  console.log('🔍 Console to Logger Migration - DRY RUN\n');
  console.log('This is a preview of what will be changed:\n');
  
  const files = findFiles(SRC_DIR);
  const results = [];
  
  files.forEach(file => {
    const analysis = analyzeFile(file);
    if (analysis) {
      results.push(analysis);
    }
  });
  
  // Summary statistics
  const stats = {
    totalFiles: results.length,
    totalConsoleStatements: results.reduce((sum, r) => sum + r.totalCount, 0),
    byMethod: {},
    byCategory: {}
  };
  
  results.forEach(result => {
    // Count by method
    result.findings.forEach(({ method, count }) => {
      stats.byMethod[method] = (stats.byMethod[method] || 0) + count;
    });
    
    // Count by category
    stats.byCategory[result.category] = (stats.byCategory[result.category] || 0) + result.totalCount;
  });
  
  // Display results
  console.log('📊 SUMMARY:');
  console.log('='.repeat(60));
  console.log(`Files with console statements: ${stats.totalFiles}`);
  console.log(`Total console statements: ${stats.totalConsoleStatements}`);
  
  console.log('\n📈 By Method:');
  Object.entries(stats.byMethod).forEach(([method, count]) => {
    console.log(`  console.${method}: ${count}`);
  });
  
  console.log('\n📁 By Category:');
  Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`);
  });
  
  console.log('\n📝 TOP 10 FILES BY CONSOLE COUNT:');
  console.log('='.repeat(60));
  results
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, 10)
    .forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.filePath} (${result.totalCount} statements)`);
      console.log(`   Category: ${result.category}, Component: ${result.component}`);
      console.log('   Samples:');
      result.samples.forEach(sample => {
        console.log(`     Line ${sample.lineNumber}: ${sample.line.substring(0, 80)}${sample.line.length > 80 ? '...' : ''}`);
      });
    });
  
  console.log('\n' + '='.repeat(60));
  console.log('🔄 MIGRATION PREVIEW:');
  console.log('='.repeat(60));
  console.log('Each console statement will be replaced as follows:\n');
  
  console.log('console.log("message")');
  console.log('  → Logger.debug("message", "category", { component: "ComponentName" })\n');
  
  console.log('console.error("error message")');
  console.log('  → Logger.error("error message", "category", { component: "ComponentName" })\n');
  
  console.log('console.warn("warning")');
  console.log('  → Logger.warn("warning", "category", { component: "ComponentName" })\n');
  
  console.log('Logger import will be automatically added to each file.\n');
  
  console.log('🚀 To apply these changes, run:');
  console.log('   node scripts/migrate-console-safe.js\n');
}

// Run dry run
if (require.main === module) {
  main();
}

module.exports = { analyzeFile };