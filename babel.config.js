module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Remove console logs in production builds
    ...(process.env.NODE_ENV === 'production' ? ['transform-remove-console'] : []),
    // Module resolver for path aliases
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src',
        },
      },
    ],
  ],
};
