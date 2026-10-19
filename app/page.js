import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Download } from 'lucide-react';
import CinematicHero from '@/components/CinematicHero';
import GatheringEmbed from '@/components/GatheringEmbed';
import GatheringSchedule from '@/components/GatheringSchedule';
import MotionFilm from '@/components/MotionFilm';
import { gathering } from '@/lib/gathering';

export default function HomePage() {
  return (
    <div className="gathering-page" id="top">
      <a className="skip-link" href="#gathering">본문 바로가기</a>
      <header className="gathering-header">
        <div className="page-width header-inner">
          <a className="wordmark" href="#top" aria-label="Again 1907 처음으로">Again 1907</a>
          <nav aria-label="주요 메뉴">
            <a href="#gathering">장소</a>
            <a href="#schedule">일정</a>
            <a href="#speakers">강사 소개</a>
            <a className="nav-register" href="#registration">참가 신청 <ArrowUpRight size={15} aria-hidden="true" /></a>
            <a className="nav-external" href={gathering.youtubeChannelUrl} target="_blank" rel="noopener noreferrer">내래티비 <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a>
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
            <section className="hero-promo" aria-label="제6차 집회 초청 영상">
              <iframe
                className="promo-player"
                src={gathering.promoEmbedUrl}
                title="내래티비 · 제6차 Again 1907 평양대부흥회 초청 영상"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
              <a className="promo-external" href={gathering.promoVideoUrl} target="_blank" rel="noopener noreferrer">YouTube에서 보기 <ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a>
            </section>
          </div>
          <div className="hero-bottom page-width">
            <a className="hero-scroll" href="#schedule"><ArrowDown size={17} aria-hidden="true" /><span>일정</span></a>
          </div>
        </CinematicHero>

        <section className="gathering-details" id="gathering" aria-labelledby="details-title">
          <div className="page-width details-layout">
            <div className="details-heading"><h2 id="details-title">장소</h2></div>
            <div className="event-information">
              <h3 className="event-venue">{gathering.venue}</h3>
              <p className="event-note">{gathering.address}</p>
              <a className="text-link" href={gathering.mapUrl} target="_blank" rel="noopener noreferrer">오시는 길 <ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a>
            </div>
          </div>
        </section>

        <section className="schedule-section" id="schedule" aria-labelledby="schedule-title">
          <div className="page-width schedule-layout">
            <div className="section-heading schedule-heading">
              <h2 id="schedule-title">일정</h2>
              <span className="schedule-status">예정안 · 변경 가능</span>
            </div>
            <GatheringSchedule />
          </div>
        </section>

        <section className="speakers-section" id="speakers" aria-labelledby="speakers-title">
          <div className="page-width speakers-layout">
            <div className="section-heading"><h2 id="speakers-title">강사 소개</h2></div>
            <p className="speakers-coming">추후 안내</p>
          </div>
        </section>

        <section className="films-section" aria-label="집회 영상">
          <div className="page-width films-layout">
            <MotionFilm src="/videos/again1907-6th-motion.mp4" poster="/images/again1907-6th-motion.jpg" label="기도" className="gathering-film" />
            <MotionFilm src="/videos/again1907-pentecost.mp4" poster="/images/again1907-pentecost.jpg" label="오순절 성령 강림" className="gathering-film" />
          </div>
        </section>

        <section className="poster-section" id="poster" aria-labelledby="poster-title">
          <div className="page-width poster-layout">
            <div className="poster-copy">
              <h2 id="poster-title">포스터</h2>
              <a className="button button-outline" href={gathering.poster} download="Again1907-제6차-포스터.png">포스터 다운로드 <Download size={17} aria-hidden="true" /></a>
            </div>
            <div className="poster-art">
              <figure>
                <a className="poster-image-link" href={gathering.poster} target="_blank" rel="noopener noreferrer" aria-label="제6차 Again 1907 포스터 크게 보기 (새 탭)">
                  <Image src={gathering.poster} alt="제6차 Again 1907 평양대부흥회. 2027년 1월 25일 월요일부터 30일 토요일까지, 오산리기도원." width={1086} height={1448} sizes="(max-width: 760px) 86vw, 520px" className="poster-image" unoptimized />
                </a>
              </figure>
            </div>
          </div>
        </section>

        <section className="registration-section" id="registration" aria-labelledby="registration-title">
          <div className="page-width">
            <div className="registration-heading">
              <h2 id="registration-title">참가 신청</h2>
            </div>
            <GatheringEmbed />
          </div>
        </section>
      </main>

      <footer className="gathering-footer">
        <div className="page-width footer-main">
          <a className="wordmark" href="#top">Again 1907</a>
          <a className="footer-contact" href={gathering.contactUrl} target="_blank" rel="noopener noreferrer">카카오톡 문의 <ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a>
        </div>
        <div className="page-width footer-bottom"><span>2027년 제6차 평양대부흥회</span><a href="#top">맨 위로 <ArrowUpRight size={13} aria-hidden="true" /></a></div>
      </footer>
    </div>
  );
}
