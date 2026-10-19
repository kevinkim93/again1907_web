import './globals.css';
import './gathering-fonts.css';
import LegacySiteShell from '@/components/LegacySiteShell';

export const metadata = {
  metadataBase: new URL('https://again1907.kr'),
  title: '제6차 Again 1907 평양대부흥회',
  description: '2027년 1월 25일(월)부터 30일(토)까지, 오산리기도원. 제6차 Again 1907 평양대부흥회 안내와 참가 신청.',
  openGraph: {
    title: '제6차 Again 1907 평양대부흥회',
    description: '2027. 01. 25 월 — 01. 30 토 · 오산리기도원',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: '/images/again1907-6th-poster.png', width: 1086, height: 1448, alt: '제6차 Again 1907 평양대부흥회 포스터' }],
  },
};

export default function RootLayout({ children }) {
  return <html lang="ko"><body><LegacySiteShell>{children}</LegacySiteShell></body></html>;
}
