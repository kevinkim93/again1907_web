import { gathering } from '@/lib/gathering';
import { siteUrl, siteName, searchDescription, shareImage } from '@/lib/site-metadata';

export const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: siteName,
      alternateName: ['Again1907', '어게인1907', '어게인 1907 평양대부흥회'],
      url: `${siteUrl}/`,
      inLanguage: 'ko-KR',
      publisher: { '@id': `${siteUrl}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      url: `${siteUrl}/`,
      logo: { '@type': 'ImageObject', url: `${siteUrl}/icons/again1907-logo-512.png`, width: 512, height: 512 },
    },
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/#webpage`,
      url: `${siteUrl}/`,
      name: `${siteName} 공식 사이트 | 2027 제6차 집회`,
      description: searchDescription,
      isPartOf: { '@id': `${siteUrl}/#website` },
      mainEntity: { '@id': `${siteUrl}/#event` },
      primaryImageOfPage: { '@type': 'ImageObject', url: `${siteUrl}${shareImage.url}`, width: shareImage.width, height: shareImage.height },
    },
    {
      '@type': 'Event',
      '@id': `${siteUrl}/#event`,
      name: gathering.name,
      description: '2027년 1월 25일(월)부터 30일(토)까지 오산리기도원에서 열리는 제6차 Again 1907 평양대부흥회. 월요일 오후 3시 등록을 시작하며 예배·말씀·기도와 뮤지컬이 진행됩니다.',
      startDate: '2027-01-25',
      endDate: '2027-01-30',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      url: `${siteUrl}/`,
      image: [`${siteUrl}${gathering.poster}`, `${siteUrl}${shareImage.url}`],
      location: {
        '@type': 'Place',
        name: gathering.venue,
        address: { '@type': 'PostalAddress', streetAddress: '조리읍 등원로391번길 42', addressLocality: '파주시', addressRegion: '경기도', addressCountry: 'KR' },
      },
      organizer: { '@id': `${siteUrl}/#organization` },
    },
  ],
};
