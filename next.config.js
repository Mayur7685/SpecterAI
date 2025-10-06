/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf-lib', 'pdf-parse'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'pdf-lib': 'commonjs pdf-lib',
        'pdf-parse': 'commonjs pdf-parse'
      });
    }
    return config;
  },
  // Set turbopack root to silence warning
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
