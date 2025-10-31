"use client";

import { useState } from "react";
import DynamicForm from "@/components/DynamicForm";

export default function LookupPage() {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRegistrations([]);
    setSelectedIndex(0);

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.registrations && data.registrations.length > 0) {
        setRegistrations(data.registrations);
        setSettings(data.settings);
      }
      else setError("해당 정보와 일치하는 등록 내역이 없습니다.");
    } catch (err) {
      setError(err.message || "조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 필드 ID를 라벨로 변환하는 함수
  const getFieldLabel = (fieldId, formFields) => {
    // 특정 필드 ID에 대한 커스텀 라벨
    if (fieldId === 'field_1760381312998') {
      return '생년월일';
    }

    const field = formFields?.find(f => f.id === fieldId);
    return field?.label || fieldId;
  };

  const handleEdit = () => {
    const participant = registrations[selectedIndex];
    setEditData(participant);
    setEditMode(true);
  };

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const participant = registrations[selectedIndex];
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/registration", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: participant.id,
          collectionName: participant.collectionName
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      alert("삭제되었습니다.");
      // 삭제 후 다시 조회
      setRegistrations([]);
      setSelectedIndex(0);
      setForm({ name: "", phone: "" });
    } catch (err) {
      setError(err.message || "삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    setLoading(true);
    setError("");

    try {
      // 현재 폼의 필드 ID 목록 생성
      const currentFormFieldIds = new Set();
      editData.formFields?.forEach(field => {
        currentFormFieldIds.add(field.id);

        // payment-calculator의 날짜 및 식사 옵션 필드 추가
        if (field.type === 'payment-calculator') {
          currentFormFieldIds.add(`${field.id}_dates`);
          currentFormFieldIds.add(`${field.id}_mealOptions`);
        }

        // accommodation-calculator의 날짜와 방 타입 필드 추가
        if (field.type === 'accommodation-calculator') {
          currentFormFieldIds.add(`${field.id}_dates`);
          currentFormFieldIds.add(`${field.id}_roomType`);
          currentFormFieldIds.add(`${field.id}_roomOptions`);
        }

        // date-of-birth의 임시 필드 추가
        if (field.type === 'date-of-birth') {
          currentFormFieldIds.add(`_temp_${field.id}`);
        }
      });

      // 현재 폼의 필드에 해당하는 데이터만 필터링
      const filteredFormData = {};
      Object.keys(formData).forEach(key => {
        if (currentFormFieldIds.has(key)) {
          filteredFormData[key] = formData[key];
        }
      });

      const res = await fetch("/api/registration", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editData.id,
          collectionName: editData.collectionName,
          formData: filteredFormData,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      alert("수정되었습니다.");
      setEditMode(false);

      // 수정 후 다시 조회
      const updatedRes = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!updatedRes.ok) {
        throw new Error("다시 조회하는 중 오류가 발생했습니다.");
      }

      const updatedData = await updatedRes.json();

      // 수정한 항목의 인덱스를 유지하기 위해 ID를 찾음
      const updatedIndex = updatedData.registrations.findIndex(
        r => r.id === editData.id && r.collectionName === editData.collectionName
      );

      setRegistrations(updatedData.registrations);
      setSettings(updatedData.settings);

      // 동일한 항목이 있으면 해당 인덱스로 설정
      if (updatedIndex !== -1) {
        setSelectedIndex(updatedIndex);
      }
    } catch (err) {
      console.error("수정 오류:", err);
      setError(err.message || "수정 중 오류가 발생했습니다.");
      alert(`수정 실패: ${err.message || "알 수 없는 오류"}`);
    } finally {
      setLoading(false);
    }
  };

  // 수정 모드일 때 렌더링
  if (editMode && editData) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">등록 정보 수정</h1>
          <button
            onClick={() => setEditMode(false)}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 뒤로
          </button>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6">
          <DynamicForm
            formSchema={{
              id: editData.formId,
              name: editData.formName,
              fields: editData.formFields || []
            }}
            settings={settings}
            onSubmit={handleUpdate}
            submitButtonText={loading ? "수정 중..." : "수정하기"}
            initialData={editData}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">등록 현황 조회</h1>

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

        {registrations.length > 0 && (
          <>
            {/* 등록 폼 선택 탭 (여러 개인 경우만 표시) */}
            {registrations.length > 1 && (
              <div className="mb-6 bg-white shadow rounded-lg p-2">
                <div className="flex gap-2">
                  {registrations.map((reg, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedIndex(index)}
                      className={`flex-1 py-3 px-4 rounded-md font-medium transition ${
                        selectedIndex === index
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {reg.formName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 선택된 등록 정보 표시 */}
            {registrations[selectedIndex] && (() => {
              const participant = registrations[selectedIndex];
              const isAccommodation = participant.formName?.toLowerCase().includes('숙박');

              return (
                <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-blue-600 mb-4">
                    {participant.formName} 등록 정보
                  </h2>

                  <div className="space-y-4">
                    {/* 동적으로 모든 필드 표시 (라벨 사용) */}
                    {Object.entries(participant)
                      .filter(([key]) => {
                        // 제외할 특정 필드 목록
                        const excludedFields = [
                          '_temp_field_1760379940577', // 예배및식사: 추가 인원 임시 필드
                          '_temp_field_1760381312998', // 숙박: 생년월일 임시 필드
                          'field_1760719354865' // 숙박: 제외할 필드
                        ];

                        // 시스템 필드 제외
                        const systemFields = [
                          'id', 'formId', 'formName', 'collectionName', 'formFields',
                          'registeredAt', 'paymentStatus', 'paidAt', 'createdAt',
                          'roomId', 'roomName', 'roomAssignments', 'extraCounts',
                          'totalPeople', 'amount', 'isPartial', 'partialDates',
                          'registrationPhase', 'accommodationDates', 'roomType',
                          'accommodationAmount', 'groupId', 'representativeId',
                          'groupPosition', 'isRepresentative', 'representativeName',
                          'totalGroupMembers', 'gender', 'age', 'representativeIncluded', 'updatedAt'
                        ];

                        // 추가 인원 필드 제외
                        const field = participant.formFields?.find(f => f.id === key);
                        const isPeopleCountField = field?.type === 'people-count';

                        return !systemFields.includes(key) &&
                               !excludedFields.includes(key) &&
                               !isPeopleCountField &&
                               !key.endsWith('_dates') &&
                               !key.endsWith('_roomType') &&
                               !key.endsWith('_mealOptions') &&
                               !key.endsWith('_roomOptions');
                      })
                      .map(([key, value]) => {
                        if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) return null;

                        const label = getFieldLabel(key, participant.formFields);

                        return (
                          <div key={key} className="grid grid-cols-3 gap-4">
                            <p className="font-semibold text-gray-700">{label}</p>
                            <p className="col-span-2 text-gray-900">
                              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                            </p>
                          </div>
                        );
                      })}

                    {/* 등록일 */}
                    <div className="grid grid-cols-3 gap-4">
                      <p className="font-semibold text-gray-700">등록일</p>
                      <p className="col-span-2 text-gray-900">{participant.registeredAt || '-'}</p>
                    </div>

                    {/* 결제 상태 */}
                    <div className="grid grid-cols-3 gap-4">
                      <p className="font-semibold text-gray-700">결제 상태</p>
                      <p className={`col-span-2 font-semibold ${
                        participant.paymentStatus === "paid" ? "text-green-600" : "text-red-600"
                      }`}>
                        {participant.paymentStatus === "paid" ? "납부완료" : "미납"}
                      </p>
                    </div>

                    {/* 입금 날짜 */}
                    {participant.paidAt && (
                      <div className="grid grid-cols-3 gap-4">
                        <p className="font-semibold text-gray-700">입금 날짜</p>
                        <p className="col-span-2 text-gray-900">{participant.paidAt}</p>
                      </div>
                    )}

                    {/* 대표 등록자 */}
                    {participant.representativeName && (
                      <div className="grid grid-cols-3 gap-4">
                        <p className="font-semibold text-gray-700">대표 등록자</p>
                        <p className="col-span-2 text-gray-900">{participant.representativeName}</p>
                      </div>
                    )}

                    {/* 총 등록 인원 (그룹 인원) */}
                    {participant.totalGroupMembers && (
                      <div className="grid grid-cols-3 gap-4">
                        <p className="font-semibold text-gray-700">총 등록 인원</p>
                        <p className="col-span-2 text-gray-900">{participant.totalGroupMembers}명</p>
                      </div>
                    )}

                    {/* 총 인원 */}
                    {participant.totalPeople && (
                      <div className="grid grid-cols-3 gap-4">
                        <p className="font-semibold text-gray-700">총 인원</p>
                        <p className="col-span-2 text-gray-900">
                          {participant.totalPeople}명
                          {participant.extraCounts && (
                            <span className="text-sm text-gray-600">
                              {` (성인 ${participant.extraCounts.adult || 0}, 만8-18세 ${participant.extraCounts.minor8plus || 0}, 만8세 미만 ${participant.extraCounts.minorUnder8 || 0})`}
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* 참가 일정 */}
                    {(participant.isPartial !== undefined) && (
                      <div className="grid grid-cols-3 gap-4">
                        <p className="font-semibold text-gray-700">참가 일정</p>
                        <div className="col-span-2 text-gray-900">
                          <p>
                            {participant.isPartial
                              ? participant.partialDates?.join(", ") || "선택한 날짜"
                              : "전체 참석"}
                          </p>

                          {/* 식사 옵션 표시 */}
                          {(() => {
                            const paymentField = participant.formFields?.find(f => f.type === 'payment-calculator');
                            if (!paymentField) return null;

                            const mealOptionsFieldId = `${paymentField.id}_mealOptions`;
                            const mealOptions = participant[mealOptionsFieldId];

                            if (!mealOptions || Object.keys(mealOptions).length === 0) return null;

                            const mealLabels = paymentField.mealLabels || { noBreakfast: '아침 식사 제외', fasting: '금식' };

                            return (
                              <div className="mt-2 pl-4 border-l-2 border-gray-300">
                                <p className="text-sm font-medium text-gray-600 mb-1">식사 옵션:</p>
                                {Object.entries(mealOptions).map(([date, options]) => {
                                  if (!options.noBreakfast && !options.fasting) return null;

                                  return (
                                    <div key={date} className="text-sm text-gray-700">
                                      <span className="font-medium">{date}:</span>{' '}
                                      {options.noBreakfast && mealLabels.noBreakfast}
                                      {options.fasting && mealLabels.fasting}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* 숙박 정보 */}
                    {participant.roomType && (
                      <div className="grid grid-cols-3 gap-4">
                        <p className="font-semibold text-gray-700">숙박 정보</p>
                        <div className="col-span-2 text-gray-900">
                          <p>방 타입: {participant.roomType}</p>
                          {participant.accommodationDates && participant.accommodationDates.length > 0 && (
                            <p className="text-sm text-gray-900">
                              숙박 날짜: {participant.accommodationDates.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 방 배정 (숙박 등록만 표시) */}
                    {isAccommodation && (
                      <div className="grid grid-cols-3 gap-4">
                        <p className="font-semibold text-gray-700">방 배정</p>
                        <p className="col-span-2 text-gray-900">
                          {participant.roomName || "미배정"}
                          {!participant.roomName && (
                            <span className="block text-xs text-gray-500 mt-1">
                              방 배정은 집회 현장에서 배정됩니다.
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* 금액 안내 */}
                    {participant.amount && participant.amount.total > 0 && (
                      <div className="col-span-3 mt-4 pt-4 border-t border-gray-200">
                        <p className="font-semibold text-gray-700 mb-3">금액 안내</p>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2 text-sm">
                          <div className="font-bold text-blue-600 text-lg">
                            총 금액: {participant.amount.total?.toLocaleString() || 0}원
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-300">
                            <p className="font-semibold text-gray-700 mb-2">입금 계좌</p>
                            <p className="font-medium">752601-04-331363 (국민은행)</p>
                            <p className="text-xs text-gray-600">예금주: 황금종교회(어게인1907평양대부흥)</p>
                            <p className="text-xs text-gray-500 mt-2">
                              * 입금자명은 ‘전화번호 뒷자리+성명’으로 부탁드립니다.
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              * 결제 상태는 입금 확인 후 변경 되며 2~3일 정도 소요됩니다.

                            </p>
                            {participant.representativeName && (
                              <p className="text-xs text-gray-500 mt-1">
                                * 대표 등록자({participant.representativeName})가 입금하면 함께 입금 완료 처리됩니다.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 수정 및 삭제 버튼 */}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={handleEdit}
                      className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700"
                    >
                      수정하기
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 bg-red-600 text-white font-semibold py-3 rounded-md hover:bg-red-700"
                    >
                      삭제하기
                    </button>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </section>
  );
}
