import { siteUrl } from '@/lib/site-metadata';

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
