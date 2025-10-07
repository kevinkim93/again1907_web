'use client';

import { useState } from 'react';

export default function RegistrationForm({ settings, disabled }) {
  const [form, setForm] = useState({
    name: '',
    gender: '',
    dob: '',
    phone: '',
    churchOrRegion: '',
    isPartial: false,
    partialDates: [],
    transport: '',
    discovery: '',
    extraCounts: { adult: 0, minor8plus: 0, minorUnder8: 0 },
    extraAnswers: {},
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('extraAnswers.')) {
      const key = name.split('.')[1];
      setForm(f => ({ ...f, extraAnswers: { ...f.extraAnswers, [key]: value } }));
    } else if (name === 'isPartial') {
      setForm(f => ({ ...f, isPartial: checked, partialDates: checked ? f.partialDates : [] }));
    } else if (name === 'transport') {
      setForm(f => ({ ...f, transport: value }));
    } else if (name.startsWith('extraCounts.')) {
      const key = name.split('.')[1];
      const num = Math.max(0, parseInt(value || '0', 10));
      setForm(f => ({ ...f, extraCounts: { ...f.extraCounts, [key]: num } }));
    } else if (name === 'phone') {
      // 전화번호는 그대로 입력 허용 (하이픈 있어도 되고 없어도 됨)
      setForm(f => ({ ...f, phone: value }));
    } else {
      setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const togglePartialDate = (date) => {
    setForm(f => {
      const has = f.partialDates.includes(date);
      const next = has ? f.partialDates.filter(d => d !== date) : [...f.partialDates, date];
      return { ...f, partialDates: next };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // ✅ 부분참석 검증
    if (form.isPartial && form.partialDates.length === 0) {
      setError('부분참석을 선택하셨다면 최소 1일 이상 날짜를 선택해야 합니다.');
      setSubmitting(false);
      return;
    }

    // ✅ 전화번호 형식 검증
    const phoneDigits = form.phone.replace(/[^\d+]/g, ''); // 숫자와 + 기호만 추출

    // 한국 번호: 010으로 시작하고 총 11자리 (하이픈 제외)
    const isKoreanPhone = /^010/.test(phoneDigits) && phoneDigits.length === 11;
    // 국제 번호: +로 시작 (+ 없이 숫자만으로는 한국번호 11자리만 허용)
    const isInternationalPhone = phoneDigits.startsWith('+') && phoneDigits.length >= 10;

    if (!isKoreanPhone && !isInternationalPhone) {
      setError('올바른 전화번호 형식을 입력해주세요. 한국 번호는 11자리를 모두 입력해주세요. (예: 010-1234-5678)');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setDone(true);
    } catch (err) {
      setError(err.message || '신청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };


  if (disabled) return <p className="text-red-600 text-center">신청이 비활성화되었습니다.</p>;
  if (done) return <p className="text-green-600 text-center">신청이 완료되었습니다. 감사합니다!</p>;

  return (
    <form
      onSubmit={submit}
      className="space-y-6 text-gray-800"
    >
      {/* 이름 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">이름*</label>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          required
          placeholder="이름을 입력하세요"
          className="w-full border border-gray-300 rounded-md p-2 sm:p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* 성별 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">성별*</label>
        <select
          name="gender"
          value={form.gender}
          onChange={onChange}
          required
          className="w-full border border-gray-300 rounded-md p-2 sm:p-3 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">선택</option>
          <option value="남">남</option>
          <option value="여">여</option>
        </select>
      </div>

      {/* 생년월일 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">생년월일*</label>
        <input
          type="date"
          name="dob"
          value={form.dob}
          onChange={onChange}
          required
          className="w-full border border-gray-300 rounded-md p-2 sm:p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* 연락처 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">연락처*</label>
        <input
          name="phone"
          value={form.phone}
          onChange={onChange}
          required
          placeholder="010-1234-5678"
          className="w-full border border-gray-300 rounded-md p-2 sm:p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">한국 번호: 010-1234-5678 또는 01012345678 / 국제 번호도 가능</p>
      </div>

      {/* 소속 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">소속 교회/지역*</label>
        <input
          name="churchOrRegion"
          value={form.churchOrRegion}
          onChange={onChange}
          required
          placeholder="예: 서울 ○○교회 / ○○지역"
          className="w-full border border-gray-300 rounded-md p-2 sm:p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* 부분참석 */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            name="isPartial"
            checked={form.isPartial}
            onChange={onChange}
            className="h-4 w-4"
          />
          부분참석 여부
        </label>

        {form.isPartial && (
          <div className="mt-2 space-y-1">
            {settings.dates?.map(d => (
              <label key={d} className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={form.partialDates.includes(d)}
                  onChange={() => togglePartialDate(d)}
                  className="h-4 w-4"
                />
                {d}
              </label>
            ))}

            {/* ✅ 날짜 선택 에러 메시지 (이 영역 바로 아래)
            {form.isPartial && form.partialDates.length === 0 && error && (
              <p className="text-red-600 text-sm mt-1">
                {error}
              </p>
            )} */}
          </div>
        )}
      </div>


      {/* 교통편 */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">교통편(중복 불가)*</p>
        <div className="flex flex-wrap gap-4">
          {settings.transportOptions?.map(opt => (
            <label key={opt} className="flex items-center gap-2 text-gray-700">
              <input
                type="radio"
                name="transport"
                value={opt}
                checked={form.transport === opt}
                onChange={onChange}
                className="h-4 w-4"
                required
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* 집회를 알게된 경로 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">집회를 알게된 경로*</label>
        <input
          name="discovery"
          value={form.discovery}
          onChange={onChange}
          required
          list="discoveryList"
          className="w-full border border-gray-300 rounded-md p-2 sm:p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <datalist id="discoveryList">
          {(settings.howDidYouHearOptions || []).map(x => (
            <option key={x} value={x} />
          ))}
        </datalist>
      </div>

      {/* 관리자 추가 질문 */}
      {settings.extraQuestions?.map((q, idx) => (
        <div key={q.id || idx}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {q.label}{q.required ? '*' : ''}
          </label>

          {q.type === 'textarea' ? (
            <textarea
              name={`extraAnswers.${q.id || idx}`}
              onChange={onChange}
              required={!!q.required}
              className="w-full border border-gray-300 rounded-md p-2 sm:p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          ) : q.type === 'select' ? (
            <select
              name={`extraAnswers.${q.id || idx}`}
              onChange={onChange}
              required={!!q.required}
              className="w-full border border-gray-300 rounded-md p-2 sm:p-3 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">선택하세요</option>
              {q.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : q.type === 'checkbox' ? (
            <div className="space-y-1">
              {q.options?.map(opt => (
                <label key={opt} className="flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    value={opt}
                    checked={Array.isArray(form.extraAnswers[q.id || idx]) && form.extraAnswers[q.id || idx].includes(opt)}
                    onChange={(e) => {
                      const prev = Array.isArray(form.extraAnswers[q.id || idx])
                        ? [...form.extraAnswers[q.id || idx]]
                        : [];
                      if (e.target.checked) {
                        prev.push(opt);
                      } else {
                        const i = prev.indexOf(opt);
                        if (i > -1) prev.splice(i, 1);
                      }
                      setForm(f => ({
                        ...f,
                        extraAnswers: { ...f.extraAnswers, [q.id || idx]: prev }
                      }));
                    }}
                    className="h-4 w-4"
                    required={!!q.required && (!form.extraAnswers[q.id || idx] || form.extraAnswers[q.id || idx].length === 0)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ) : (
            <input
              name={`extraAnswers.${q.id || idx}`}
              onChange={onChange}
              required={!!q.required}
              className="w-full border border-gray-300 rounded-md p-2 sm:p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          )}
        </div>
      ))}

      {/* 추가 인원 */}
      <fieldset className="border rounded-md p-4">
        <legend className="font-medium text-gray-800">추가 인원*</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          {/* 성인 */}
          <label className="flex items-center flex-col text-sm text-gray-700">
            성인
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setForm(f => ({
                  ...f,
                  extraCounts: {
                    ...f.extraCounts,
                    adult: Math.max(0, f.extraCounts.adult - 1),
                  }
                }))}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >−</button>

              <input
                type="number"
                min="0"
                name="extraCounts.adult"
                value={form.extraCounts.adult}
                onChange={onChange}
                className="w-16 text-center border border-gray-300 rounded-md p-2"
              />

              <button
                type="button"
                onClick={() => setForm(f => ({
                  ...f,
                  extraCounts: {
                    ...f.extraCounts,
                    adult: f.extraCounts.adult + 1,
                  }
                }))}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >+</button>
            </div>
          </label>

          {/* 8세 이상 미성년 */}
          <label className="flex items-center flex-col text-sm text-gray-700">
            8세 이상 미성년
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setForm(f => ({
                  ...f,
                  extraCounts: {
                    ...f.extraCounts,
                    minor8plus: Math.max(0, f.extraCounts.minor8plus - 1),
                  }
                }))}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >−</button>

              <input
                type="number"
                min="0"
                name="extraCounts.minor8plus"
                value={form.extraCounts.minor8plus}
                onChange={onChange}
                className="w-16 text-center border border-gray-300 rounded-md p-2"
              />

              <button
                type="button"
                onClick={() => setForm(f => ({
                  ...f,
                  extraCounts: {
                    ...f.extraCounts,
                    minor8plus: f.extraCounts.minor8plus + 1,
                  }
                }))}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >+</button>
            </div>
          </label>

          {/* 8세 미만 미성년 */}
          <label className="flex items-center flex-col text-sm text-gray-700">
            8세 미만 미성년
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setForm(f => ({
                  ...f,
                  extraCounts: {
                    ...f.extraCounts,
                    minorUnder8: Math.max(0, f.extraCounts.minorUnder8 - 1),
                  }
                }))}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >−</button>

              <input
                type="number"
                min="0"
                name="extraCounts.minorUnder8"
                value={form.extraCounts.minorUnder8}
                onChange={onChange}
                className="w-16 text-center border border-gray-300 rounded-md p-2"
              />

              <button
                type="button"
                onClick={() => setForm(f => ({
                  ...f,
                  extraCounts: {
                    ...f.extraCounts,
                    minorUnder8: f.extraCounts.minorUnder8 + 1,
                  }
                }))}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >+</button>
            </div>
          </label>
        </div>
      </fieldset>


      {/* 에러 메시지 */}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* 제출 버튼 */}
      <button
        disabled={submitting}
        className="w-full bg-blue-600 text-white font-semibold py-2 sm:py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
      >
        {submitting ? '제출 중...' : '신청하기'}
      </button>
    </form>
  );
}
