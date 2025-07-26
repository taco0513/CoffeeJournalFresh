const fs = require('fs');
const path = require('path');

// Specific fixes for remaining unknown types
const specificFixes = [
  // Text style props
  {
    file: 'src/components-tamagui/buttons/Chip.tsx',
    find: 'textStyle?: unknown;',
    replace: 'textStyle?: StyleProp<TextStyle>;',
    imports: ["import { StyleProp, ViewStyle, TextStyle } from 'react-native';"]
  },
  
  // Market config
  {
    file: 'src/components/beta/BetaStatusPanel.tsx',
    find: 'marketConfig: unknown;',
    replace: 'marketConfig: { market: string; features: Record<string, boolean> } | null;'
  },
  
  // Error info
  {
    file: 'src/components/ErrorBoundary.tsx',
    find: 'errorInfo: unknown;',
    replace: 'errorInfo: React.ErrorInfo | null;'
  },
  
  // Navigation props
  {
    file: 'src/screens-legacy/HomeScreen.tsx',
    find: 'navigation: unknown;',
    replace: 'navigation: NavigationProp<any>;',
    imports: ["import { NavigationProp } from '@react-navigation/native';"]
  },
  {
    file: 'src/screens-tamagui/analytics/MarketIntelligenceScreen.tsx',
    find: 'navigation: unknown;',
    replace: 'navigation: NavigationProp<any>;',
    imports: ["import { NavigationProp } from '@react-navigation/native';"]
  },
  {
    file: 'src/screens-tamagui/core/HomeScreen.tsx',
    find: 'navigation: unknown;',
    replace: 'navigation: NavigationProp<any>;',
    imports: ["import { NavigationProp } from '@react-navigation/native';"]
  },
  {
    file: 'src/screens-tamagui/tasting/ResultScreen.tsx',
    find: 'navigation: unknown;',
    replace: 'navigation: NavigationProp<any>;',
    imports: ["import { NavigationProp } from '@react-navigation/native';"]
  },
  
  // Data props
  {
    file: 'src/components/personalTaste/GrowthTimeline.tsx',
    find: 'data?: unknown;',
    replace: 'data?: Record<string, string | number | boolean>;'
  },
  {
    file: 'src/components/testing/I18nValidationScreen.tsx',
    find: 'details?: unknown;',
    replace: 'details?: Record<string, string | number | boolean>;'
  },
  {
    file: 'src/components/testing/MarketConfigurationTester_Original.tsx',
    find: 'data?: unknown;',
    replace: 'data?: Record<string, any>;'
  },
  
  // Form field props
  {
    file: 'src/components-tamagui/forms/FormField.tsx',
    find: 'value?: unknown;',
    replace: 'value?: string | number | boolean | null;'
  },
  {
    file: 'src/components-tamagui/forms/FormField.tsx',
    find: 'onChangeText?: (text: unknown) => void;',
    replace: 'onChangeText?: (text: string) => void;'
  },
  
  // Select input options
  {
    file: 'src/components-tamagui/forms/SelectInput.tsx',
    find: 'value: unknown;',
    replace: 'value: string | number;'
  },
  {
    file: 'src/components-tamagui/forms/SelectInput.tsx',
    find: 'onValueChange: (value: unknown) => void;',
    replace: 'onValueChange: (value: string | number) => void;'
  },
  
  // Autocomplete props
  {
    file: 'src/components-tamagui/forms/AutocompleteInput.tsx',
    find: 'value: unknown;',
    replace: 'value: string;'
  },
  {
    file: 'src/components-tamagui/forms/AutocompleteInput.tsx',
    find: 'onChange: (value: unknown) => void;',
    replace: 'onChange: (value: string) => void;'
  },
  
  // Test result types
  {
    file: 'src/utils/crossMarketTester.ts',
    find: 'result: unknown;',
    replace: 'result: { success: boolean; data?: any; error?: string };'
  },
  {
    file: 'src/types/MarketTestTypes.ts',
    find: 'result: unknown;',
    replace: 'result: { passed: boolean; message: string; details?: Record<string, any> };'
  },
  {
    file: 'src/types/MarketTestTypes.ts',
    find: 'expected: unknown;',
    replace: 'expected: string | number | boolean | Record<string, any>;'
  },
  {
    file: 'src/types/MarketTestTypes.ts',
    find: 'actual: unknown;',
    replace: 'actual: string | number | boolean | Record<string, any>;'
  },
  
  // Session and auth
  {
    file: 'src/services/auth/SessionManager.tsx',
    find: 'userData?: unknown;',
    replace: 'userData?: { id: string; email?: string; username?: string; [key: string]: any };'
  },
  {
    file: 'src/services/auth/UnifiedAuthService.ts',
    find: 'user: unknown;',
    replace: 'user: { id: string; email?: string; [key: string]: any };'
  },
  
  // Lab mode data
  {
    file: 'src/types/tasting.ts',
    find: 'experimentData?: unknown;',
    replace: 'experimentData?: Record<string, string | number | boolean>;'
  },
  {
    file: 'src/types/tasting.ts',
    find: 'customMetrics?: unknown;',
    replace: 'customMetrics?: Record<string, number>;'
  },
  
  // Screen context
  {
    file: 'src/services/ScreenContextService.ts',
    find: 'params?: unknown;',
    replace: 'params?: Record<string, any>;'
  },
  {
    file: 'src/services/ScreenContextService.ts',
    find: 'metadata?: unknown;',
    replace: 'metadata?: Record<string, string | number | boolean>;'
  }
];

