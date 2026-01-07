/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverActions: {
    bodySizeLimit: '10mb', // Increase limit for cover image uploads (base64 data URLs can be large)
  },
}

export default nextConfig
