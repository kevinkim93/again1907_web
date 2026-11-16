import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import GatheringDetailPage from '@/components/GatheringDetailPage';
import { gathering } from '@/lib/gathering';
import { createPageMetadata } from '@/lib/site-metadata';
import './history.css';

const path = '/history';

export const metadata = createPageMetadata({
  title: '부흥의 역사',
  description: '1903년 원산에서 1907년 평양대부흥, 1909년 백만인 구령운동까지. 말씀과 회개, 기도와 삶의 변화로 이어진 부흥의 역사와 Again1907의 오늘을 만납니다.',
  path,
});

const timeline = [
  {
    date: '1903',
    title: '원산, 회개에서 시작되다',
    text: '원산의 선교사 기도회와 사경회에서 하디(R. A. Hardie) 선교사는 자신의 교만과 잘못을 돌아보며 회개했습니다. 이후 한국인 회중 앞에서 잘못을 고백했고, 이 경험은 교인들의 회개와 화해로 이어졌습니다.',
    sources: [1],
  },
  {
    date: '1906',
    title: '평양, 말씀과 기도로 준비하다',
    text: '평양의 선교사들은 교파를 넘어 사경회에 모여 말씀을 배우고 부흥을 위해 기도했습니다. 하디가 인도한 선교사 사경회와 뒤이은 기도 모임은 이듬해 평양대부흥의 배경이 되었습니다.',
    sources: [2],
  },
  {
    date: '1907. 1',
    title: '장대현교회의 겨울 남자 사경회',
    text: '1907년 1월, 평양 장대현교회에서 겨울 남자 사경회가 열렸습니다. 1월 14일 저녁 집회에서는 공개적인 회개와 기도가 이어졌습니다. 길선주 장로를 비롯한 신자들의 죄 고백은 평양대부흥을 상징하는 장면으로 기억됩니다.',
    sources: [3, 4],
  },
  {
    date: '1907',
    title: '평양에서 전국으로',
    text: '사경회에 참여한 이들과 부흥 집회를 인도한 목회자들을 통해 회개와 기도의 열기가 여러 지역의 교회로 퍼져 나갔습니다. 길선주도 각지를 다니며 말씀을 전했고, 부흥운동은 교파와 지역의 경계를 넘어 확산되었습니다.',
    sources: [3],
  },
  {
    date: '1907. 9',
    title: '독노회 조직과 한국인 목사 안수',
    text: '같은 해 9월, 한국 장로교의 독노회가 조직되었습니다. 길선주를 비롯한 한국 장로교 최초의 목사 7인이 안수를 받으며, 한국인 목회자들이 교회를 이끌어 갈 중요한 토대가 마련되었습니다.',
    sources: [2],
  },
  {
    date: '1909',
    title: '백만인 구령운동으로 이어지다',
    text: '백만 명의 신자를 얻겠다는 목표 아래 교파를 초월한 전도운동이 시작되었습니다. 교회들은 연합기도회와 방문 전도, 복음서 보급에 힘을 모았습니다.',
    sources: [5],
  },
];

const characteristics = [
  { title: '말씀', subtitle: '함께 성경을 배우다', text: '사경회는 성경을 함께 읽고 배우는 자리였습니다. 말씀 앞에서 자신의 믿음과 생활을 살피는 일이 부흥운동의 바탕에 있었습니다.', source: 3 },
  { title: '회개', subtitle: '자신의 잘못을 고백하다', text: '선교사와 한국인 신자들은 각자의 죄를 인정하고 용서를 구했습니다. 공개적인 고백은 서로의 관계를 돌아보고 화해하는 계기가 되었습니다.', source: 1 },
  { title: '기도', subtitle: '함께 하나님께 나아가다', text: '말씀을 듣고 함께 기도하는 모임이 이어졌습니다. 이 시기의 부흥운동은 한국교회의 새벽기도와 통성기도 전통이 자리 잡는 데 영향을 주었습니다.', source: 1 },
  { title: '삶의 변화', subtitle: '일상에서 회개의 열매를 맺다', text: '잘못 취한 것을 돌려주고, 미워하던 이웃과 화해하는 실천이 나타났습니다. 신앙의 고백은 정직과 책임, 용서라는 생활의 변화로 이어졌습니다.', source: 1 },
];

