const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle Supabase packages
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.alias = {
  'crypto': 'react-native-crypto',
  'stream': 'stream-browserify',
  'buffer': '@craftzdog/react-native-buffer',
};

// Add node modules resolution
config.resolver.nodeModulesPaths = [
  './node_modules',
];

module.exports = config; 