/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['firebase-admin'],
  async redirects() {
    return [{ source: '/index.html', destination: '/', permanent: true }];
  },
};

export default nextConfig;
