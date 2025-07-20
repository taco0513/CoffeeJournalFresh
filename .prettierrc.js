module.exports = {
  // Basic formatting
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  
  // JSX specific
  jsxSingleQuote: true,
  jsxBracketSameLine: false,
  
  // Object formatting
  bracketSpacing: true,
  
  // Arrow functions
  arrowParens: 'avoid',
  
  // End of line
  endOfLine: 'lf',
  
  // React Native specific overrides
  overrides: [
    {
      files: ['*.{js,jsx,ts,tsx}'],
      options: {
        printWidth: 100,
        trailingComma: 'es5',
      },
    },
    {
      files: ['*.json'],
      options: {
        printWidth: 200,
        trailingComma: 'none',
      },
    },
    {
      files: ['*.md'],
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
  ],
};
