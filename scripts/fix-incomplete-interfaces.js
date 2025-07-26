const fs = require('fs');
const path = require('path');

// Read the report
const report = JSON.parse(fs.readFileSync('incomplete-interfaces-report.json', 'utf8'));

// Common type replacements
const typeReplacements = {
  // Form-related unknown types
  'value: unknown': 'value: string | number | boolean | null',
  'onChange: (value: unknown)': 'onChange: (value: string | number | boolean | null)',
  'onChangeText?: (text: unknown)': 'onChangeText?: (text: string)',
  'defaultValue?: unknown': 'defaultValue?: string | number | boolean',
  'initialValue?: unknown': 'initialValue?: string | number | boolean',
  
  // Event handlers
  'onPress?: (event: unknown)': 'onPress?: (event: GestureResponderEvent)',
  'onSelect?: (value: unknown)': 'onSelect?: (value: string | number)',
  'onValueChange?: (value: unknown)': 'onValueChange?: (value: string | number | boolean)',
  
  // Data types
  'data: unknown[]': 'data: Array<{ label: string; value: string | number }>',
  'options?: unknown[]': 'options?: Array<{ label: string; value: string | number }>',
  'items?: unknown[]': 'items?: Array<{ label: string; value: string | number }>',
  
  // Error handling
  'error?: unknown': 'error?: Error | string | null',
  'errors?: unknown': 'errors?: Record<string, string>',
  
  // Generic object types
  ': object': ': Record<string, unknown>',
  ': Function': ': (...args: any[]) => void',
  
  // Auth related
  'user?: unknown': 'user?: { id: string; email?: string; [key: string]: unknown }',
  'session?: unknown': 'session?: { token: string; expiresAt: Date; [key: string]: unknown }',
  
  // Test results
  'expected: unknown': 'expected: string | number | boolean | Record<string, unknown>',
  'actual: unknown': 'actual: string | number | boolean | Record<string, unknown>',
  'result: unknown': 'result: { success: boolean; data?: unknown; error?: string }',
};

// Function to fix a file
function fixFile(filePath, interfaces) {
  console.log(`\nProcessing ${path.relative(process.cwd(), filePath)}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  interfaces.forEach(interfaceInfo => {
    console.log(`  - Fixing ${interfaceInfo.name} (${interfaceInfo.issues.join(', ')})`);
    
    // Apply type replacements
    Object.entries(typeReplacements).forEach(([pattern, replacement]) => {
      const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (content.includes(pattern)) {
        content = content.replace(regex, replacement);
        modified = true;
        console.log(`    Replaced: ${pattern} → ${replacement}`);
      }
    });
  });
  
  if (modified) {
    // Add necessary imports if not present
    const needsGestureImport = content.includes('GestureResponderEvent') && !content.includes("from 'react-native'");
    if (needsGestureImport) {
      // Find the first import statement
      const firstImportMatch = content.match(/^import .* from/m);
      if (firstImportMatch) {
        const insertPosition = firstImportMatch.index;
        const importStatement = "import { GestureResponderEvent } from 'react-native';\n";
        content = content.slice(0, insertPosition) + importStatement + content.slice(insertPosition);
        console.log('    Added GestureResponderEvent import');
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Fixed ${interfaces.length} interfaces`);
  } else {
    console.log(`  ℹ️  No automatic fixes applied (may need manual review)`);
  }
}

// Process files with the most common issues first
console.log('🔧 Fixing incomplete TypeScript interfaces...\n');

// Focus on files with unknown types first
const unknownTypeFiles = Object.entries(report.byFile)
  .filter(([file, interfaces]) => 
    interfaces.some(i => i.issues.some(issue => issue.includes('unknown')))
  )
  .sort((a, b) => b[1].length - a[1].length);

console.log(`Found ${unknownTypeFiles.length} files with unknown types to fix\n`);

let totalFixed = 0;
unknownTypeFiles.forEach(([file, interfaces]) => {
  const unknownInterfaces = interfaces.filter(i => 
    i.issues.some(issue => issue.includes('unknown'))
  );
  
  if (unknownInterfaces.length > 0) {
    fixFile(file, unknownInterfaces);
    totalFixed += unknownInterfaces.length;
  }
});

console.log(`\n\n✅ Attempted to fix ${totalFixed} interfaces with unknown types`);

// Now handle any types
const anyTypeFiles = Object.entries(report.byFile)
  .filter(([file, interfaces]) => 
    interfaces.some(i => i.issues.some(issue => issue.includes('any')))
  );

if (anyTypeFiles.length > 0) {
  console.log(`\n\n🔧 Fixing ${anyTypeFiles.length} files with any types...\n`);
  
  anyTypeFiles.forEach(([file, interfaces]) => {
    const anyInterfaces = interfaces.filter(i => 
      i.issues.some(issue => issue.includes('any'))
    );
    
    // Special handling for modules.d.ts
    if (file.includes('modules.d.ts')) {
      console.log(`Skipping ${path.relative(process.cwd(), file)} - requires manual review for module declarations`);
    } else {
      fixFile(file, anyInterfaces);
    }
  });
}

// Generate manual fix suggestions for remaining issues
console.log('\n\n📝 Manual Fix Suggestions:\n');

// Check for empty interfaces
const emptyInterfaces = report.interfaces.filter(i => i.issues.includes('Empty interface'));
if (emptyInterfaces.length > 0) {
  console.log('Empty Interfaces:');
  emptyInterfaces.forEach(i => {
    console.log(`  - ${i.name} in ${path.relative(process.cwd(), i.file)}:${i.line}`);
    console.log('    Consider adding properties or removing if unused');
  });
}

// Check for TODO/FIXME
const todoInterfaces = report.interfaces.filter(i => i.issues.includes('Contains TODO/FIXME'));
if (todoInterfaces.length > 0) {
  console.log('\nInterfaces with TODO/FIXME:');
  todoInterfaces.forEach(i => {
    console.log(`  - ${i.name} in ${path.relative(process.cwd(), i.file)}:${i.line}`);
  });
}

console.log('\n\n💡 Next Steps:');
console.log('1. Review the changes made by this script');
console.log('2. Run TypeScript compiler to check for any new errors');
console.log('3. Manually review interfaces that could not be automatically fixed');
console.log('4. Consider creating specific types for commonly used patterns');