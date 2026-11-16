'use client';

import { useId, useRef, useState } from 'react';
import { Share2 } from 'lucide-react';

// Older in-app browsers may expose neither Clipboard API nor clipboard permission.
function copyWithSelection(value) {
  const previouslyFocused = document.activeElement;
  const selection = window.getSelection();
  const ranges = selection
    ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index).cloneRange())
    : [];
  const input = document.createElement('textarea');
  input.value = value;
  input.readOnly = true;
  input.tabIndex = -1;
  input.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;';
  document.body.appendChild(input);

  try {
    input.focus({ preventScroll: true });
    input.select();
    input.setSelectionRange(0, value.length);
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    input.remove();
    previouslyFocused?.focus?.({ preventScroll: true });
    if (selection) {
      selection.removeAllRanges();
      ranges.forEach((range) => selection.addRange(range));
    }
  }
}

export default function InviteShare({ title, text, url }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [showManualCopy, setShowManualCopy] = useState(false);
  const sharing = useRef(false);
  const statusId = useId();
  const inputId = useId();

  async function copyLink() {
    let copied = false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        copied = true;
      } catch {
        // Clipboard permission can be denied even when the API is available.
      }
    }

    if (!copied) copied = copyWithSelection(url);

    setShowManualCopy(!copied);
    setStatus(copied
      ? '초청장 링크를 복사했습니다. 카카오톡이나 문자에 붙여넣어 전해 주십시오.'
      : '자동 복사가 어렵습니다. 아래 링크를 길게 눌러 복사해 주십시오.');
  }

  async function handleShare() {
    if (sharing.current) return;
    sharing.current = true;
    setBusy(true);
    setStatus('');
    setShowManualCopy(false);

    try {
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ title, text, url });
          return;
        } catch (error) {
          // Dismissing the share sheet is intentional; do not copy unexpectedly.
          if (error?.name === 'AbortError') return;
        }
      }

      await copyLink();
    } finally {
      sharing.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="invite-share-actions">
      <button
        type="button"
        className="button button-outline"
        onClick={handleShare}
        disabled={busy}
        aria-busy={busy}
        aria-describedby={status ? statusId : undefined}
      >
        공유하기 <Share2 size={19} aria-hidden="true" />
      </button>
      <p className="invite-share-status" id={statusId} role="status" aria-live="polite" aria-atomic="true">
        {status}
      </p>
      {showManualCopy && (
        <div className="invite-share-manual">
          <label htmlFor={inputId}>초청장 링크</label>
          <input
            id={inputId}
            type="text"
            value={url}
            readOnly
            spellCheck={false}
            onFocus={(event) => event.currentTarget.select()}
          />
        </div>
      )}
    </div>
  );
}
