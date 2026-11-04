import './globals.css';
import './gathering-fonts.css';
import LegacySiteShell from '@/components/LegacySiteShell';

const shareDescription = '120년 전 그 겨울의 통회 앞에 우리가 다시 섭니다. 1907년 평양대부흥의 성령의 새 바람을 사모하며, 한국 교회 중보기도의 본향 오산리최자실기도원에 모이려 합니다. 함께 회복하고 일어서실 분들을 간곡히 초청합니다.';

export const metadata = {
  metadataBase: new URL('https://again1907.kr'),
  title: '제6차 Again 1907 평양대부흥회',
  description: shareDescription,
  openGraph: {
    title: '제6차 Again 1907 평양대부흥회',
    description: shareDescription,
    url: 'https://again1907.kr/',
    locale: 'ko_KR',
    type: 'website',
    images: [{
      url: '/images/again1907-6th-share-youtube-v1.jpg',
      width: 1280,
      height: 720,
      type: 'image/jpeg',
      alt: '제6차 Again 1907 평양대부흥회 · 2027년 1월 25일–30일 · 오산리기도원',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '제6차 Again 1907 평양대부흥회',
    description: shareDescription,
    images: [{
      url: '/images/again1907-6th-share-youtube-v1.jpg',
      alt: '제6차 Again 1907 평양대부흥회 · 2027년 1월 25일–30일 · 오산리기도원',
    }],
  },
};

export default function RootLayout({ children }) {
  return <html lang="ko"><body><LegacySiteShell>{children}</LegacySiteShell></body></html>;
}
