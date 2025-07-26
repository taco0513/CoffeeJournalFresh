#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const babel = require('@babel/core');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const generator = require('@babel/generator').default;

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/LoggingService.ts',
  '**/LoggingService.js',
  '**/*.test.*',
  '**/*.spec.*',
];

// Mapping of console methods to Logger methods and levels
const CONSOLE_METHOD_MAP = {
  'log': { method: 'debug', needsContext: true },
  'debug': { method: 'debug', needsContext: true },
  'info': { method: 'info', needsContext: true },
  'warn': { method: 'warn', needsContext: true },
  'error': { method: 'error', needsContext: true },
};

// Get category from file path
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

// Process file with Babel AST
function processFileWithAST(filePath) {
  console.log(`Processing: ${filePath}`);
  
  const code = fs.readFileSync(filePath, 'utf8');
  const category = getCategoryFromPath(filePath);
  const component = getComponentFromPath(filePath);
  
  let hasLoggerImport = false;
  let needsLoggerImport = false;
  let modified = false;
  
  try {
    const ast = babel.parseSync(code, {
      sourceType: 'module',
      plugins: [
        'typescript',
        'jsx',
        'classProperties',
        'decorators-legacy',
        'dynamicImport',
        'optionalChaining',
        'nullishCoalescingOperator',
      ],
      filename: filePath,
    });

    // First pass: check for existing Logger import
    traverse(ast, {
      ImportDeclaration(path) {
        if (path.node.source.value.includes('LoggingService')) {
          hasLoggerImport = true;
        }
      }
    });

    // Second pass: transform console calls
    traverse(ast, {
      CallExpression(path) {
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.object, { name: 'console' }) &&
          CONSOLE_METHOD_MAP[path.node.callee.property.name]
        ) {
          const consoleMethod = path.node.callee.property.name;
          const loggerConfig = CONSOLE_METHOD_MAP[consoleMethod];
          const args = path.node.arguments;
          
          if (args.length === 0) return; // Skip empty console calls
          
          needsLoggerImport = true;
          modified = true;
          
          // Build new Logger call
          const newArgs = [
            args[0], // Keep the message
            t.stringLiteral(category),
            t.objectExpression([
              t.objectProperty(
                t.identifier('component'),
                t.stringLiteral(component)
              ),
            ])
          ];
          
          // If there are additional arguments and it's an error, add them to context
          if (args.length > 1 && (consoleMethod === 'error' || consoleMethod === 'warn')) {
            // Check if second argument looks like an error
            const secondArg = args[1];
            if (
              t.isIdentifier(secondArg) || 
              (t.isMemberExpression(secondArg) && secondArg.property.name === 'error') ||
              (t.isStringLiteral(secondArg) && secondArg.value.toLowerCase().includes('error'))
            ) {
              // Add error to context
              newArgs[2].properties.push(
                t.objectProperty(
                  t.identifier('error'),
                  secondArg
                )
              );
            } else {
              // Add as generic data
              newArgs[2].properties.push(
                t.objectProperty(
                  t.identifier('data'),
                  t.objectExpression([
                    t.objectProperty(
                      t.identifier('extra'),
                      secondArg
                    )
                  ])
                )
              );
            }
          } else if (args.length > 1) {
            // For non-error methods, add additional args as data
            const dataProperties = args.slice(1).map((arg, index) => 
              t.objectProperty(
                t.identifier(`arg${index + 1}`),
                arg
              )
            );
            
            newArgs[2].properties.push(
              t.objectProperty(
                t.identifier('data'),
                t.objectExpression(dataProperties)
              )
            );
          }
          
          // Replace the console call with Logger call
          path.replaceWith(
            t.callExpression(
              t.memberExpression(
                t.identifier('Logger'),
                t.identifier(loggerConfig.method)
              ),
              newArgs
            )
          );
        }
      }
    });

    // Add Logger import if needed
    if (needsLoggerImport && !hasLoggerImport) {
      const relativePath = path.relative(path.dirname(filePath), path.join(SRC_DIR, 'services/LoggingService'));
      const importPath = (relativePath.startsWith('.') ? relativePath : './' + relativePath).replace(/\\/g, '/');
      
      const importDeclaration = t.importDeclaration(
        [t.importSpecifier(t.identifier('Logger'), t.identifier('Logger'))],
        t.stringLiteral(importPath)
      );
      
      // Find the last import and add after it
      let lastImportIndex = -1;
      ast.program.body.forEach((node, index) => {
        if (t.isImportDeclaration(node)) {
          lastImportIndex = index;
        }
      });
      
      if (lastImportIndex >= 0) {
        ast.program.body.splice(lastImportIndex + 1, 0, importDeclaration);
      } else {
        ast.program.body.unshift(importDeclaration);
      }
    }

    if (modified) {
      // Generate code from modified AST
      const output = generator(ast, {
        retainLines: true,
        concise: false,
        quotes: 'single',
      }, code);
      
      fs.writeFileSync(filePath, output.code, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return 1;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
  
  return 0;
}

// Check if required dependencies are installed
function checkDependencies() {
  const requiredPackages = [
    '@babel/core',
    '@babel/traverse',
    '@babel/types',
    '@babel/generator',
    '@babel/parser',
  ];
  
  const missingPackages = [];
  requiredPackages.forEach(pkg => {
    try {
      require.resolve(pkg);
    } catch (e) {
      missingPackages.push(pkg);
    }
  });
  
  if (missingPackages.length > 0) {
    console.error('Missing required packages. Please install:');
    console.error(`npm install --save-dev ${missingPackages.join(' ')}`);
    process.exit(1);
  }
}

// Main execution
function main() {
  checkDependencies();
  
  console.log('Starting console to Logger migration using AST...\n');
  
  // Find all TypeScript and JavaScript files
  const pattern = path.join(SRC_DIR, '**/*.{ts,tsx,js,jsx}');
  const files = glob.sync(pattern, { ignore: EXCLUDE_PATTERNS });
  
  console.log(`Found ${files.length} files to process\n`);
  
  let updatedCount = 0;
  files.forEach(file => {
    updatedCount += processFileWithAST(file);
  });
  
  console.log(`\n✅ Migration complete! Updated ${updatedCount} files.`);
  console.log('\nNext steps:');
  console.log('1. Review the changes with: git diff');
  console.log('2. Run TypeScript compilation to check for errors: npm run tsc');
  console.log('3. Test the application to ensure logging works correctly');
  console.log('4. Consider adjusting log levels and categories in LoggingService');
  console.log('5. Commit the changes');
}

// Run the migration
main();