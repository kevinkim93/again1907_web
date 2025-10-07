"use client";

import { useState } from "react";

// ✨ 금액 계산 함수 (AttendeesTable과 동일)
function calcPeriodTotal(period, extraCounts, isPartial, days) {
  if (!period) return 0;
  const price = isPartial ? period.partialPrice : period.fullPrice;
  if (!price) return 0;

  const a = Math.max(0, extraCounts?.adult ?? 0);
  const m7to18 = Math.max(0, extraCounts?.minor7to18 ?? extraCounts?.minor8plus ?? 0);
  const mu7 = Math.max(0, extraCounts?.minorUnder7 ?? extraCounts?.minorUnder8 ?? 0);

  const multiplier = isPartial ? Math.max(0, days) : 1;
  return (
    (price.adult || 0) * a +
    ((price.minor7to18 || price.minor8plus || 0) * m7to18) +
    ((price.minorUnder7 || price.minorUnder8 || 0) * mu7)
  ) * multiplier;
}

export default function LookupPage() {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setParticipant(null);

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.participant) {
        setParticipant(data.participant);
        setSettings(data.settings);
      }
      else setError("해당 정보와 일치하는 등록 내역이 없습니다.");
    } catch (err) {
      setError(err.message || "조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">로그인</h1>

      {/* 입력 폼 */}
      <form
        onSubmit={onSubmit}
        className="space-y-4 bg-white shadow-md rounded-xl p-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이름
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            required
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            placeholder="이름을 입력하세요"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            전화번호
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={onChange}
            required
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            placeholder="예: 010-1234-5678"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "조회 중..." : "조회하기"}
        </button>
      </form>

      {/* 결과 */}
      <div className="mt-8">
        {error && (
          <p className="text-red-600 text-center font-medium">{error}</p>
        )}

        {participant && (
          <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4">
              {participant.name} 님의 등록 정보
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <p className="font-semibold text-gray-700">성별</p>
                <p className="text-gray-900">{participant.gender || "-"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">생년월일</p>
                <p className="text-gray-900">{participant.dob || "-"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">연락처</p>
                <p className="text-gray-900">{participant.phone}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">소속</p>
                <p className="text-gray-900">
                  {participant.churchOrRegion || "-"}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">총 인원</p>
                <p className="text-gray-900">
                  {participant.totalPeople}명
                  {` (성인 ${participant.extraCounts?.adult || 0}, 8세 이상 ${
                    participant.extraCounts?.minor8plus || 0
                  }, 8세 미만 ${participant.extraCounts?.minorUnder8 || 0})`}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">등록일</p>
                <p className="text-gray-900">{participant.registeredAt}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">결제 상태</p>
                <p
                  className={`font-semibold ${
                    participant.paymentStatus === "paid"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {participant.paymentStatus === "paid" ? "납부완료" : "미납"}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">입금 날짜</p>
                <p className="text-gray-900">{participant.paidAt || "-"}</p>
              </div>
              {/* ✅ 방 배정 정보 */}
              <div>
                <p className="font-semibold text-gray-700">방 배정</p>
                <p className="text-gray-900">
                  {participant.roomName || "미배정"}
                </p>
                {!participant.roomName && (
                  <p className="text-xs text-gray-500 mt-1">
                    방 배정은 집회 현장에서 배정됩니다.
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <p className="font-semibold text-gray-700">참가 일정</p>
                <p className="text-gray-900">
                  {participant.isPartial
                    ? participant.partialDates?.join(", ")
                    : "전체 참석"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="font-semibold text-gray-700 mb-2">금액 안내</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2 text-sm text-gray-900">
                  {(() => {
                    // 등록일 기준으로 기간 판별
                    const registeredAt = participant.registeredAt;
                    const periods = settings?.registrationPeriods || [];

                    let period = periods.find(p => {
                      if (!registeredAt) return false;
                      const regDate = new Date(registeredAt);
                      const start = new Date(p.startDate);
                      const end = new Date(p.endDate);
                      return regDate >= start && regDate <= end;
                    });

                    if (!period && periods.length > 0) {
                      period = periods[periods.length - 1];
                    }

                    const isPartial = !!participant.isPartial;
                    const days = isPartial ? (participant.partialDates?.length || 0) : 1;
                    const price = period ? (isPartial ? period.partialPrice : period.fullPrice) : null;

                    const adultCount = participant.extraCounts?.adult || 0;
                    const minor7to18Count = participant.extraCounts?.minor7to18 || participant.extraCounts?.minor8plus || 0;
                    const minorUnder7Count = participant.extraCounts?.minorUnder7 || participant.extraCounts?.minorUnder8 || 0;

                    const adultPrice = price?.adult || participant.amount?.adult || 0;
                    const minor7to18Price = price?.minor7to18 || price?.minor8plus || participant.amount?.minor7to18 || participant.amount?.minor8plus || 0;
                    const minorUnder7Price = price?.minorUnder7 || price?.minorUnder8 || participant.amount?.minorUnder7 || participant.amount?.minorUnder8 || 0;

                    const adultTotal = adultPrice * adultCount * (isPartial ? days : 1);
                    const minor7to18Total = minor7to18Price * minor7to18Count * (isPartial ? days : 1);
                    const minorUnder7Total = minorUnder7Price * minorUnder7Count * (isPartial ? days : 1);
                    const grandTotal = adultTotal + minor7to18Total + minorUnder7Total;

                    return (
                      <>
                        {adultCount > 0 && (
                          <div>
                            성인: {adultPrice.toLocaleString()}원 × {adultCount}명
                            {isPartial && days > 0 && ` × ${days}일`}
                            {" = "}
                            {adultTotal.toLocaleString()}원
                          </div>
                        )}

                        {minor7to18Count > 0 && (
                          <div>
                            만 7~18세: {minor7to18Price.toLocaleString()}원 × {minor7to18Count}명
                            {isPartial && days > 0 && ` × ${days}일`}
                            {" = "}
                            {minor7to18Total.toLocaleString()}원
                          </div>
                        )}

                        {minorUnder7Count > 0 && (
                          <div>
                            만 7세 미만: {minorUnder7Price.toLocaleString()}원 × {minorUnder7Count}명
                            {isPartial && days > 0 && ` × ${days}일`}
                            {" = "}
                            {minorUnder7Total.toLocaleString()}원
                          </div>
                        )}

                        <hr className="border-gray-300" />

                        <div className="font-bold text-blue-600 text-base">
                          합계: {grandTotal.toLocaleString()}원
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-300">
                          <p className="font-semibold text-gray-700 mb-1">입금 계좌</p>
                          <p>752601-04-331363 (국민은행)</p>
                          <p className="text-xs text-gray-600">예금주: 황금종교회(어게인1907평양대부흥)</p>
                          <p className="text-xs text-gray-500 mt-2">
                            * 입금자명은 신청하신 성함과 동일하게 해주세요.
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              {participant.remark && (
                <div className="sm:col-span-2">
                  <p className="font-semibold text-gray-700">비고</p>
                  <p className="text-gray-900">{participant.remark}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
