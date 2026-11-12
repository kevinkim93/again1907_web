/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['firebase-admin'],
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/images/again1907-6th-poster.svg', destination: '/images/again1907-6th-poster-reference-v5.png', permanent: false },
      ...['again1907-6th-poster', 'again1907-6th-poster-speakers-v1', 'again1907-6th-poster-speakers-v2', 'again1907-6th-poster-reference-v3', 'again1907-6th-poster-reference-v4'].flatMap((name) => ['png', 'webp'].map((ext) => ({
        source: `/images/${name}.${ext}`,
        destination: `/images/again1907-6th-poster-reference-v5.${ext}`,
        permanent: false,
      }))),
      ...['png', 'svg'].map((ext) => ({ source: `/images/again1907-registration-qr.${ext}`, destination: `/images/again1907-registration-qr-v2.${ext}`, permanent: false })),
    ];
  },
};

export default nextConfig;
