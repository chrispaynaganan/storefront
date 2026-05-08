/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
}
module.exports = nextConfig