#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Optimizing Realm for production...');

const realmPath = path.join(__dirname, '../node_modules/realm');

// Remove unnecessary Realm files for production
const filesToRemove = [
  'node_modules/realm/android-arm64',
  'node_modules/realm/android-armeabi-v7a', 
  'node_modules/realm/android-x86',
  'node_modules/realm/android-x86_64',
  'node_modules/realm/tests',
  'node_modules/realm/examples',
  'node_modules/realm/docs',
  'node_modules/realm/scripts/tests',
  'node_modules/realm/.github',
];

filesToRemove.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    console.log(`Removing ${file}...`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

console.log('✅ Realm optimization complete');