import GatheringDetailPage from '@/components/GatheringDetailPage';
import GatheringSchedule from '@/components/GatheringSchedule';
import { createPageMetadata } from '@/lib/site-metadata';

const path = '/gathering/schedule';

export const metadata = createPageMetadata({
  title: '집회 일정',
  description: '2027년 1월 25일(월)부터 30일(토)까지 오산리기도원에서 열리는 제6차 Again 1907 평양대부흥회 시간표. 예배, 찬양, 설교, 기도 및 폐회 예배 일정을 확인하세요.',
  path,
});

export default function SchedulePage() {
  return (
    <GatheringDetailPage title="일정" path={path} intro="2027년 1월 25일(월)–30일(토) · 오산리기도원">
      <p className="detail-schedule-note">월요일 오후 3시 등록 시작 · 토요일 오전 11시 30분 폐회 예배</p>
      <GatheringSchedule />
    </GatheringDetailPage>
  );
}
