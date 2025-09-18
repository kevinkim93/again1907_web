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

  if (disabled) return <p className="text-red-600">신청이 비활성화되었습니다.</p>;
  if (done) return <p className="text-green-600">신청이 완료되었습니다. 감사합니다!</p>;

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* 이름 */}
      <div>
        <label className="block text-sm font-medium mb-1">이름*</label>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          required
          className="w-full border rounded-md p-2"
        />
      </div>

      {/* 성별 */}
      <div>
        <label className="block text-sm font-medium mb-1">성별*</label>
        <select
          name="gender"
          value={form.gender}
          onChange={onChange}
          required
          className="w-full border rounded-md p-2"
        >
          <option value="">선택</option>
          <option value="남">남</option>
          <option value="여">여</option>
        </select>
      </div>

      {/* 생년월일 */}
      <div>
        <label className="block text-sm font-medium mb-1">생년월일*</label>
        <input
          type="date"
          name="dob"
          value={form.dob}
          onChange={onChange}
          required
          className="w-full border rounded-md p-2"
        />
      </div>

      {/* 연락처 */}
      <div>
        <label className="block text-sm font-medium mb-1">연락처*</label>
        <input
          name="phone"
          value={form.phone}
          onChange={onChange}
          required
          className="w-full border rounded-md p-2"
        />
      </div>

      {/* 소속 */}
      <div>
        <label className="block text-sm font-medium mb-1">소속 교회/지역*</label>
        <input
          name="churchOrRegion"
          value={form.churchOrRegion}
          onChange={onChange}
          required
          className="w-full border rounded-md p-2"
        />
      </div>

      {/* 부분참석 */}
      <div>
        <label className="flex items-center gap-2">
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
              <label key={d} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.partialDates.includes(d)}
                  onChange={() => togglePartialDate(d)}
                  className="h-4 w-4"
                  required
                />
                {d}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 교통편 */}
      <div>
        <p className="text-sm font-medium mb-1">교통편(중복 불가)*</p>
        <div className="flex gap-4">
          {settings.transportOptions?.map(opt => (
            <label key={opt} className="flex items-center gap-2">
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
        <label className="block text-sm font-medium mb-1">집회를 알게된 경로*</label>
        <input
          name="discovery"
          value={form.discovery}
          onChange={onChange}
          required
          list="discoveryList"
          className="w-full border rounded-md p-2"
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
          <label className="block text-sm font-medium mb-1">
            {q.label}{q.required ? '*' : ''}
          </label>

          {q.type === 'textarea' ? (
            <textarea
              name={`extraAnswers.${q.id || idx}`}
              onChange={onChange}
              required={!!q.required}
              className="w-full border rounded-md p-2"
            />
          ) : q.type === 'select' ? (
            <select
              name={`extraAnswers.${q.id || idx}`}
              onChange={onChange}
              required={!!q.required}
              className="w-full border rounded-md p-2"
            >
              <option value="">선택하세요</option>
              {q.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : q.type === 'checkbox' ? (
            <div className="space-y-1">
              {q.options?.map(opt => (
                <label key={opt} className="flex items-center gap-2">
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
              className="w-full border rounded-md p-2"
            />
          )}
        </div>
      ))}

      {/* 추가 인원 */}
      <fieldset className="border rounded-md p-4">
        <legend className="font-medium">추가 인원*</legend>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <label className="flex flex-col text-sm">
            성인
            <input
              type="number"
              min="0"
              name="extraCounts.adult"
              value={form.extraCounts.adult}
              onChange={onChange}
              required
              className="border rounded-md p-1"
            />
          </label>
          <label className="flex flex-col text-sm">
            8세 이상 미성년
            <input
              type="number"
              min="0"
              name="extraCounts.minor8plus"
              value={form.extraCounts.minor8plus}
              onChange={onChange}
              required
              className="border rounded-md p-1"
            />
          </label>
          <label className="flex flex-col text-sm">
            8세 미만 미성년
            <input
              type="number"
              min="0"
              name="extraCounts.minorUnder8"
              value={form.extraCounts.minorUnder8}
              onChange={onChange}
              required
              className="border rounded-md p-1"
            />
          </label>
        </div>
      </fieldset>

      {error && <p className="text-red-600">{error}</p>}

      <button
        disabled={submitting}
        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? '제출 중...' : '신청하기'}
      </button>
    </form>
  );
}
