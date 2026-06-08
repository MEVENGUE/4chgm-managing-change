/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Vercel auto-detects Next.js — no `output: 'standalone'` needed
  webpack: (config, { dev }) => {
    // On Windows + OneDrive/antivirus, webpack's persistent disk cache can fail
    // its atomic rename (ENOENT *.pack.gz_). Use in-memory cache in dev to avoid it.
    if (dev) {
      config.cache = { type: 'memory' };
    }
    return config;
  },
};

module.exports = nextConfig;
