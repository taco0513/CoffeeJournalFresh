module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Add react-native-web plugin - Only for web builds
    ...(process.env.TARGET === 'web' ? ['react-native-web'] : []),
    // Tamagui configuration - TEMPORARILY DISABLED due to React 19 compatibility issue
    // [
    //   '@tamagui/babel-plugin',
    //   {
    //     components: ['tamagui'],
    //     config: './tamagui.config.ts',
    //     logTimings: true,
    //     disableExtraction: process.env.NODE_ENV === 'development',
    //   },
    // ],
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
