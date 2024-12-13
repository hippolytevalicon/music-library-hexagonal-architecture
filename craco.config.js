const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@ports': path.resolve(__dirname, 'src/ports'),
      '@adapters': path.resolve(__dirname, 'src/adapters')
    }
  }
};