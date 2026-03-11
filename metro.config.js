const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix three.js exports map issue — three@0.158 declares exports that don't exist,
// causing Metro warnings. Disable package exports resolution for three.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