const references = [
  { title: '한국민족문화대백과사전 · 원산부흥운동', href: 'https://encykorea.aks.ac.kr/Article/E0076578' },
  { title: '대한예수교장로회총회 · 한국장로교회의 시작', href: 'https://new.pck.or.kr/bbs/board.php?bo_table=SM01_02&wr_id=1' },
  { title: '한국민족문화대백과사전 · 1907년 대부흥운동', href: 'https://encykorea.aks.ac.kr/Article/E0076237' },
  { title: '김영한 · 1907년 한국교회의 영적 대각성운동이 갖는 성격 (PDF)', href: 'https://human.ssu.ac.kr/wp-content/uploads/sites/78/2020/08/37집2007_5_김영한_1907년-한국교회의-영적-대각성운동이-갖는-성격.pdf' },
  { title: '한국민족문화대백과사전 · 백만명 구령운동', href: 'https://encykorea.aks.ac.kr/Article/E0076756' },
];

function SourceLinks({ numbers }) {
  return <span className="history-citations">{numbers.map((number) => (
    <a key={number} href={`#history-source-${number}`} aria-label={`참고 자료 ${number}: ${references[number - 1].title}`}>[{number}]</a>
  ))}</span>;
}

export default function HistoryPage() {
  return (
    <GatheringDetailPage
      title="부흥의 역사"
      path={path}
      edition="1907 평양대부흥 · Again1907"
      intro="말씀 앞에 자신을 돌아보고, 함께 기도하며 삶으로 응답했던 사람들. 원산과 평양에서 이어진 부흥의 발자취를 돌아봅니다."
      className="history-page"
      showFloatingActions={false}
    >
      <section className="history-section" aria-labelledby="history-timeline-title">
        <div className="history-section-heading">
          <p className="history-kicker">1903 — 1909</p>
          <h2 id="history-timeline-title">부흥의 발자취</h2>
        </div>
        <ol className="history-timeline">
          {timeline.map(({ date, title, text, sources }) => (
            <li key={date}>
              <p className="history-date">{date}</p>
              <div className="history-timeline-copy">
                <h3>{title}</h3>
                <p>{text}<SourceLinks numbers={sources} /></p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="history-section" aria-labelledby="history-characteristics-title">
        <div className="history-section-heading">
          <p className="history-kicker">부흥이 남긴 신앙의 모습</p>
          <h2 id="history-characteristics-title">말씀에서 삶으로</h2>
        </div>
        <div className="history-characteristics">
          {characteristics.map(({ title, subtitle, text, source }) => (
            <div className="history-characteristic" key={title}>
              <h3>{title}</h3>
              <p className="history-characteristic-subtitle">{subtitle}</p>
              <p>{text}<SourceLinks numbers={[source]} /></p>
            </div>
          ))}
        </div>
      </section>

      <section className="history-section history-today" aria-labelledby="history-today-title">
        <div className="history-section-heading">
          <p className="history-kicker">Again1907</p>
          <h2 id="history-today-title">오늘, 다시 함께 기도하며</h2>
        </div>
        <div className="history-today-copy">
          <p>1907년의 역사는 오늘의 우리에게도 질문을 건넵니다. 말씀 앞에서 자신을 돌아보고, 회개를 일상의 변화로 이어 가고 있는지 묻게 합니다.</p>
          <p>Again1907 평양대부흥회는 그 역사를 기억하며 함께 말씀을 듣고 기도하는 자리입니다. 앞선 집회들을 이어, 이제 제6차 집회를 준비하고 있습니다.</p>
          <p>이번 집회에는 예배와 말씀, 기도와 간증, 하나무브먼트의 뮤지컬 ‘평양의 그날, 우리의 그날’이 마련되어 있습니다. 그날의 부흥을 돌아보며 오늘의 믿음과 삶을 함께 세워 가기를 소망합니다.</p>
          <Link className="text-link" href="/gathering/schedule">제6차 집회 일정 <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="history-invitation" aria-labelledby="history-invitation-title">
        <div>
          <p className="history-kicker">제6차 Again1907 평양대부흥회</p>
          <h2 id="history-invitation-title">함께 기도하는 자리에 초청합니다</h2>
          <p className="history-invitation-facts"><span>2027년 1월 25일(월)–30일(토)</span><span aria-hidden="true"> · </span><span>{gathering.venue}</span></p>
        </div>
        <Link className="button button-light" href="/invite">제6차 집회 초청장 <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </section>

      <section className="history-sources" aria-labelledby="history-sources-title">
        <h2 id="history-sources-title">참고 자료</h2>
        <ol>
          {references.map(({ title, href }, index) => (
            <li key={href} id={`history-source-${index + 1}`}>
              <a href={href} target="_blank" rel="noopener noreferrer">{title}<span className="sr-only"> (새 탭)</span></a>
            </li>
          ))}
        </ol>
      </section>
    </GatheringDetailPage>
  );
}
