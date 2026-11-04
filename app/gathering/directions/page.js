import { ArrowUpRight } from 'lucide-react';
import GatheringDetailPage from '@/components/GatheringDetailPage';
import { gathering } from '@/lib/gathering';
import { createPageMetadata } from '@/lib/site-metadata';

const path = '/gathering/directions';

export const metadata = createPageMetadata({
  title: '오시는 길 · 기도원 버스',
  description: '제6차 Again 1907 평양대부흥회 장소인 오산리기도원 오시는 길. 경기도 파주시 조리읍 등원로391번길 42, 카카오맵 위치와 기도원 버스 운행시간을 안내합니다.',
  path,
});

export default function DirectionsPage() {
  return (
    <GatheringDetailPage title="오시는 길" path={path} intro="2027년 1월 25일(월)–30일(토) · 오산리기도원">
      <dl className="detail-facts">
        <dt>장소</dt><dd>{gathering.venue}</dd>
        <dt>주소</dt><dd>{gathering.address}</dd>
      </dl>
      <div className="event-information">
        <div className="venue-links">
          <a className="text-link" href={gathering.venueBusUrl} target="_blank" rel="noopener noreferrer">기도원 버스 <ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> · 운행시간 안내 (새 탭)</span></a>
          <a className="text-link" href={gathering.mapUrl} target="_blank" rel="noopener noreferrer">카카오맵 <ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a>
        </div>
        <iframe className="venue-map" src="/osanri-map.html" title="오산리기도원 위치 · 카카오맵" loading="lazy" />
      </div>
    </GatheringDetailPage>
  );
}
