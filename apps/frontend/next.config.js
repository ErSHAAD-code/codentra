const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['@codentra/shared-ui', '@codentra/shared-types'],
  experimental: {
    nodeMiddleware: true,
  },
};

module.exports = withPWA(nextConfig);