/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactRoot: true,
    concurrentFeatures: true,
  },
  images: {
    domains: ['gateway.ipfscdn.io'],
  }
}

module.exports = nextConfig
