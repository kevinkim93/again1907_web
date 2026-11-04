import { siteUrl } from '@/lib/site-metadata';
import { gatheringMedia } from '@/lib/gathering-media';

export default function sitemap() {
  return ['/', '/gathering/schedule', '/gathering/speakers', '/gathering/directions', '/gathering/registration', '/gathering/media'].map((path) => ({
    url: `${siteUrl}${path}`,
    ...(path === '/' ? { images: [`${siteUrl}/images/again1907-6th-share-official-v2.png`, `${siteUrl}/images/again1907-6th-poster.png`] } : {}),
    ...(path === '/gathering/media' ? { images: gatheringMedia.map((item) => `${siteUrl}${item.image}`) } : {}),
  }));
}
