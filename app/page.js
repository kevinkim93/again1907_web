import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Download } from 'lucide-react';
import CinematicHero from '@/components/CinematicHero';
import GatheringEmbed from '@/components/GatheringEmbed';
import MotionFilm from '@/components/MotionFilm';
import ScrollReveal from '@/components/ScrollReveal';
import { gathering } from '@/lib/gathering';

export default function HomePage() {
  return (
    <div className="gathering-page" id="top">
      <a className="skip-link" href="#invitation">본문 바로가기</a>
      <header className="gathering-header">
        <div className="page-width header-inner">
          <a className="wordmark" href="#top" aria-label="Again 1907 처음으로">Again 1907</a>
          <nav aria-label="주요 메뉴">
            <a href="#gathering">집회 안내</a>
            <a href="#schedule">시간표</a>
            <a href="#speakers">강사 소개</a>
            <a className="nav-register" href="#registration">참가 신청 <ArrowUpRight size={15} aria-hidden="true" /></a>
          </nav>
        </div>
      </header>
      <main>
        <CinematicHero>
          <div className="hero-copy page-width">
            <p className="eyebrow hero-edition">제6차 <span>2027</span></p>
            <p className="hero-invitation">주님의 이름만 높여지는</p>
            <h1 id="gathering-title">
              <span className="hero-english">Again <span>1907</span></span>
              <span className="hero-korean">평양대<span>부흥회</span></span>
            </h1>
            <div className="hero-event">
              <p className="hero-date"><time dateTime="2027-01-25">2027. 01. 25 <small>월</small></time><span>—</span><time dateTime="2027-01-30">01. 30 <small>토</small></time></p>
              <p className="hero-venue">{gathering.venue}</p>
              <p className="hero-time-note">월요일 오후부터 토요일 점심까지</p>
            </div>
            <a className="button button-light" href="#registration">제6차 집회 신청하기 <ArrowUpRight size={19} aria-hidden="true" /></a>
          </div>
          <div className="hero-bottom page-width">
            <a className="hero-scroll" href="#invitation"><ArrowDown size={17} aria-hidden="true" /><span>함께 드리는 기도</span></a>
          </div>
        </CinematicHero>

        <section className="invitation-section" id="invitation" aria-labelledby="invitation-title">
          <div className="page-width invitation-layout">
            <ScrollReveal className="invitation-aside">
              <p className="eyebrow">초대의 말씀</p>
              <h2 id="invitation-title">다시, 함께<br />주님 앞에.</h2>
            </ScrollReveal>
            <ScrollReveal className="invitation-copy" delay={100}>
              <div className="invitation-description">
                <p>남과 북의 성도들이<br />함께 회개하며 기도합니다.</p>
                <p>복음 통일과 민족의 부흥을 소망하며,<br />제6차 Again 1907 집회에 여러분을 초대합니다.</p>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal className="page-width invitation-film-wrap">
            <MotionFilm src="/videos/again1907-6th-motion.mp4" poster="/images/again1907-6th-motion.jpg" label="기도의 움직임" className="invitation-film" />
            <p className="film-caption">한마음으로, 다시 기도의 자리로.</p>
          </ScrollReveal>
        </section>

        <section className="gathering-details" id="gathering" aria-labelledby="details-title">
          <div className="page-width details-layout">
            <ScrollReveal className="details-heading">
              <p className="eyebrow">집회 안내</p>
              <h2 id="details-title">우리의 기도가<br />다시 모이는 곳.</h2>
            </ScrollReveal>
            <div className="event-information">
              <ScrollReveal className="event-information-row">
                <p className="event-label">일정</p>
                <div>
                  <p className="event-year">2027</p>
                  <p className="event-date"><time dateTime="2027-01-25">01. 25</time><span>—</span><time dateTime="2027-01-30">01. 30</time></p>
                  <p className="event-note">1월 25일 월요일 오후부터 30일 토요일 점심까지 · 5박 6일</p>
                </div>
              </ScrollReveal>
              <ScrollReveal className="event-information-row" delay={80}>
                <p className="event-label">장소</p>
                <div>
                  <h3 className="event-venue">{gathering.venue}</h3>
                  <p className="event-note">{gathering.address}</p>
                  <a className="text-link" href={gathering.mapUrl} target="_blank" rel="noopener noreferrer">지도에서 위치 보기 <ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="schedule-section" id="schedule" aria-labelledby="schedule-title">
          <div className="page-width schedule-layout">
            <ScrollReveal className="section-heading">
              <p className="eyebrow">시간표</p>
              <h2 id="schedule-title">함께하는<br />5박 6일.</h2>
              <p className="section-description">월요일 오후에 시작해<br />토요일 점심까지 함께합니다.</p>
            </ScrollReveal>
            <ScrollReveal className="schedule-content" delay={80}>
              <ol className="schedule-list" aria-label="집회 일정">
                <li>
                  <div className="schedule-date"><time dateTime="2027-01-25">01. 25</time><span>월요일</span></div>
                  <div className="schedule-session"><h3>오후, 집회 시작</h3><p>첫날 오후부터 함께합니다.</p></div>
                </li>
                <li>
                  <div className="schedule-date"><span>01. 26 — 29</span><span>화요일 — 금요일</span></div>
                  <div className="schedule-session"><h3>집회 기간</h3><p>세부 시간표는 추후 안내합니다.</p></div>
                </li>
                <li>
                  <div className="schedule-date"><time dateTime="2027-01-30">01. 30</time><span>토요일</span></div>
                  <div className="schedule-session"><h3>점심, 집회 마침</h3><p>토요일 점심까지 진행됩니다.</p></div>
                </li>
              </ol>
              <p className="schedule-notice">세부 일정과 정확한 시작·종료 시각은 아직 미정입니다.<br />확정되는 대로 이곳에 안내하겠습니다.</p>
            </ScrollReveal>
          </div>
        </section>

        <section className="pentecost-section" aria-labelledby="pentecost-title">
          <div className="page-width">
            <ScrollReveal className="pentecost-heading">
              <div><p className="eyebrow">성령의 임재</p><h2 id="pentecost-title">오순절,<br />함께 모인 자리.</h2></div>
              <p>사도행전 2:1–4에서 영감을 받은 장면</p>
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <MotionFilm src="/videos/again1907-pentecost.mp4" poster="/images/again1907-pentecost.jpg" label="오순절 성령 강림" className="pentecost-film" />
            </ScrollReveal>
          </div>
        </section>

        <section className="speakers-section" id="speakers" aria-labelledby="speakers-title">
          <div className="page-width speakers-layout">
            <ScrollReveal className="section-heading">
              <p className="eyebrow">강사 소개</p>
              <h2 id="speakers-title">말씀을 전할<br />강사님들</h2>
            </ScrollReveal>
            <ScrollReveal className="speakers-announcement" delay={80}>
              <p className="speakers-coming">추후 안내</p>
              <p>제6차 집회의 강사 명단과 소개는<br />확정되는 대로 안내하겠습니다.</p>
            </ScrollReveal>
          </div>
        </section>

        <section className="poster-section" id="poster" aria-labelledby="poster-title">
          <div className="page-width poster-layout">
            <ScrollReveal className="poster-copy">
              <p className="eyebrow">집회 포스터</p>
              <h2 id="poster-title">이 기도의 자리에<br />당신을 초대합니다.</h2>
              <p className="poster-description">제6차 집회 포스터를 확인하고,<br />함께 기도할 이들에게 전해 주세요.</p>
              <a className="button button-outline" href={gathering.poster} download="Again1907-제6차-포스터.png">포스터 다운로드 <Download size={17} aria-hidden="true" /></a>
            </ScrollReveal>
            <ScrollReveal className="poster-art" delay={100}>
              <figure>
                <a className="poster-image-link" href={gathering.poster} target="_blank" rel="noopener noreferrer" aria-label="제6차 Again 1907 포스터 크게 보기 (새 탭)">
                  <Image src={gathering.poster} alt="제6차 Again 1907 평양대부흥회. 2027년 1월 25일 월요일부터 30일 토요일까지, 오산리기도원." width={1086} height={1448} sizes="(max-width: 760px) 86vw, 520px" className="poster-image" unoptimized />
                </a>
                <figcaption><span>2027년 제6차</span><span>평양대부흥회 공식 포스터</span></figcaption>
              </figure>
            </ScrollReveal>
          </div>
        </section>

        <section className="registration-section" id="registration" aria-labelledby="registration-title">
          <div className="page-width">
            <ScrollReveal className="registration-heading">
              <div><p className="eyebrow">참가 신청</p><h2 id="registration-title">함께 기도할<br />성도님들을 초대합니다.</h2></div>
              <p>아래에서 참가를 신청하거나<br />이미 신청한 내역을 조회·수정하세요.</p>
            </ScrollReveal>
            <GatheringEmbed />
          </div>
        </section>
      </main>

      <footer className="gathering-footer">
        <div className="page-width footer-main">
          <div><a className="wordmark" href="#top">Again 1907</a><p>주님의 이름만 높여지는 평양대부흥회</p></div>
          <a className="footer-contact" href={gathering.contactUrl} target="_blank" rel="noopener noreferrer">카카오톡으로 문의하기 <ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a>
        </div>
        <div className="page-width footer-bottom"><span>2027년 제6차 평양대부흥회</span><a href="#top">맨 위로 <ArrowUpRight size={13} aria-hidden="true" /></a></div>
      </footer>
    </div>
  );
}
