import './globals.css';
import './gathering-fonts.css';
import LegacySiteShell from '@/components/LegacySiteShell';

const shareDescription = 'Again 1907 평양대부흥회 공식 사이트';

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
      url: '/images/again1907-6th-share-official-v2.png',
      width: 1734,
      height: 907,
      type: 'image/png',
      alt: '제6차 Again 1907 평양대부흥회 · 2027년 1월 25일–30일 · 오산리기도원',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '제6차 Again 1907 평양대부흥회',
    description: shareDescription,
    images: [{
      url: '/images/again1907-6th-share-official-v2.png',
      alt: '제6차 Again 1907 평양대부흥회 · 2027년 1월 25일–30일 · 오산리기도원',
    }],
  },
};

export default function RootLayout({ children }) {
  return <html lang="ko"><body><LegacySiteShell>{children}</LegacySiteShell></body></html>;
}
