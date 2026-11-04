import GatheringDetailPage from '@/components/GatheringDetailPage';
import GatheringEmbed from '@/components/GatheringEmbed';
import { gathering } from '@/lib/gathering';
import { createPageMetadata } from '@/lib/site-metadata';

const path = '/gathering/registration';

export const metadata = createPageMetadata({
  title: '참가 신청 · 신청 조회',
  description: '2027년 1월 25일–30일 오산리기도원에서 열리는 제6차 Again 1907 평양대부흥회 참가 신청. 신청 내역 조회와 수정도 공식 등록 페이지에서 이용할 수 있습니다.',
  path,
});

export default function RegistrationPage() {
  return (
    <GatheringDetailPage title="참가 신청" path={path} className="detail-registration" intro="제6차 집회 참가 신청과 신청 내역 조회·수정">
      <dl className="detail-facts">
        <dt>일정</dt><dd>2027년 1월 25일(월)–30일(토)</dd>
        <dt>장소</dt><dd>{gathering.venue}</dd>
        <dt>등록</dt><dd>월요일 오후 3시부터</dd>
      </dl>
      <GatheringEmbed />
    </GatheringDetailPage>
  );
}