// Function to apply fixes
function applyFixes() {
  console.log('🔧 Applying specific fixes for remaining unknown types...\n');
  
  let fixedCount = 0;
  let errorCount = 0;
  
  specificFixes.forEach(fix => {
    try {
      const filePath = path.join(process.cwd(), fix.file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${fix.file}`);
        errorCount++;
        return;
      }
      
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes(fix.find)) {
        // Apply the fix
        content = content.replace(fix.find, fix.replace);
        
        // Add imports if needed
        if (fix.imports) {
          fix.imports.forEach(importStatement => {
            if (!content.includes(importStatement)) {
              // Find the first import line
              const firstImportMatch = content.match(/^import .* from/m);
              if (firstImportMatch) {
                const insertPosition = firstImportMatch.index;
                content = content.slice(0, insertPosition) + importStatement + '\n' + content.slice(insertPosition);
              } else {
                // No imports found, add at the beginning
                content = importStatement + '\n\n' + content;
              }
            }
          });
        }
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed: ${fix.file}`);
        console.log(`   ${fix.find} → ${fix.replace}`);
        fixedCount++;
      } else {
        console.log(`ℹ️  Pattern not found in ${fix.file} (may already be fixed)`);
      }
    } catch (error) {
      console.log(`❌ Error processing ${fix.file}: ${error.message}`);
      errorCount++;
    }
  });
  
  console.log(`\n\n📊 Summary:`);
  console.log(`   Fixed: ${fixedCount} interfaces`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total fixes attempted: ${specificFixes.length}`);
}

// Apply the fixes
applyFixes();

// Create a type definitions file for common patterns
const commonTypes = `// Common type definitions for the project
// Generated by fix-specific-interfaces.js

import { NavigationProp } from '@react-navigation/native';
import { StyleProp, ViewStyle, TextStyle } from 'react-native';

// Navigation types
export type AppNavigationProp = NavigationProp<any>;

// Form value types
export type FormValue = string | number | boolean | null;

// Test result types
export interface TestResult {
  success: boolean;
  message: string;
  data?: Record<string, any>;
  error?: string;
}

// Market configuration
export interface MarketConfig {
  market: string;
  features: Record<string, boolean>;
  locale?: string;
  currency?: string;
}

// User data
export interface UserData {
  id: string;
  email?: string;
  username?: string;
  [key: string]: any;
}

// Generic data record
export type DataRecord = Record<string, string | number | boolean>;
`;

fs.writeFileSync('src/types/common.ts', commonTypes);
console.log('\n✅ Created src/types/common.ts with common type definitions');

console.log('\n\n💡 Next Steps:');
console.log('1. Run TypeScript compiler to verify the fixes');
console.log('2. Consider using the common types from src/types/common.ts');
console.log('3. Replace remaining "any" types with more specific types where possible');