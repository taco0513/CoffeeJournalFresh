module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Tamagui configuration
    [
      '@tamagui/babel-plugin',
      {
        components: ['tamagui'],
        config: './tamagui.config.ts',
        logTimings: true,
        disableExtraction: process.env.NODE_ENV === 'development',
      },
    ],
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
