import { siteUrl, shareImage } from '@/lib/site-metadata';
import { gatheringMedia } from '@/lib/gathering-media';

export default function sitemap() {
  return ['/', '/gathering/schedule', '/gathering/speakers', '/gathering/directions', '/gathering/registration', '/gathering/media'].map((path) => ({
    url: `${siteUrl}${path}`,
    ...(path === '/' ? { images: [`${siteUrl}${shareImage.url}`, `${siteUrl}/images/again1907-6th-poster-reference-v4.webp`] } : {}),
    ...(path === '/gathering/media' ? { images: gatheringMedia.map((item) => `${siteUrl}${item.image}`) } : {}),
  }));
}
