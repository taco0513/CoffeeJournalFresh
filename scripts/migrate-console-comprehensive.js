#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Files to exclude from migration
const EXCLUDE_FILES = [
  'LoggingService.ts',
  'LoggingService.js',
  'logger.ts',
  'logger.js',
  'polyfills.js', // Skip polyfills
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

// Check if line is commented out
function isCommented(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
}

// Process a single file
function processFile(filePath) {
  // Skip excluded files
  const fileName = path.basename(filePath);
  if (EXCLUDE_FILES.includes(fileName)) {
    return { modified: false, skipped: true };
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  const category = getCategoryFromPath(filePath);
  const component = getComponentFromPath(filePath);
  
  // Check if Logger is already imported
  const hasLoggerImport = /import\s+{[^}]*Logger[^}]*}\s+from\s+['"].*LoggingService['"]/.test(content) ||
                         /import\s+Logger\s+from\s+['"].*LoggingService['"]/.test(content);
  
  let replacementCount = 0;
  const replacements = [];
  
  // Split content into lines for line-by-line processing
  const lines = content.split('\n');
  const newLines = [];
  
  lines.forEach((line, index) => {
    let modifiedLine = line;
    
    // Skip commented lines
    if (isCommented(line)) {
      newLines.push(line);
      return;
    }
    
    // Define replacement patterns with more specific matching
    const patterns = [
      {
        method: 'log',
        regex: /console\.log\s*\(/g,
        logMethod: 'debug'
      },
      {
        method: 'error',
        regex: /console\.error\s*\(/g,
        logMethod: 'error'
      },
      {
        method: 'warn',
        regex: /console\.warn\s*\(/g,
        logMethod: 'warn'
      },
      {
        method: 'info',
        regex: /console\.info\s*\(/g,
        logMethod: 'info'
      },
      {
        method: 'debug',
        regex: /console\.debug\s*\(/g,
        logMethod: 'debug'
      }
    ];
    
    patterns.forEach(({ method, regex, logMethod }) => {
      if (regex.test(modifiedLine)) {
        replacementCount++;
        
        // For simple console.method('string') patterns
        modifiedLine = modifiedLine.replace(
          new RegExp(`console\\.${method}\\s*\\(\\s*(['"\`])([^'"\`]*?)\\1\\s*\\)`, 'g'),
          `Logger.${logMethod}('$2', '${category}', { component: '${component}' })`
        );
        
        // For console.method('string', variable) patterns
        modifiedLine = modifiedLine.replace(
          new RegExp(`console\\.${method}\\s*\\(\\s*(['"\`])([^'"\`]*?)\\1\\s*,\\s*([^)]+)\\)`, 'g'),
          (match, quote, message, args) => {
            const argsClean = args.trim();
            // Check if it looks like an error object
            if (logMethod === 'error' || (argsClean.includes('error') || argsClean.includes('err'))) {
              return `Logger.${logMethod}('${message}', '${category}', { component: '${component}', error: ${argsClean} })`;
            } else {
              return `Logger.${logMethod}('${message}', '${category}', { component: '${component}', data: ${argsClean} })`;
            }
          }
        );
        
        // For template literals: console.method(`template ${var}`)
        modifiedLine = modifiedLine.replace(
          new RegExp(`console\\.${method}\\s*\\(\\s*\`([^\`]+)\`\\s*\\)`, 'g'),
          `Logger.${logMethod}(\`$1\`, '${category}', { component: '${component}' })`
        );
        
        // For template literals with additional args
        modifiedLine = modifiedLine.replace(
          new RegExp(`console\\.${method}\\s*\\(\\s*\`([^\`]+)\`\\s*,\\s*([^)]+)\\)`, 'g'),
          (match, template, args) => {
            const argsClean = args.trim();
            if (logMethod === 'error' || (argsClean.includes('error') || argsClean.includes('err'))) {
              return `Logger.${logMethod}(\`${template}\`, '${category}', { component: '${component}', error: ${argsClean} })`;
            } else {
              return `Logger.${logMethod}(\`${template}\`, '${category}', { component: '${component}', data: ${argsClean} })`;
            }
          }
        );
        
        // For generic console.method calls without specific patterns
        modifiedLine = modifiedLine.replace(
          new RegExp(`console\\.${method}`, 'g'),
          `Logger.${logMethod}`
        );
        
        if (VERBOSE && modifiedLine !== line) {
          replacements.push({
            lineNumber: index + 1,
            before: line.trim(),
            after: modifiedLine.trim()
          });
        }
      }
    });
    
    newLines.push(modifiedLine);
  });
  
  content = newLines.join('\n');
  
  // Add Logger import if needed
  if (replacementCount > 0 && !hasLoggerImport) {
    const importPath = getLoggerImportPath(filePath);
    const importStatement = `import { Logger } from '${importPath}';`;
    
    // Find where to insert the import
    const importMatches = content.match(/^import\s+.*?;?\s*$/gm);
    if (importMatches && importMatches.length > 0) {
      // Find the last import
      let lastImportIndex = -1;
      importMatches.forEach(imp => {
        const index = content.lastIndexOf(imp);
        if (index > lastImportIndex) {
          lastImportIndex = index + imp.length;
        }
      });
      
      if (lastImportIndex > -1) {
        content = content.slice(0, lastImportIndex) + '\n' + importStatement + content.slice(lastImportIndex);
      }
    } else {
      // No imports found, add at the beginning
      content = importStatement + '\n\n' + content;
    }
  }
  
  const modified = content !== originalContent;
  
  if (modified && !DRY_RUN) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return {
    modified,
    replacementCount,
    filePath: path.relative(process.cwd(), filePath),
    replacements
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
  console.log(`🚀 Console to Logger Migration ${DRY_RUN ? '(DRY RUN)' : ''}\n`);
  
  const files = findFiles(SRC_DIR);
  console.log(`📁 Found ${files.length} files to process\n`);
  
  const results = {
    total: files.length,
    modified: 0,
    skipped: 0,
    totalReplacements: 0,
    modifiedFiles: []
  };
  
  files.forEach(file => {
    const result = processFile(file);
    
    if (result.skipped) {
      results.skipped++;
    } else if (result.modified) {
      results.modified++;
      results.totalReplacements += result.replacementCount;
      results.modifiedFiles.push({
        path: result.filePath,
        count: result.replacementCount,
        replacements: result.replacements
      });
      
      console.log(`${DRY_RUN ? '🔍' : '✅'} ${result.filePath} (${result.replacementCount} replacements)`);
      
      if (VERBOSE && result.replacements.length > 0) {
        result.replacements.slice(0, 3).forEach(r => {
          console.log(`   Line ${r.lineNumber}:`);
          console.log(`     - ${r.before}`);
          console.log(`     + ${r.after}`);
        });
        if (result.replacements.length > 3) {
          console.log(`   ... and ${result.replacements.length - 3} more`);
        }
      }
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary:');
  console.log('='.repeat(60));
  console.log(`Total files scanned: ${results.total}`);
  console.log(`Files skipped: ${results.skipped}`);
  console.log(`Files ${DRY_RUN ? 'to be modified' : 'modified'}: ${results.modified}`);
  console.log(`Total replacements: ${results.totalReplacements}`);
  
  if (results.modified > 0) {
    // Show top files by replacement count
    console.log('\n📈 Top 5 files by replacement count:');
    results.modifiedFiles
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.path} (${file.count} replacements)`);
      });
    
    if (DRY_RUN) {
      console.log('\n✅ This was a DRY RUN. No files were modified.');
      console.log('\nTo apply these changes, run:');
      console.log('  node scripts/migrate-console-comprehensive.js');
    } else {
      console.log('\n✅ Migration complete!');
      console.log('\nNext steps:');
      console.log('1. Review the changes: git diff');
      console.log('2. Run TypeScript check: npm run type-check');
      console.log('3. Test the application');
      console.log('4. Commit the changes: git commit -m "refactor: migrate console to Logger"');
    }
  } else {
    console.log('\n✨ No console statements found to migrate!');
  }
}

// Help text
if (process.argv.includes('--help')) {
  console.log('Console to Logger Migration Script');
  console.log('\nUsage:');
  console.log('  node scripts/migrate-console-comprehensive.js [options]');
  console.log('\nOptions:');
  console.log('  --dry-run    Preview changes without modifying files');
  console.log('  --verbose    Show detailed replacement information');
  console.log('  --help       Show this help message');
  process.exit(0);
}

// Run the migration
if (require.main === module) {
  main();
}

module.exports = { processFile, getCategoryFromPath, getComponentFromPath };