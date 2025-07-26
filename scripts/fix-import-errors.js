const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern to detect broken import statements after Logger import
const brokenImportPattern = /import\s+{\s*Logger\s*}\s+from\s+['"].*?LoggingService['"];\s*([A-Za-z{}\s,]+)\s+from\s+['"](.+?)['"];/g;

// Pattern to detect other broken imports (e.g., AsyncStorage, useInfinity)
const otherBrokenPattern = /import\s+{\s*Logger\s*}\s+from\s+['"].*?LoggingService['"];\s*([A-Za-z]+)\s+from\s+['"](.+?)['"];/g;

let totalFixed = 0;

function fixImportErrors(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let fixed = content;
  let hasChanges = false;

  // Fix broken import statements after Logger import
  fixed = fixed.replace(brokenImportPattern, (match, imports, fromPath) => {
    hasChanges = true;
    return `import { Logger } from '../services/LoggingService';\nimport ${imports} from '${fromPath}';`;
  });

  // Fix other broken patterns
  fixed = fixed.replace(otherBrokenPattern, (match, defaultImport, fromPath) => {
    hasChanges = true;
    return `import { Logger } from '../services/LoggingService';\nimport ${defaultImport} from '${fromPath}';`;
  });

  // Also fix patterns where the Logger import path might vary
  const generalPattern = /import\s+{\s*Logger\s*}\s+from\s+['"]([^'"]+LoggingService)['"];\s*([A-Za-z{}\s,]+)\s+from\s+['"](.+?)['"];/g;
  fixed = fixed.replace(generalPattern, (match, loggerPath, imports, fromPath) => {
    hasChanges = true;
    return `import { Logger } from '${loggerPath}';\nimport ${imports} from '${fromPath}';`;
  });

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

console.log(`\n🔍 Checking ${files.length} files for import errors...\n`);

files.forEach(file => {
  fixImportErrors(file);
});

console.log(`\n✨ Fixed import errors in ${totalFixed} files!\n`);