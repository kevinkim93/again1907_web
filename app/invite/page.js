import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Download } from 'lucide-react';
import { gathering } from '@/lib/gathering';
import { gatheringSpeakers, scheduleDays, scheduleRows } from '@/lib/gathering-schedule';
import { siteUrl, siteName } from '@/lib/site-metadata';
import { homeStructuredData } from '@/lib/site-structured-data';
import InviteShare from './InviteShare';
import './invite.css';

const firstDay = scheduleDays[0];
const lastDay = scheduleDays[scheduleDays.length - 1];
const year = firstDay.dateTime.slice(0, 4);
const dateLabel = (day) => `${day.date.replace('.', '월 ')}일(${day.shortLabel})`;
const dates = `${year}년 ${dateLabel(firstDay)}–${dateLabel(lastDay)}`;
const registration = scheduleRows.find(({ id }) => id === 'registration')?.days[firstDay.id]?.[0];
const worshipRows = scheduleRows.filter(({ kind }) => kind === 'worship');
const musical = worshipRows.flatMap(({ days }) => days[firstDay.id] ?? []).find(({ title }) => title === '뮤지컬');
const closing = worshipRows.flatMap(({ days }) => days[lastDay.id] ?? []).find(({ title }) => title === '폐회 예배');
const gatheringIntroduction = homeStructuredData['@graph'].find((item) => item['@type'] === 'Event').description;
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
            <div className="invite-copy">
              <p className="invite-edition">{gathering.name}</p>
              <h1 id="invite-title"><span>함께 기도하는 자리에</span>초청합니다</h1>
              <div className="invite-letter">
                <p>사랑하는 형제자매 여러분,</p>
                <p>주님 앞에 마음을 모아 말씀을 듣고<br className="invite-desktop-break" /> 함께 기도하는 자리에 여러분을 초청합니다.</p>
                <p>분주한 일상을 잠시 내려놓고,<br className="invite-desktop-break" /> 우리를 부르시는 주님께 함께 나아갑시다.<br className="invite-desktop-break" /> 이 자리를 사모하는 여러분을 기도로 기다립니다.</p>
              </div>
              <div className="invite-video">
                <iframe className="promo-player" src={promoEmbedUrl.toString()}
                  title={`${gathering.name} 초청 영상`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
                <a className="invite-video-link" href={gathering.promoVideoUrl} target="_blank" rel="noopener noreferrer">유튜브에서 보기 <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a>
              </div>
              <div className="invite-event-summary">
                <p className="invite-date"><time dateTime={firstDay.dateTime}>{year}년 {dateLabel(firstDay)}</time><span>–</span><time dateTime={lastDay.dateTime}>{dateLabel(lastDay)}</time></p>
                <p className="invite-venue">{gathering.venue}</p>
              </div>
              <div className="invite-primary-actions">
                <Link className="button button-light" href="/#registration">참가 신청 <ArrowUpRight size={19} aria-hidden="true" /></Link>
                <a className="invite-share-anchor" href="#invite-share">초청장 나누기 <ArrowUpRight size={16} aria-hidden="true" /></a>
              </div>
            </div>
            <figure className="poster-art invite-poster">
              <a className="poster-image-link" href={gathering.posterDownload} target="_blank" rel="noopener noreferrer" aria-label={`${gathering.name} 확정 포스터 크게 보기 (새 탭)`}>
                <Image src={gathering.poster} alt={`${gathering.name} 공식 포스터. ${dates}, ${gathering.venue}.`} width={2108} height={2984} sizes="(min-width: 1100px) 440px, (min-width: 900px) 40vw, (min-width: 500px) 440px, 90vw" className="poster-image" priority unoptimized />
              </a>
              <figcaption>마음을 모아, 함께 기다리는 집회</figcaption>
            </figure>
          </div>
        </section>

        <section className="gathering-details invite-details" aria-labelledby="invite-details-title">
          <div className="page-width details-layout">
            <div className="section-heading"><p className="invite-eyebrow">함께할 자리</p><h2 id="invite-details-title">집회 소개</h2></div>
            <div>
              <div className="invite-introduction">
                <h3>주님이 역사하시는<br />초자연적 부흥집회</h3>
                <p>{gatheringIntroduction}</p>
                <blockquote>
                  <p>오라 우리가 여호와께로 돌아가자.</p>
                  <cite>주제말씀 · 호세아 6:1</cite>
                </blockquote>
              </div>
              <dl className="invite-facts">
                <div><dt>집회</dt><dd>{gathering.name}</dd></div>
                <div><dt>일시</dt><dd>{dates}{registration && <span className="invite-fact-note">{firstDay.label} {registration.time} {registration.title}</span>}</dd></div>
                <div><dt>장소</dt><dd>{gathering.venue}<span className="invite-fact-note">{gathering.address}</span></dd></div>
                <div><dt>순서</dt><dd>{worshipRows.map(({ label }) => label).join(' · ')}<span className="invite-fact-note">찬양 · 설교 · 기도 · 간증 · 탈북민 간증 · 북한특송</span></dd></div>
                {musical && <div><dt>{musical.title}</dt><dd>{musical.person}<span className="invite-fact-note">{dateLabel(firstDay)} {musical.time} · {musical.note}</span></dd></div>}
                {closing && <div><dt>폐회</dt><dd>{closing.title}<span className="invite-fact-note">{dateLabel(lastDay)} {closing.time}</span></dd></div>}
              </dl>
              <div className="venue-links">
                <Link className="text-link" href="/gathering/schedule">전체 일정 <ArrowUpRight size={17} aria-hidden="true" /></Link>
                <Link className="text-link" href="/gathering/directions">오시는 길 <ArrowUpRight size={17} aria-hidden="true" /></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="speakers-section invite-speakers" aria-labelledby="invite-speakers-title">
          <div className="page-width speakers-layout">
            <div className="section-heading"><p className="invite-eyebrow">말씀과 은혜를 나누는</p><h2 id="invite-speakers-title">강사 소개</h2></div>
            <ul className="speaker-list">
              {gatheringSpeakers.map(({ name, affiliation }) => (
                <li key={name}><h3>{name}</h3><p>{affiliation}</p></li>
              ))}
            </ul>
          </div>
        </section>

        <section className="prayer-section invite-prayer" aria-labelledby="invite-prayer-title">
          <div className="page-width prayer-layout">
            <div className="section-heading"><p className="invite-eyebrow">집회를 기다리며</p><h2 id="invite-prayer-title">함께 기도해 주십시오</h2></div>
            <div className="prayer-copy">
              <p>만남을 준비하는 시간에도 말씀으로 마음을 모아 주십시오. 기도 말씀을 내려받아 함께 읽으며, 주님께서 이끄실 집회를 위해 기도해 주십시오.</p>
              <a className="button button-light" href={gathering.prayerScriptures} download="Again1907-제6차-기도말씀.pdf">기도 말씀 다운로드 <Download size={18} aria-hidden="true" /></a>
            </div>
          </div>
        </section>

        <section className="invite-share-section" id="invite-share" aria-labelledby="invite-share-title">
          <div className="page-width invite-share-inner">
            <p className="invite-eyebrow">이 초청을 함께 나누어 주십시오</p>
            <h2 id="invite-share-title"><span>다른 형제자매에게도</span><br /><span>초청해 주십시오.</span></h2>
            <p className="invite-share-copy">함께 예배하고 싶은 분께<br />이 초청장을 전해 주십시오.</p>
            <InviteShare title={title} text={description} url={inviteUrl} />
            <Link className="invite-registration-link" href="/#registration">참가 신청하러 가기 <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
        </section>
      </div>

      <footer className="gathering-footer invite-footer">
        <div className="page-width footer-bottom"><span>{gathering.name}</span><Link href="/">공식 홈 <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
      </footer>
    </div>
  );
}
