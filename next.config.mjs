/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['firebase-admin'],
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/images/again1907-6th-poster.svg', destination: '/images/again1907-6th-poster-final-a-v18.png', permanent: false },
      ...['again1907-6th-poster-final-a-v17', 'again1907-6th-poster-final-a-v16', 'again1907-6th-poster-final-a-v15', 'again1907-6th-poster-final-a-v14', 'again1907-6th-poster-final-a-v13', 'again1907-6th-poster-final-a-v12', 'again1907-6th-poster-final-a-v11', 'again1907-6th-poster-final-a-v10', 'again1907-6th-poster-final-a-v9', 'again1907-6th-poster-final-a-v8', 'again1907-6th-poster-final-a-v7', 'again1907-6th-poster-final-a-v6', 'again1907-6th-poster', 'again1907-6th-poster-speakers-v1', 'again1907-6th-poster-speakers-v2', 'again1907-6th-poster-reference-v3', 'again1907-6th-poster-reference-v4', 'again1907-6th-poster-reference-v5'].flatMap((name) => ['png', 'webp'].map((ext) => ({
        source: `/images/${name}.${ext}`,
        destination: `/images/again1907-6th-poster-final-a-v18.${ext}`,
        permanent: false,
      }))),
      ...['png', 'svg'].map((ext) => ({ source: `/images/again1907-registration-qr.${ext}`, destination: `/images/again1907-registration-qr-v2.${ext}`, permanent: false })),
    ];
  },
};

export default nextConfig;
