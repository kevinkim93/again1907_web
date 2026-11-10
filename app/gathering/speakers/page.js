import Image from 'next/image';
import GatheringDetailPage from '@/components/GatheringDetailPage';
import { gatheringSpeakers } from '@/lib/gathering-schedule';
import { createPageMetadata } from '@/lib/site-metadata';

const path = '/gathering/speakers';

export const metadata = createPageMetadata({
  title: '강사 소개',
  description: '제6차 Again 1907 평양대부흥회 강사와 소속 교회 안내. 2027년 1월 25일–30일 오산리기도원에서 열리는 집회의 강사 명단을 확인하세요.',
  path,
});

export default function SpeakersPage() {
  return (
    <GatheringDetailPage title="강사 소개" path={path} intro="2027년 1월 25일(월)–30일(토) · 오산리기도원">
      <ul className="speaker-list detail-speakers">
        {gatheringSpeakers.map(({ name, affiliation, photo }) => (
          <li key={name} className={photo ? "speaker-with-photo" : undefined}>{photo && <Image src={photo} alt={`${name} 프로필 사진`} width={128} height={144} className="speaker-photo" unoptimized />}<div className="speaker-description"><h2>{name}</h2><p>{affiliation}</p></div></li>
        ))}
      </ul>
    </GatheringDetailPage>
  );
}
