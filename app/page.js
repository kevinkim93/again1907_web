import Image from 'next/image';
import { ArrowUpRight, Download } from 'lucide-react';
import CinematicHero from '@/components/CinematicHero';
import GatheringEmbed from '@/components/GatheringEmbed';
import GatheringSchedule from '@/components/GatheringSchedule';
import GatheringPageLinks from '@/components/GatheringPageLinks';
import FloatingGatheringActions from '@/components/FloatingGatheringActions';
import ScrollReveal from '@/components/ScrollReveal';
import { gathering } from '@/lib/gathering';
import { gatheringSpeakers } from '@/lib/gathering-schedule';
import StructuredData from '@/components/StructuredData';
import { homeStructuredData } from '@/lib/site-structured-data';

export default function HomePage() {
  return (
    <div className="gathering-page" id="top">
      <StructuredData data={homeStructuredData} id="gathering-structured-data" />
      <a className="skip-link" href="#gathering">본문 바로가기</a>
      <header className="gathering-header">
        <div className="page-width header-inner">
          <a className="wordmark" href="#top" aria-label="Again 1907 처음으로">Again 1907</a>
          <nav aria-label="주요 메뉴">
            <a href="#gathering">장소</a>
            <a href="#schedule">일정</a>
            <a href="#speakers">강사 소개</a>
            <a className="nav-register" href="#registration">참가 신청 <ArrowUpRight size={15} aria-hidden="true" /></a>
            <a className="nav-external" href={gathering.youtubeChannelUrl} target="_blank" rel="noopener noreferrer">YouTube <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a>
          </nav>
        </div>
      </header>
      <main>
        <CinematicHero>
          <div className="hero-layout page-width">
            <div className="hero-copy">
              <p className="hero-edition">제6차</p>
              <h1 id="gathering-title">
                <span className="hero-english">Again <span>1907</span></span>
                <span className="hero-korean">평양대<span>부흥회</span></span>
              </h1>
              <div className="hero-event">
                <p className="hero-date"><time dateTime="2027-01-25">2027. 01. 25 <small>월</small></time><span>—</span><time dateTime="2027-01-30">01. 30 <small>토</small></time></p>
                <p className="hero-venue">{gathering.venue}</p>
                <p className="hero-time-note">월요일 오후 3시 등록 시작</p>
              </div>
              <a className="button button-light" href="#registration">참가 신청 <ArrowUpRight size={19} aria-hidden="true" /></a>
            </div>
          </div>
        </CinematicHero>

        <section className="gathering-theme" aria-labelledby="gathering-theme-title">
          <div className="theme-copy">
            <h2 id="gathering-theme-title">
              <span>주님이 역사하시는</span>{' '}
              <span>초자연적 부흥집회</span>
            </h2>
            <p className="theme-scripture-reference">주제말씀 · 호세아 6:1</p>
            <blockquote className="theme-scripture">
              <p>오라 우리가 여호와께로 돌아가자.</p>
              <p>여호와께서 우리를 찢으셨으나 도로 낫게 하실 것이요.</p>
              <p>우리를 치셨으나 싸매어 주실 것임이라.</p>
            </blockquote>
          </div>
        </section>

        <section className="gathering-details" id="gathering" aria-labelledby="details-title">
          <ScrollReveal className="page-width details-layout">
            <div className="details-heading"><h2 id="details-title">장소</h2></div>
            <div className="event-information">
              <h3 className="event-venue">{gathering.venue}</h3>
              <p className="event-note">{gathering.address}</p>
              <div className="venue-links">
                <a className="text-link" href={gathering.venueBusUrl} target="_blank" rel="noopener noreferrer">기도원 버스 <ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> · 운행시간 안내 (새 탭)</span></a>
                <a className="text-link" href={gathering.mapUrl} target="_blank" rel="noopener noreferrer">카카오맵 <ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a>
              </div>
              <iframe className="venue-map" src="/osanri-map.html" title="오산리기도원 위치 · 카카오맵" loading="lazy" />
            </div>
          </ScrollReveal>
        </section>

        <section className="schedule-section" id="schedule" aria-labelledby="schedule-title">
          <div className="page-width schedule-layout">
            <ScrollReveal className="section-heading schedule-heading">
              <h2 id="schedule-title">일정</h2>
            </ScrollReveal>
            <GatheringSchedule />
          </div>
        </section>

        <section className="speakers-section" id="speakers" aria-labelledby="speakers-title">
          <div className="page-width speakers-layout">
            <ScrollReveal className="section-heading"><h2 id="speakers-title">강사 소개</h2></ScrollReveal>
            <ul className="speaker-list">
              {gatheringSpeakers.map(({ name, affiliation }, index) => (
                <ScrollReveal as="li" key={name} delay={(index % 2) * 60}>
                  <h3>{name}</h3>
                  <p>{affiliation}</p>
                </ScrollReveal>
              ))}
            </ul>
          </div>
        </section>

        <section className="films-section" aria-labelledby="invitation-title">
          <ScrollReveal className="page-width films-layout">
            <div className="section-heading"><h2 id="invitation-title">초청 영상</h2></div>
            <iframe className="promo-player" src={gathering.promoEmbedUrl}
              title="내래티비 · 제6차 Again 1907 평양대부흥회 초청 영상"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin" loading="lazy" allowFullScreen />
          </ScrollReveal>
        </section>

        <section className="poster-section" id="poster" aria-labelledby="poster-title">
          <div className="page-width poster-layout">
            <ScrollReveal className="poster-copy">
              <h2 id="poster-title">포스터</h2>
              <a className="button button-outline" href={gathering.poster} download="Again1907-제6차-포스터.webp">포스터 다운로드 <Download size={17} aria-hidden="true" /></a>
              <a className="theme-download" href="/images/again1907-theme.webp" download="Again1907-제6차-주제.webp">주제 아트워크 다운로드 <Download size={17} aria-hidden="true" /></a>
            </ScrollReveal>
            <ScrollReveal className="poster-art" delay={80}>
              <figure>
                <a className="poster-image-link" href={gathering.poster} target="_blank" rel="noopener noreferrer" aria-label="제6차 Again 1907 포스터 크게 보기 (새 탭)">
                  <Image src={gathering.poster} alt="제6차 Again 1907 평양대부흥회. 2027년 1월 25일 월요일부터 30일 토요일까지, 오산리기도원." width={1080} height={1350} sizes="(max-width: 760px) 86vw, 520px" className="poster-image" unoptimized />
                </a>
              </figure>
            </ScrollReveal>
          </div>
        </section>

        <section className="registration-section" id="registration" aria-labelledby="registration-title">
          <div className="page-width">
            <ScrollReveal className="registration-heading">
              <h2 id="registration-title">참가 신청</h2>
            </ScrollReveal>
            <GatheringEmbed />
          </div>
        </section>
      </main>

      <footer className="gathering-footer">
        <div className="page-width footer-main">
          <a className="footer-brand" href="#top"><span className="wordmark">Again1907</span><span className="footer-brand-title">평양대부흥회</span></a>
          <a className="footer-contact" href={gathering.contactUrl} target="_blank" rel="noopener noreferrer">카카오톡 문의 <ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a>
        </div>
        <GatheringPageLinks />
        <div className="page-width footer-bottom"><span>2027년 제6차 평양대부흥회</span><a href="#top">맨 위로 <ArrowUpRight size={13} aria-hidden="true" /></a></div>
      </footer>
      <FloatingGatheringActions />
    </div>
  );
}
