#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');

// Files to exclude from migration
const EXCLUDE_FILES = [
  'LoggingService.ts',
  'LoggingService.js',
  'logger.ts',
  'logger.js',
];

// Get category from file path
function getCategoryFromPath(filePath) {
  if (filePath.includes('/services/realm/')) return 'realm';
  if (filePath.includes('/services/auth/')) return 'auth';
  if (filePath.includes('/services/supabase/')) return 'supabase';
  if (filePath.includes('/screens/') || filePath.includes('/screens-tamagui/')) return 'screen';
  if (filePath.includes('/components/')) return 'component';
  if (filePath.includes('/hooks/')) return 'hook';
  if (filePath.includes('/stores/')) return 'store';
  if (filePath.includes('/utils/')) return 'util';
  if (filePath.includes('/services/')) return 'service';
  return 'general';
}

// Get component name from file path
function getComponentFromPath(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  return fileName;
}

// Calculate relative import path for LoggingService
function getLoggerImportPath(filePath) {
  const fileDir = path.dirname(filePath);
  const loggerPath = path.join(SRC_DIR, 'services/LoggingService');
  let relativePath = path.relative(fileDir, loggerPath).replace(/\\/g, '/');
  
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  
  return relativePath;
}

// Process a single file
function processFile(filePath) {
  // Skip excluded files
  const fileName = path.basename(filePath);
  if (EXCLUDE_FILES.includes(fileName)) {
    return { modified: false };
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  const category = getCategoryFromPath(filePath);
  const component = getComponentFromPath(filePath);
  
  // Check if Logger is already imported
  const hasLoggerImport = /import\s+{[^}]*Logger[^}]*}\s+from\s+['"].*LoggingService['"]/.test(content) ||
                         /import\s+Logger\s+from\s+['"].*LoggingService['"]/.test(content);
  
  let replacementCount = 0;
  
  // Define replacement patterns
  const replacements = [
    {
      // console.log('simple message')
      pattern: /console\.log\s*\(\s*(['"`])([^'"`]*)\1\s*\)/g,
      replacement: `Logger.debug('$2', '${category}', { component: '${component}' })`
    },
    {
      // console.error('error message')
      pattern: /console\.error\s*\(\s*(['"`])([^'"`]*)\1\s*\)/g,
      replacement: `Logger.error('$2', '${category}', { component: '${component}' })`
    },
    {
      // console.warn('warning message')
      pattern: /console\.warn\s*\(\s*(['"`])([^'"`]*)\1\s*\)/g,
      replacement: `Logger.warn('$2', '${category}', { component: '${component}' })`
    },
    {
      // console.info('info message')
      pattern: /console\.info\s*\(\s*(['"`])([^'"`]*)\1\s*\)/g,
      replacement: `Logger.info('$2', '${category}', { component: '${component}' })`
    },
    {
      // console.debug('debug message')
      pattern: /console\.debug\s*\(\s*(['"`])([^'"`]*)\1\s*\)/g,
      replacement: `Logger.debug('$2', '${category}', { component: '${component}' })`
    }
  ];
  
  // Apply replacements
  replacements.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, (match) => {
      replacementCount++;
      return replacement;
    });
  });
  
  // Add Logger import if needed
  if (replacementCount > 0 && !hasLoggerImport) {
    const importPath = getLoggerImportPath(filePath);
    const importStatement = `import { Logger } from '${importPath}';\n`;
    
    // Find where to insert the import
    const importMatch = content.match(/^import\s+.*?;?\s*$/gm);
    if (importMatch && importMatch.length > 0) {
      // Add after last import
      const lastImport = importMatch[importMatch.length - 1];
      const insertPosition = content.lastIndexOf(lastImport) + lastImport.length;
      content = content.slice(0, insertPosition) + '\n' + importStatement + content.slice(insertPosition);
    } else {
      // Add at the beginning of file
      content = importStatement + '\n' + content;
    }
  }
  
  const modified = content !== originalContent;
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return {
    modified,
    replacementCount,
    filePath: path.relative(process.cwd(), filePath)
  };
}

// Find all TypeScript/JavaScript files recursively
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other directories
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '__tests__') {
        findFiles(filePath, fileList);
      }
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main execution
function main() {
  console.log('🚀 Starting safe console to Logger migration...\n');
  
  const files = findFiles(SRC_DIR);
  console.log(`📁 Found ${files.length} files to process\n`);
  
  const results = {
    total: files.length,
    modified: 0,
    totalReplacements: 0,
    modifiedFiles: []
  };
  
  files.forEach(file => {
    const result = processFile(file);
    if (result.modified) {
      results.modified++;
      results.totalReplacements += result.replacementCount;
      results.modifiedFiles.push(result.filePath);
      console.log(`✅ Updated: ${result.filePath} (${result.replacementCount} replacements)`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary:');
  console.log('='.repeat(60));
  console.log(`Total files scanned: ${results.total}`);
  console.log(`Files modified: ${results.modified}`);
  console.log(`Total replacements: ${results.totalReplacements}`);
  
  if (results.modified > 0) {
    console.log('\n📝 Modified files:');
    results.modifiedFiles.forEach(file => {
      console.log(`  - ${file}`);
    });
    
    console.log('\n✅ Next steps:');
    console.log('1. Review the changes: git diff');
    console.log('2. Run TypeScript check: npm run type-check');
    console.log('3. Test the application');
    console.log('4. Commit the changes: git commit -m "refactor: migrate console to Logger"');
  } else {
    console.log('\n✨ No console statements found to migrate!');
  }
}

// Run the migration
if (require.main === module) {
  main();
}

module.exports = { processFile, getCategoryFromPath, getComponentFromPath };