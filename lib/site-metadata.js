export const siteUrl = 'https://again1907.kr';
export const siteName = 'Again 1907 평양대부흥회';
export const shareDescription = `${siteName} 공식 사이트`;
export const searchDescription = 'Again 1907 평양대부흥회 공식 사이트. 제6차 집회는 2027년 1월 25일(월)부터 30일(토)까지 오산리기도원에서 열립니다. 집회 일정, 강사 소개, 참가 신청, 기도원 버스와 오시는 길을 안내합니다.';
export const shareImage = {
  url: '/images/again1907-6th-share.png',
  width: 1200,
  height: 630,
  type: 'image/png',
  alt: '제6차 Again 1907 평양대부흥회 · 2027년 1월 25일–30일 · 오산리기도원',
};

export function createPageMetadata({ title, description, path }) {
  const fullTitle = `${title} | ${siteName}`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: `${siteUrl}${path}` },
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      title: fullTitle,
      description,
      siteName,
      url: `${siteUrl}${path}`,
      locale: 'ko_KR',
      type: 'website',
      images: [shareImage],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [shareImage] },
  };
}
