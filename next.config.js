/** @type {import('next').NextConfig} */
const isVercel = process.env.VERCEL === "1";

const nextConfig = {
  serverExternalPackages: ["pdf-lib", "pdf-parse"],

  eslint: {
    // Disable ESLint only on Vercel to avoid build failures
    ignoreDuringBuilds: isVercel,
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        "pdf-lib": "commonjs pdf-lib",
        "pdf-parse": "commonjs pdf-parse",
      });
    }
    return config;
  },

  turbopack: {
    root: __dirname, // suppresses warning
  },
};

module.exports = nextConfig;
