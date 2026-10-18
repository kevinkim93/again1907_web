import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Download } from 'lucide-react';
import CinematicHero from '@/components/CinematicHero';
import GatheringEmbed from '@/components/GatheringEmbed';
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
            <a href="#poster">포스터</a>
            <a className="nav-register" href="#registration">참가 신청 <ArrowUpRight size={15} aria-hidden="true" /></a>
          </nav>
        </div>
      </header>
      <main>
        <CinematicHero>
          <div className="hero-copy page-width">
            <p className="eyebrow hero-edition">THE 6TH GATHERING <span>2027</span></p>
            <h1 id="gathering-title">
              <span className="hero-english">Again <span>1907</span></span>
              <span className="hero-korean">평양대부흥회</span>
            </h1>
            <p className="hero-invitation">주님의 이름만 높여지는 자리.</p>
            <div className="hero-event">
              <p className="hero-date"><time dateTime="2027-01-25">2027. 01. 25</time><span>—</span><time dateTime="2027-01-30">01. 30</time></p>
              <p className="hero-venue">{gathering.venue}</p>
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
              <p className="eyebrow">A PRAYER FOR REVIVAL</p>
              <p className="invitation-signature" aria-hidden="true">Again.</p>
            </ScrollReveal>
            <ScrollReveal className="invitation-copy" delay={100}>
              <h2 id="invitation-title">다시, 함께<br />주님 앞에.</h2>
              <div className="invitation-description">
                <p>남과 북의 성도들이<br />함께 회개하며 기도합니다.</p>
                <p>복음 통일과 민족의 부흥을 소망하며,<br />제6차 Again 1907 집회에 여러분을 초대합니다.</p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="gathering-details" id="gathering" aria-labelledby="details-title">
          <div className="page-width details-layout">
            <ScrollReveal className="details-heading">
              <p className="eyebrow">THE GATHERING</p>
              <h2 id="details-title">우리의 기도가<br />다시 모이는 곳.</h2>
            </ScrollReveal>
            <div className="event-information">
              <ScrollReveal className="event-information-row">
                <p className="event-label">일정</p>
                <div>
                  <p className="event-year">2027</p>
                  <p className="event-date"><time dateTime="2027-01-25">01. 25</time><span>—</span><time dateTime="2027-01-30">01. 30</time></p>
                  <p className="event-note">1월 25일 월요일부터 30일 토요일까지 · 5박 6일</p>
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

        <section className="poster-section" id="poster" aria-labelledby="poster-title">
          <div className="page-width poster-layout">
            <ScrollReveal className="poster-copy">
              <p className="eyebrow">THE SIXTH GATHERING</p>
              <h2 id="poster-title">이 기도의 자리에<br />당신을 초대합니다.</h2>
              <p className="poster-description">제6차 집회 포스터를 확인하고,<br />함께 기도할 이들에게 전해 주세요.</p>
              <a className="button button-outline" href={gathering.poster} download="Again1907-제6차-포스터.png">포스터 다운로드 <Download size={17} aria-hidden="true" /></a>
            </ScrollReveal>
            <ScrollReveal className="poster-art" delay={100}>
              <figure>
                <a className="poster-image-link" href={gathering.poster} target="_blank" rel="noopener noreferrer" aria-label="제6차 Again 1907 포스터 크게 보기 (새 탭)">
                  <Image src={gathering.poster} alt="제6차 Again 1907 평양대부흥회. 2027년 1월 25일 월요일부터 30일 토요일까지, 오산리기도원." width={1086} height={1448} sizes="(max-width: 760px) 86vw, 520px" className="poster-image" unoptimized />
                </a>
                <figcaption><span>AGAIN 1907 — 2027</span><span>제6차 집회 공식 포스터</span></figcaption>
              </figure>
            </ScrollReveal>
          </div>
        </section>

        <section className="registration-section" id="registration" aria-labelledby="registration-title">
          <div className="page-width">
            <ScrollReveal className="registration-heading">
              <div><p className="eyebrow">JOIN THE PRAYER</p><h2 id="registration-title">함께 기도할<br />당신을 기다립니다.</h2></div>
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
        <div className="page-width footer-bottom"><span>THE 6TH GATHERING · 2027</span><a href="#top">맨 위로 <ArrowUpRight size={13} aria-hidden="true" /></a></div>
      </footer>
    </div>
  );
}
