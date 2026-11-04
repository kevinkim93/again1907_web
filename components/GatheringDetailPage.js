import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { gathering } from '@/lib/gathering';
import GatheringPageLinks, { gatheringPageLinks } from '@/components/GatheringPageLinks';
import StructuredData from '@/components/StructuredData';
import FloatingGatheringActions from '@/components/FloatingGatheringActions';

export default function GatheringDetailPage({ title, path, intro, children, className = '' }) {
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Again 1907 평양대부흥회', item: 'https://again1907.kr/' },
      { '@type': 'ListItem', position: 2, name: title, item: `https://again1907.kr${path}` },
    ],
  };

  return (
    <div className={`gathering-page gathering-detail-page ${className}`}>
      <StructuredData data={breadcrumbs} id="breadcrumb-data" />
      <a className="skip-link" href="#detail-content">본문 바로가기</a>
      <header className="detail-header">
        <div className="page-width detail-header-inner">
          <Link className="detail-brand" href="/">
            <span className="wordmark">Again 1907</span><span>평양대부흥회</span>
          </Link>
          <nav aria-label="주요 메뉴">
            {gatheringPageLinks.map(({ href, label }) => (
              <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>{label}</Link>
            ))}
          </nav>
        </div>
      </header>
      <main id="detail-content" className="page-width detail-main">
        <nav className="detail-breadcrumb" aria-label="현재 위치"><Link href="/">홈</Link><span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav>
        <div className="detail-heading">
          <p className="detail-edition">제6차 Again 1907 평양대부흥회</p>
          <h1>{title}</h1>
          <p className="detail-intro">{intro}</p>
        </div>
        {children}
      </main>
      <footer className="gathering-footer">
        <div className="page-width footer-main">
          <Link className="footer-brand" href="/"><span className="wordmark">Again1907</span><span className="footer-brand-title">평양대부흥회</span></Link>
          <a className="footer-contact" href={gathering.contactUrl} target="_blank" rel="noopener noreferrer">카카오톡 문의 <ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a>
        </div>
        <GatheringPageLinks currentPath={path} />
        <div className="page-width footer-bottom"><span>2027년 제6차 평양대부흥회</span><Link href="/">공식 홈 <ArrowUpRight size={13} aria-hidden="true" /></Link></div>
      </footer>
      <FloatingGatheringActions />
    </div>
  );
}
