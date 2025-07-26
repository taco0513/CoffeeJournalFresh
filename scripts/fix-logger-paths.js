const fs = require('fs');
const path = require('path');
const glob = require('glob');

let totalFixed = 0;

function getCorrectLoggerPath(filePath) {
  // Calculate the relative path from the file to the LoggingService
  const fileDir = path.dirname(filePath);
  const loggerPath = path.join(process.cwd(), 'src/services/LoggingService');
  const relativePath = path.relative(fileDir, loggerPath).replace(/\\/g, '/');
  return relativePath;
}

function fixLoggerPath(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let fixed = content;
  let hasChanges = false;

  // Fix incorrect Logger import paths
  const correctPath = getCorrectLoggerPath(filePath);
  const loggerImportPattern = /import\s+{\s*Logger\s*}\s+from\s+['"]([^'"]+LoggingService)['"]/g;
  
  fixed = fixed.replace(loggerImportPattern, (match, currentPath) => {
    // Only fix if the path is incorrect
    if (currentPath !== correctPath && currentPath.includes('LoggingService')) {
      hasChanges = true;
      return `import { Logger } from '${correctPath}'`;
    }
    return match;
  });

  if (hasChanges) {
    fs.writeFileSync(filePath, fixed);
    console.log(`✅ Fixed Logger import path in: ${path.relative(process.cwd(), filePath)}`);
    totalFixed++;
  }

  return hasChanges;
}

// Find all TypeScript/React files
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/build/**', '**/dist/**']
});

console.log(`\n🔍 Checking ${files.length} files for incorrect Logger import paths...\n`);

files.forEach(file => {
  fixLoggerPath(file);
});

console.log(`\n✨ Fixed Logger import paths in ${totalFixed} files!\n`);