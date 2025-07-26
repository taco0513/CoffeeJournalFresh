const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern to detect triple import statements
const tripleImportPattern = /import\s+import\s+import\s+{/g;
const doubleImportPattern = /import\s+import\s+{/g;

// Also fix broken Logger import paths
const wrongLoggerPathPattern = /import\s+{\s*Logger\s*}\s+from\s+['"]\.\.[/\\]+services[/\\]LoggingService['"]/g;

let totalFixed = 0;

function getCorrectLoggerPath(filePath) {
  // Calculate the relative path from the file to the LoggingService
  const fileDir = path.dirname(filePath);
  const loggerPath = path.join(process.cwd(), 'src/services/LoggingService');
  const relativePath = path.relative(fileDir, loggerPath).replace(/\\/g, '/');
  return relativePath;
}

function fixTripleImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let fixed = content;
  let hasChanges = false;

  // Fix triple import statements
  if (tripleImportPattern.test(fixed)) {
    fixed = fixed.replace(tripleImportPattern, 'import {');
    hasChanges = true;
  }

  // Fix double import statements
  if (doubleImportPattern.test(fixed)) {
    fixed = fixed.replace(doubleImportPattern, 'import {');
    hasChanges = true;
  }

  // Fix incorrect Logger import paths
  const correctPath = getCorrectLoggerPath(filePath);
  const currentLoggerImports = fixed.match(/import\s+{\s*Logger\s*}\s+from\s+['"]([^'"]+)['"]/g);
  
  if (currentLoggerImports) {
    currentLoggerImports.forEach(importStatement => {
      const pathMatch = importStatement.match(/from\s+['"]([^'"]+)['"]/);
      if (pathMatch && pathMatch[1].includes('../services/LoggingService') && !pathMatch[1].endsWith('/LoggingService')) {
        const newImport = `import { Logger } from '${correctPath}'`;
        fixed = fixed.replace(importStatement, newImport);
        hasChanges = true;
      }
    });
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, fixed);
    console.log(`✅ Fixed imports in: ${path.relative(process.cwd(), filePath)}`);
    totalFixed++;
  }

  return hasChanges;
}

// Find all TypeScript/React files
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/build/**', '**/dist/**']
});

console.log(`\n🔍 Checking ${files.length} files for triple import errors...\n`);

files.forEach(file => {
  fixTripleImports(file);
});

console.log(`\n✨ Fixed triple import errors in ${totalFixed} files!\n`);