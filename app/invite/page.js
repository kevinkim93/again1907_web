import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { gathering } from '@/lib/gathering';
import { scheduleDays } from '@/lib/gathering-schedule';
import { siteUrl, siteName } from '@/lib/site-metadata';
import InviteShare from './InviteShare';
import './invite.css';

const firstDay = scheduleDays[0];
const lastDay = scheduleDays[scheduleDays.length - 1];
const year = firstDay.dateTime.slice(0, 4);
const dateLabel = (day) => `${day.date.replace('.', '월 ')}일(${day.shortLabel})`;
const dates = `${year}년 ${dateLabel(firstDay)}–${dateLabel(lastDay)}`;
const lastDateLabel = firstDay.dateTime.slice(0, 7) === lastDay.dateTime.slice(0, 7)
  ? `${Number(lastDay.dateTime.slice(8))}일(${lastDay.shortLabel})`
  : dateLabel(lastDay);
const promoEmbedUrl = new URL(gathering.promoEmbedUrl);
promoEmbedUrl.searchParams.set('autoplay', '1');
promoEmbedUrl.searchParams.set('mute', '1');
promoEmbedUrl.searchParams.set('playsinline', '1');
promoEmbedUrl.searchParams.set('rel', '0');
const inviteUrl = `${siteUrl}/invite`;
const title = `초청합니다 | ${gathering.name}`;
const description = `${dates}, ${gathering.venue}. 말씀을 듣고 함께 기도하는 자리에 여러분을 초청합니다. 다른 형제자매에게도 초청해 주십시오.`;
const inviteImage = {
  url: `${siteUrl}/images/again1907-6th-invite-og.png`,
  width: 1200,
  height: 630,
  type: 'image/png',
  alt: `${gathering.name} 초청합니다 · ${dates} · ${gathering.venue}`,
};

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { absolute: title },
  description,
  alternates: { canonical: inviteUrl },
  openGraph: {
    title,
    description,
    url: inviteUrl,
    siteName,
    type: 'website',
    locale: 'ko_KR',
    images: [inviteImage],
  },
  twitter: { card: 'summary_large_image', title, description, images: [inviteImage] },
};

export default function InvitePage() {
  return (
    <div className="gathering-page invite-page" id="invite-top">
      <a className="skip-link" href="#invite-content">본문 바로가기</a>
      <header className="invite-header">
        <div className="page-width invite-header-inner">
          <Link className="wordmark" href="/" aria-label="Again 1907 공식 홈">Again 1907</Link>
          <Link className="invite-home-link" href="/">공식 홈 <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
      </header>

      <div id="invite-content">
        <section className="invite-hero" aria-labelledby="invite-title">
          <div className="page-width invite-hero-layout">
            <h1 id="invite-title">초청합니다</h1>
            <p className="invite-edition">제6차 Again1907 평양대부흥회</p>
            <div className="invite-video">
              <iframe className="promo-player" src={promoEmbedUrl.toString()}
                title={`${gathering.name} 초청 영상`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
            </div>
            <p className="invite-event-summary">
              <span className="invite-date"><time dateTime={firstDay.dateTime}>{year}년 {dateLabel(firstDay)}</time>–<time dateTime={lastDay.dateTime}>{lastDateLabel}</time></span>
              {' · '}<span className="invite-venue">{gathering.venue}</span>
            </p>
            <div className="invite-primary-actions">
              <Link className="button button-light" href="/#registration">참가 신청 <ArrowUpRight size={18} aria-hidden="true" /></Link>
              <a className="button button-outline" href="#invite-share">초청장 나누기</a>
            </div>
          </div>
        </section>

        <section className="invite-share-section" id="invite-share" aria-labelledby="invite-share-title">
          <div className="page-width invite-share-inner">
            <h2 id="invite-share-title"><span>다른 형제자매에게도</span><br /><span>초청해 주십시오.</span></h2>
            <InviteShare title={title} text={description} url={inviteUrl} />
          </div>
        </section>
      </div>
    </div>
  );
}
