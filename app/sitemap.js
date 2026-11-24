import { siteUrl, shareImage } from '@/lib/site-metadata';
import { gathering } from '@/lib/gathering';
import { gatheringMedia } from '@/lib/gathering-media';

export default function sitemap() {
  return ['/', '/invite', '/history', '/gathering/schedule', '/gathering/speakers', '/gathering/directions', '/gathering/registration', '/gathering/media'].map((path) => ({
    url: `${siteUrl}${path}`,
    ...(path === '/' ? { images: [`${siteUrl}${shareImage.url}`, `${siteUrl}${gathering.poster}`] } : {}),
    ...(path === '/gathering/media' ? { images: gatheringMedia.map((item) => `${siteUrl}${item.image}`) } : {}),
    ...(path === '/invite' ? { images: [`${siteUrl}/images/again1907-6th-invite-og.png`] } : {}),
  }));
}
