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
    
    // Handle Node.js modules in client-side code
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        'fs/promises': false,
        'child_process': false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
