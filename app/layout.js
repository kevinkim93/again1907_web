import './globals.css';
import './gathering-fonts.css';
import LegacySiteShell from '@/components/LegacySiteShell';
import { siteUrl, siteName, shareDescription, searchDescription, shareImage } from '@/lib/site-metadata';

export const metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  verification: { other: { 'naver-site-verification': '88517d28849267343db7a67762a8d4ebfe243295' } },
  title: { default: `${siteName} 공식 사이트 | 2027 제6차 집회`, template: `%s | ${siteName}` },
  description: searchDescription,
  alternates: { canonical: `${siteUrl}/` },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  icons: {
    shortcut: [{ url: `${siteUrl}/icons/again1907-icon-96.png`, type: 'image/png', sizes: '96x96' }],
    apple: [{ url: `${siteUrl}/icons/apple-touch-icon.png`, type: 'image/png', sizes: '180x180' }],
  },
  openGraph: {
    title: '제6차 Again 1907 평양대부흥회',
    description: shareDescription,
    siteName,
    url: `${siteUrl}/`,
    locale: 'ko_KR',
    type: 'website',
    images: [shareImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: '제6차 Again 1907 평양대부흥회',
    description: shareDescription,
    images: [shareImage],
  },
};

export default function RootLayout({ children }) {
  return <html lang="ko"><body><LegacySiteShell>{children}</LegacySiteShell></body></html>;
}
