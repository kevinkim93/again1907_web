'use client';

import { useState, useMemo } from 'react';

export default function RegistrationForm({ settings, disabled }) {
  const [form, setForm] = useState({
    name: '',
    gender: '',
    dobYear: '',
    dobMonth: '',
    dobDay: '',
    phone: '',
    churchOrRegion: '',
    attendDates: [], // 참석 날짜
    accommodationDates: [], // 숙박 날짜
    roomType: '', // 단체실 또는 2인실
    skipBreakfast: false, // 아침 식사 안함
    transport: '',
    discovery: '',
    extraCounts: { adult: 0, minor7to18: 0, minorUnder7: 0 },
    extraAnswers: {},
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // 생년월일 드롭다운 옵션
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // 전체 참석 여부 확인
  const isFullAttendance = useMemo(() => {
    if (!settings.dates || settings.dates.length === 0) return false;
    return settings.dates.every(d => form.attendDates.includes(d));
  }, [form.attendDates, settings.dates]);

  // 숙박 가능 날짜 (마지막 날 제외)
  const accommodationAvailableDates = useMemo(() => {
    if (!settings.dates || settings.dates.length === 0) return [];
    return settings.dates.slice(0, -1);
  }, [settings.dates]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('extraAnswers.')) {
      const key = name.split('.')[1];
      setForm(f => ({ ...f, extraAnswers: { ...f.extraAnswers, [key]: value } }));
    } else if (name === 'transport') {
      setForm(f => ({ ...f, transport: value }));
    } else if (name.startsWith('extraCounts.')) {
      const key = name.split('.')[1];
      const num = Math.max(0, parseInt(value || '0', 10));
      setForm(f => ({ ...f, extraCounts: { ...f.extraCounts, [key]: num } }));
    } else if (name === 'phone') {
      setForm(f => ({ ...f, phone: value }));
    } else {
      setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  // 전체 참석 토글
  const toggleFullAttendance = () => {
    if (isFullAttendance) {
      // 전체 해제
      setForm(f => ({ ...f, attendDates: [] }));
    } else {
      // 전체 선택
      setForm(f => ({ ...f, attendDates: [...(settings.dates || [])] }));
    }
  };

  // 참석 날짜 토글
  const toggleAttendDate = (date) => {
    setForm(f => {
      const has = f.attendDates.includes(date);
      const next = has ? f.attendDates.filter(d => d !== date) : [...f.attendDates, date];
      return { ...f, attendDates: next };
    });
  };

  // 숙박 날짜 토글
  const toggleAccommodationDate = (date) => {
    setForm(f => {
      const has = f.accommodationDates.includes(date);
      const next = has ? f.accommodationDates.filter(d => d !== date) : [...f.accommodationDates, date];
      return { ...f, accommodationDates: next };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // 날짜 검증
    if (form.attendDates.length === 0) {
      setError('최소 1일 이상 참석 날짜를 선택해야 합니다.');
      setSubmitting(false);
      return;
    }

    // 전화번호 형식 검증
    const phoneDigits = form.phone.replace(/[^\d+]/g, '');
    const isKoreanPhone = /^010/.test(phoneDigits) && phoneDigits.length === 11;
    const isInternationalPhone = phoneDigits.startsWith('+') && phoneDigits.length >= 10;

    if (!isKoreanPhone && !isInternationalPhone) {
      setError('올바른 전화번호 형식을 입력해주세요. 한국 번호는 11자리를 모두 입력해주세요. (예: 010-1234-5678)');
      setSubmitting(false);
      return;
    }

    // 생년월일 조합
    const dob = `${form.dobYear}-${String(form.dobMonth).padStart(2, '0')}-${String(form.dobDay).padStart(2, '0')}`;

    // 부분참석 여부 계산
    const isPartial = !isFullAttendance;

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          dob,
          isPartial,
          partialDates: form.attendDates,
        }),
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

  if (done) {
    // 금액 계산 (settings의 registrationPeriods 사용)
    const isPartial = !isFullAttendance;
    const days = isPartial ? form.attendDates.length : 1;

    // 본인 연령대 계산 (API와 동일)
    const dob = `${form.dobYear}-${String(form.dobMonth).padStart(2, '0')}-${String(form.dobDay).padStart(2, '0')}`;
    const birthYear = new Date(dob).getFullYear();
    const thisYear = new Date().getFullYear();
    const age = thisYear - birthYear;

    let ageGroup = 'adult';
    if (age < 19) {
      ageGroup = age >= 7 ? 'minor7to18' : 'minorUnder7';
    }

    // 본인 포함한 인원 계산
    const finalCounts = {
      adult: form.extraCounts.adult + (ageGroup === 'adult' ? 1 : 0),
      minor7to18: form.extraCounts.minor7to18 + (ageGroup === 'minor7to18' ? 1 : 0),
      minorUnder7: form.extraCounts.minorUnder7 + (ageGroup === 'minorUnder7' ? 1 : 0),
    };

    const now = new Date();
    const periods = settings?.registrationPeriods || [];
    let period = periods.find(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      return now >= start && now <= end;
    });
    if (!period && periods.length > 0) {
      period = periods[periods.length - 1];
    }

    let unitPrice = {};
    let totalAmount = 0;

    if (period) {
      const price = isPartial ? period.partialPrice : period.fullPrice;
      unitPrice = {
        adult: price?.adult || 0,
        minor7to18: price?.minor7to18 || price?.minor8plus || 0,
        minorUnder7: price?.minorUnder7 || price?.minorUnder8 || 0,
      };
    } else {
      // fallback
      const fullPrice = { adult: 150000, minor7to18: 120000, minorUnder7: 0 };
      const partialPrice = { adult: 40000, minor7to18: 25000, minorUnder7: 0 };
      unitPrice = isPartial ? partialPrice : fullPrice;
    }

    totalAmount = isPartial
      ? (unitPrice.adult * finalCounts.adult * days +
         unitPrice.minor7to18 * finalCounts.minor7to18 * days +
         unitPrice.minorUnder7 * finalCounts.minorUnder7 * days)
      : (unitPrice.adult * finalCounts.adult +
         unitPrice.minor7to18 * finalCounts.minor7to18 +
         unitPrice.minorUnder7 * finalCounts.minorUnder7);

    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-green-600">신청이 완료되었습니다!</h2>
        <p className="text-gray-700">참가 신청이 정상적으로 접수되었습니다.</p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">등록비 안내</h3>
          <p className="text-2xl font-bold text-blue-600 mb-4">
            {totalAmount.toLocaleString()}원
          </p>

          <div className="text-left space-y-2 text-sm text-gray-700">
            <p className="font-semibold">입금 계좌</p>
            <p>752601-04-331363 (국민은행)</p>
            <p className="text-xs text-gray-600">예금주: 황금종교회(어게인1907평양대부흥)</p>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            * 등록비 입금 후 참가 확정됩니다.<br />
            * 입금자명은 신청하신 성함과 동일하게 해주세요.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-gray-700 mb-3">
            등록 조회 및 수정은 마이페이지에서 가능합니다.
          </p>
          <a
            href="/lookup"
            className="inline-block w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition"
          >
            마이페이지로 이동
          </a>
        </div>

        <p className="text-sm text-gray-600">감사합니다!</p>
      </div>
    );
  }

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
          className="w-full border border-gray-300 bg-white rounded-md p-2 sm:p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
          className="w-full border border-gray-300 bg-white rounded-md p-2 sm:p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">선택</option>
          <option value="남">남</option>
          <option value="여">여</option>
        </select>
      </div>

      {/* 생년월일 (드롭다운) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">생년월일*</label>
        <div className="grid grid-cols-3 gap-2">
          <select
            name="dobYear"
            value={form.dobYear}
            onChange={onChange}
            required
            className="border border-gray-300 bg-white rounded-md p-2 sm:p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">년도</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            name="dobMonth"
            value={form.dobMonth}
            onChange={onChange}
            required
            className="border border-gray-300 bg-white rounded-md p-2 sm:p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">월</option>
            {months.map(m => <option key={m} value={m}>{m}월</option>)}
          </select>
          <select
            name="dobDay"
            value={form.dobDay}
            onChange={onChange}
            required
            className="border border-gray-300 bg-white rounded-md p-2 sm:p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">일</option>
            {days.map(d => <option key={d} value={d}>{d}일</option>)}
          </select>
        </div>
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
          className="w-full border border-gray-300 bg-white rounded-md p-2 sm:p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500"
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
          className="w-full border border-gray-300 bg-white rounded-md p-2 sm:p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500"
        />
      </div>

      {/* 집회 참석 날짜 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">집회 참석 날짜*</label>
        <div className="mb-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <input
              type="checkbox"
              checked={isFullAttendance}
              onChange={toggleFullAttendance}
              className="h-4 w-4"
            />
            전체 참석
          </label>
        </div>
        <div className="space-y-1 ml-4">
          {settings.dates?.map(d => (
            <label key={d} className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={form.attendDates.includes(d)}
                onChange={() => toggleAttendDate(d)}
                className="h-4 w-4"
              />
              {d}
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">* 등록비는 집회참석비용과 식비가 포함됩니다.</p>
      </div>

      {/* 숙박 신청 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">숙박 신청</label>
        <div className="space-y-1 ml-4 mb-3">
          {accommodationAvailableDates.map(d => (
            <label key={d} className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={form.accommodationDates.includes(d)}
                onChange={() => toggleAccommodationDate(d)}
                className="h-4 w-4"
              />
              {d}
            </label>
          ))}
        </div>
        {form.accommodationDates.length > 0 && (
          <div className="space-y-2 ml-4">
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="radio"
                name="roomType"
                value="단체실"
                checked={form.roomType === '단체실'}
                onChange={onChange}
                className="h-4 w-4"
              />
              단체실
            </label>
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="radio"
                name="roomType"
                value="2인실"
                checked={form.roomType === '2인실'}
                onChange={onChange}
                className="h-4 w-4"
              />
              2인실
            </label>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          오산리 기도원은 남녀 단체실(30인실)과 소수의 2인실이 있습니다. (침구 제공)<br />
          2인실은 전체 참석하는 만 3세 미만 영유아 동반 가족에게 선착순 배정됩니다.
        </p>
      </div>

      {/* 식사 선택 */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            name="skipBreakfast"
            checked={form.skipBreakfast}
            onChange={onChange}
            className="h-4 w-4"
          />
          아침은 안 먹을게요
        </label>
        <p className="text-xs text-gray-500 mt-1">잔반을 줄이기 위해 아침식사를 안 하실 분들은 체크해주세요</p>
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
          className="w-full border border-gray-300 bg-white rounded-md p-2 sm:p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500"
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
              className="w-full border border-gray-300 bg-white rounded-md p-2 sm:p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500"
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
              className="w-full border border-gray-300 bg-white rounded-md p-2 sm:p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500"
            />
          )}
        </div>
      ))}

      {/* 추가 인원 */}
      <fieldset className="border border-gray-300 rounded-md p-4">
        <legend className="font-medium text-gray-900">추가 인원*</legend>
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
                className="w-16 text-center border border-gray-300 bg-white rounded-md p-2 text-gray-900"
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

          {/* 만 7세 ~ 만 18세 */}
          <label className="flex items-center flex-col text-sm text-gray-700">
            만 7세 ~ 만 18세
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setForm(f => ({
                  ...f,
                  extraCounts: {
                    ...f.extraCounts,
                    minor7to18: Math.max(0, f.extraCounts.minor7to18 - 1),
                  }
                }))}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >−</button>

              <input
                type="number"
                min="0"
                name="extraCounts.minor7to18"
                value={form.extraCounts.minor7to18}
                onChange={onChange}
                className="w-16 text-center border border-gray-300 bg-white rounded-md p-2 text-gray-900"
              />

              <button
                type="button"
                onClick={() => setForm(f => ({
                  ...f,
                  extraCounts: {
                    ...f.extraCounts,
                    minor7to18: f.extraCounts.minor7to18 + 1,
                  }
                }))}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >+</button>
            </div>
          </label>

          {/* 만 7세 미만 */}
          <label className="flex items-center flex-col text-sm text-gray-700">
            만 7세 미만
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setForm(f => ({
                  ...f,
                  extraCounts: {
                    ...f.extraCounts,
                    minorUnder7: Math.max(0, f.extraCounts.minorUnder7 - 1),
                  }
                }))}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >−</button>

              <input
                type="number"
                min="0"
                name="extraCounts.minorUnder7"
                value={form.extraCounts.minorUnder7}
                onChange={onChange}
                className="w-16 text-center border border-gray-300 bg-white rounded-md p-2 text-gray-900"
              />

              <button
                type="button"
                onClick={() => setForm(f => ({
                  ...f,
                  extraCounts: {
                    ...f.extraCounts,
                    minorUnder7: f.extraCounts.minorUnder7 + 1,
                  }
                }))}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >+</button>
            </div>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          전체 참석: 성인 150,000원 / 만 7~18세 120,000원 / 만 7세 미만 무료<br />
          부분 참석 (1일): 성인 40,000원 / 만 7~18세 25,000원 / 만 7세 미만 무료
        </p>
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
