module.exports = {
  project: {
    ios: {},
    android: {},
  },
  dependencies: {
    '@react-native-ml-kit/text-recognition': {
      platforms: {
        ios: null, // Disable iOS auto-linking for simulator compatibility
      },
    },
  },
};