#!/usr/bin/env node

/**
 * HIGColors to Tamagui Token Replacement Script
 * 
 * This script systematically replaces HIGColors with Tamagui tokens
 * across the entire codebase.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Color mapping from HIGColors to Tamagui tokens
const colorMapping = {
  // System colors
  'HIGColors.blue': '$cupBlue',
  'HIGColors.systemBlue': '$cupBlue',
  'HIGColors.green': '$green9',
  'HIGColors.systemGreen': '$green9',
  'HIGColors.red': '$red9',
  'HIGColors.systemRed': '$red9',
  'HIGColors.orange': '$orange9',
  'HIGColors.systemOrange': '$orange9',
  'HIGColors.yellow': '$yellow9',
  'HIGColors.systemYellow': '$yellow9',
  'HIGColors.purple': '$purple9',
  'HIGColors.systemPurple': '$purple9',
  'HIGColors.pink': '$pink9',
  
  // Gray scale
  'HIGColors.gray': '$gray9',
  'HIGColors.systemGray': '$gray9',
  'HIGColors.gray2': '$gray8',
  'HIGColors.gray3': '$gray7',
  'HIGColors.systemGray3': '$gray7',
  'HIGColors.gray4': '$gray6',
  'HIGColors.systemGray4': '$gray6',
  'HIGColors.gray5': '$gray5',
  'HIGColors.systemGray5': '$gray5',
  'HIGColors.gray6': '$gray4',
  'HIGColors.systemGray6': '$gray4',
  
  // Basic colors
  'HIGColors.white': '$background',
  'HIGColors.black': '$color',
  'HIGColors.accent': '$cupBlue',
  'HIGColors.brown': '$brown9',
  'HIGColors.systemBrown': '$brown9',
  
  // Semantic colors
  'HIGColors.primary': '$cupBlue',
  'HIGColors.success': '$success',
  'HIGColors.warning': '$warning',
  'HIGColors.info': '$cupBlue',
  'HIGColors.placeholderText': '$gray10',
  'HIGColors.disabled': '$gray10',
  
  // Label colors
  'HIGColors.label': '$color',
  'HIGColors.secondaryLabel': '$gray11',
  'HIGColors.tertiaryLabel': '$gray10',
  'HIGColors.quaternaryLabel': '$gray9',
  
  // Background colors
  'HIGColors.systemBackground': '$background',
  'HIGColors.secondarySystemBackground': '$backgroundHover',
  'HIGColors.tertiarySystemBackground': '$background',
};

// Files to process (excluding already migrated Tamagui components and feature_backlog)
const includePatterns = [
  'src/**/*.{ts,tsx}',
  '!src/components-tamagui/**/*',
  '!src/screens-tamagui/**/*',
  '!feature_backlog/**/*',
  '!node_modules/**/*',
];

// Priority files to process first
const priorityFiles = [
  'src/styles/common.ts',
  'src/components/flavor/styles/*.ts',
  'src/screens/flavor/styles/*.ts',
  'src/components/common/*.tsx',
  'src/screens/*.tsx',
  'src/components/*.tsx',
];

function replaceHIGColorsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Replace each HIGColor with its Tamagui token
    for (const [higColor, tamaguiToken] of Object.entries(colorMapping)) {
      const regex = new RegExp(higColor.replace('.', '\\.'), 'g');
      if (content.includes(higColor)) {
        content = content.replace(regex, tamaguiToken);
        hasChanges = true;
        console.log(`  ${higColor} -> ${tamaguiToken}`);
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function findFilesWithHIGColors() {
  const files = [];
  
  for (const pattern of includePatterns) {
    const foundFiles = glob.sync(pattern, {
      ignore: includePatterns.filter(p => p.startsWith('!'))
    });
    files.push(...foundFiles);
  }
  
  // Filter files that actually contain HIGColors
  return files.filter(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes('HIGColors.');
    } catch {
      return false;
    }
  });
}

function main() {
  console.log('🎨 HIGColors to Tamagui Token Replacement Script');
  console.log('================================================\n');
  
  const filesWithHIGColors = findFilesWithHIGColors();
  
  if (filesWithHIGColors.length === 0) {
    console.log('✨ No files with HIGColors found!');
    return;
  }
  
  console.log(`Found ${filesWithHIGColors.length} files with HIGColors:`);
  filesWithHIGColors.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
  
  console.log('\n🔄 Starting replacement...\n');
  
  let updatedFiles = 0;
  
  for (const file of filesWithHIGColors) {
    console.log(`\n📁 Processing: ${file}`);
    if (replaceHIGColorsInFile(file)) {
      updatedFiles++;
    } else {
      console.log(`  No changes needed`);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`Files processed: ${filesWithHIGColors.length}`);
  console.log(`Files updated: ${updatedFiles}`);
  console.log(`Files unchanged: ${filesWithHIGColors.length - updatedFiles}`);
  
  if (updatedFiles > 0) {
    console.log('\n✨ HIGColors replacement completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Test the application to ensure all colors render correctly');
    console.log('2. Remove HIGColors import statements where no longer needed');
    console.log('3. Consider migrating remaining files to Tamagui styled components');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  replaceHIGColorsInFile,
  findFilesWithHIGColors,
  colorMapping,
};
