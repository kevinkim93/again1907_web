'use client';

import { ArrowUpRight } from 'lucide-react';
import { gathering } from '@/lib/gathering';

export default function GatheringEmbed() {
  return (
    <div className="gathering-embed">
      <div className="embed-toolbar">
        <p className="embed-status">참가 신청 · 조회·수정</p>
        <a
          className="embed-external-link"
          href={gathering.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          새 창에서 신청하기
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>

      <iframe
        className="registration-frame"
        src={gathering.registrationUrl}
        title="Again 1907 제6차 집회 참가 신청 및 신청 조회·수정"
        loading="lazy"
      />

      <p className="embed-help">
        신청 화면이 보이지 않거나 입력이 어려우면 위의 ‘새 창에서 신청하기’를
        눌러 주세요.
      </p>
    </div>
  );
}
