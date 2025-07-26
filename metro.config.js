const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    minifierConfig: {
      keep_fnames: false,
      mangle: {
        keep_fnames: false,
      },
      output: {
        ascii_only: true,
        quote_style: 3,
        wrap_iife: true,
      },
      sourceMap: {
        includeSources: false,
      },
      toplevel: false,
      compress: {
        reduce_vars: true,
      },
    },
  },
  resolver: {
    // Exclude development files from production bundle
    blockList: [
      /.*\.test\.(js|jsx|ts|tsx)$/,
      /.*\/__tests__\/.*/,
      /.*\/test\/.*/,
      /.*\.spec\.(js|jsx|ts|tsx)$/,
      /.*\/node_modules\/.*\/test\/.*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
