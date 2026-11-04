import Link from 'next/link';
import './GatheringDetailPage.css';

export const gatheringPageLinks = [
  { href: '/gathering/schedule', label: '일정' },
  { href: '/gathering/speakers', label: '강사 소개' },
  { href: '/gathering/directions', label: '오시는 길' },
  { href: '/gathering/registration', label: '참가 신청' },
  { href: '/gathering/media', label: '영상·포스터' },
];

export default function GatheringPageLinks({ currentPath }) {
  return (
    <nav className="page-width gathering-page-links" aria-label="집회 상세 안내">
      {gatheringPageLinks.map(({ href, label }) => (
        <Link key={href} href={href} aria-current={currentPath === href ? 'page' : undefined}>{label}</Link>
      ))}
    </nav>
  );
}
