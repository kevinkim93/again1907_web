'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { gathering } from '@/lib/gathering';
import './FloatingGatheringActions.css';

const donationAccount = {
  bank: '국민은행',
  number: '752601-04-331363',
  holder: '황금종교회(어게인1907평양대부흥)',
};

export default function FloatingGatheringActions() {
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const scrollStylesRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const dialogId = useId();
  const titleId = `${dialogId}-title`;

  function restoreScroll() {
    if (!scrollStylesRef.current) return;
    document.documentElement.style.overflow = scrollStylesRef.current.html;
    document.body.style.overflow = scrollStylesRef.current.body;
    scrollStylesRef.current = null;
  }

  useEffect(() => () => {
    if (scrollStylesRef.current) {
      document.documentElement.style.overflow = scrollStylesRef.current.html;
      document.body.style.overflow = scrollStylesRef.current.body;
    }
  }, []);

  function openDonation() {
    if (!dialogRef.current || dialogRef.current.open) return;
    setCopyStatus('');
    dialogRef.current.showModal();
    scrollStylesRef.current = {
      html: document.documentElement.style.overflow,
      body: document.body.style.overflow,
    };
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    setIsOpen(true);
  }

  function handleClose() {
    restoreScroll();
    setIsOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  function closeOnBackdrop(event) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      dialogRef.current?.close();
    }
  }

  async function copyAccount() {
    let copied = false;
    try {
      await navigator.clipboard.writeText(donationAccount.number);
      copied = true;
    } catch {
      const activeElement = document.activeElement;
      const field = document.createElement('textarea');
      field.value = donationAccount.number;
      field.readOnly = true;
      field.className = 'donation-copy-field';
      dialogRef.current?.appendChild(field);
      field.select();
      field.setSelectionRange(0, field.value.length);
      try {
        copied = document.execCommand('copy');
      } catch {
        copied = false;
      } finally {
        field.remove();
        activeElement?.focus({ preventScroll: true });
      }
    }
    setCopyStatus(copied ? 'copied' : 'failed');
  }

  return (
    <>
      <nav className="floating-gathering-actions" aria-label="문의 및 참여">
        <button ref={triggerRef} type="button" className="floating-action floating-action-secondary" aria-haspopup="dialog" aria-controls={dialogId} aria-expanded={isOpen} onClick={openDonation}>후원 계좌</button>
        <a className="floating-action floating-action-secondary" href={gathering.contactUrl} target="_blank" rel="noopener noreferrer">스태프 신청<span className="sr-only"> · 카카오톡 (새 탭)</span></a>
        <a className="floating-action floating-action-kakao" href={gathering.contactUrl} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3C8.82 3 3 7.48 3 13c0 3.57 2.44 6.7 6.12 8.47l-1.5 5.5c-.15.54.45.97.92.64l6.64-4.64c.27.02.54.03.82.03 7.18 0 13-4.48 13-10S23.18 3 16 3Z" /></svg>
          <span>문의하기</span><span className="sr-only"> · 카카오톡 (새 탭)</span>
        </a>
      </nav>
      <dialog ref={dialogRef} id={dialogId} className="donation-dialog" aria-labelledby={titleId} onClose={handleClose} onClick={closeOnBackdrop}>
        <div className="donation-dialog-heading">
          <h2 id={titleId}>후원 계좌</h2>
          <button type="button" className="donation-dialog-close" aria-label="후원 계좌 닫기" onClick={() => dialogRef.current?.close()} autoFocus><X size={22} aria-hidden="true" /></button>
        </div>
        <div className="donation-account">
          <p className="donation-bank">{donationAccount.bank}</p>
          <p className="donation-number">{donationAccount.number}</p>
          <p className="donation-holder">예금주 {donationAccount.holder}</p>
        </div>
        <button type="button" className="donation-copy-button" onClick={copyAccount}>
          {copyStatus === 'copied' ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
          {copyStatus === 'copied' ? '복사 완료' : '계좌번호 복사'}
        </button>
        <p className="donation-copy-status" role="status" aria-live="polite">{copyStatus === 'copied' ? '계좌번호를 복사했습니다.' : copyStatus === 'failed' ? '계좌번호를 길게 누르거나 선택하여 복사해 주세요.' : ''}</p>
      </dialog>
    </>
  );
}
