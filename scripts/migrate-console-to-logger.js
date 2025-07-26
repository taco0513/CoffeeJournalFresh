#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/LoggingService.ts',
  '**/LoggingService.js',
  '**/*.test.*',
  '**/*.spec.*',
];

// Mapping of console methods to Logger methods
const CONSOLE_TO_LOGGER_MAP = {
  'console.log': 'Logger.debug',
  'console.info': 'Logger.info',
  'console.warn': 'Logger.warn',
  'console.error': 'Logger.error',
  'console.debug': 'Logger.debug',
};

// Categories based on file paths
function getCategoryFromPath(filePath) {
  if (filePath.includes('/services/realm/')) return 'realm';
  if (filePath.includes('/services/auth/')) return 'auth';
  if (filePath.includes('/services/supabase/')) return 'supabase';
  if (filePath.includes('/screens/')) return 'screen';
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

// Process a single file
function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const category = getCategoryFromPath(filePath);
  const component = getComponentFromPath(filePath);
  
  // Check if Logger is already imported
  const hasLoggerImport = content.includes("import { Logger") || 
                         content.includes("import Logger") ||
                         content.includes("from './services/LoggingService'") ||
                         content.includes("from '../services/LoggingService'") ||
                         content.includes("from '../../services/LoggingService'");
  
  // Replace console statements
  Object.entries(CONSOLE_TO_LOGGER_MAP).forEach(([consoleMethod, loggerMethod]) => {
    // Match console.method with various patterns
    const patterns = [
      // console.log('message')
      new RegExp(`${consoleMethod.replace('.', '\\.')}\\s*\\(\\s*(['"\`])([^'"\`]*?)\\1\\s*\\)`, 'g'),
      // console.log('message', data)
      new RegExp(`${consoleMethod.replace('.', '\\.')}\\s*\\(\\s*(['"\`])([^'"\`]*?)\\1\\s*,([^)]+)\\)`, 'g'),
      // console.log(`template ${var}`)
      new RegExp(`${consoleMethod.replace('.', '\\.')}\\s*\\(\\s*\`([^\`]+)\`\\s*\\)`, 'g'),
      // console.log(`template ${var}`, data)
      new RegExp(`${consoleMethod.replace('.', '\\.')}\\s*\\(\\s*\`([^\`]+)\`\\s*,([^)]+)\\)`, 'g'),
    ];
    
    patterns.forEach((pattern, index) => {
      content = content.replace(pattern, (match, ...args) => {
        modified = true;
        
        if (index === 0) {
          // Simple string message
          return `${loggerMethod}('${args[1]}', '${category}', { component: '${component}' })`;
        } else if (index === 1) {
          // String message with data
          const message = args[1];
          const data = args[2].trim();
          // Try to detect if data is an error
          if (data.includes('err') || data.includes('error') || data.includes('Error')) {
            return `${loggerMethod}('${message}', '${category}', { component: '${component}', error: ${data} })`;
          } else {
            return `${loggerMethod}('${message}', '${category}', { component: '${component}', data: { value: ${data} } })`;
          }
        } else if (index === 2) {
          // Template literal
          return `${loggerMethod}(\`${args[0]}\`, '${category}', { component: '${component}' })`;
        } else if (index === 3) {
          // Template literal with data
          const message = args[0];
          const data = args[1].trim();
          if (data.includes('err') || data.includes('error') || data.includes('Error')) {
            return `${loggerMethod}(\`${message}\`, '${category}', { component: '${component}', error: ${data} })`;
          } else {
            return `${loggerMethod}(\`${message}\`, '${category}', { component: '${component}', data: { value: ${data} } })`;
          }
        }
        return match;
      });
    });
  });
  
  // Add Logger import if needed and file was modified
  if (modified && !hasLoggerImport) {
    // Calculate relative import path
    const relativePath = path.relative(path.dirname(filePath), path.join(SRC_DIR, 'services/LoggingService'));
    const importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
    
    // Add import at the top of the file after other imports
    const importStatement = `import { Logger } from '${importPath.replace(/\\/g, '/')}';\n`;
    
    // Try to add after the last import statement
    const lastImportMatch = content.match(/^import[^;]+;$/gm);
    if (lastImportMatch && lastImportMatch.length > 0) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      content = content.slice(0, lastImportIndex + lastImport.length) + '\n' + importStatement + content.slice(lastImportIndex + lastImport.length);
    } else {
      // Add at the beginning if no imports found
      content = importStatement + '\n' + content;
    }
  }
  
  // Write back if modified
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return 1;
  }
  
  return 0;
}

// Main execution
function main() {
  console.log('Starting console to Logger migration...\n');
  
  // Find all TypeScript and JavaScript files
  const pattern = path.join(SRC_DIR, '**/*.{ts,tsx,js,jsx}');
  const files = glob.sync(pattern, { ignore: EXCLUDE_PATTERNS });
  
  console.log(`Found ${files.length} files to process\n`);
  
  let updatedCount = 0;
  files.forEach(file => {
    updatedCount += processFile(file);
  });
  
  console.log(`\n✅ Migration complete! Updated ${updatedCount} files.`);
  console.log('\nNext steps:');
  console.log('1. Review the changes with: git diff');
  console.log('2. Run TypeScript compilation to check for errors: npm run tsc');
  console.log('3. Test the application to ensure logging works correctly');
  console.log('4. Commit the changes');
}

// Run the migration
main();