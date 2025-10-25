'use client';

import { useEffect, useState } from 'react';
import DynamicForm from '@/components/DynamicForm';

export default function RegisterPage() {
  const [forms, setForms] = useState([]);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 활성화된 폼 목록 가져오기
      const formsRes = await fetch('/api/forms/public');
      const formsData = await formsRes.json();

      // Settings 가져오기
      const settingsRes = await fetch('/api/settings/public');
      const settingsData = await settingsRes.json();

      setForms(formsData.forms || []);
      setSettings(settingsData.settings || {});
      setLoading(false);

      // 팝업 표시 로직: localStorage 체크
      if (settingsData.settings?.popupEnabled && settingsData.settings?.popupMessage) {
        const popupHiddenUntil = localStorage.getItem('registerPopupHiddenUntil');
        const now = new Date().getTime();

        // 숨김 기한이 없거나 기한이 지났으면 팝업 표시
        if (!popupHiddenUntil || now > parseInt(popupHiddenUntil)) {
          setShowPopup(true);
        }
      }
    };

    fetchData();
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);

    if (dontShowToday) {
      // 오늘 자정까지 숨김 (다음날 0시에 다시 표시)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      localStorage.setItem('registerPopupHiddenUntil', tomorrow.getTime().toString());
    }
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    const currentForm = forms[activeTab];

    // 현재 폼의 필드 ID 목록 생성
    const currentFormFieldIds = new Set();
    currentForm.fields.forEach(field => {
      currentFormFieldIds.add(field.id);

      // payment-calculator의 날짜 필드 추가
      if (field.type === 'payment-calculator') {
        currentFormFieldIds.add(`${field.id}_dates`);
      }

      // accommodation-calculator의 날짜와 방 타입 필드 추가
      if (field.type === 'accommodation-calculator') {
        currentFormFieldIds.add(`${field.id}_dates`);
        currentFormFieldIds.add(`${field.id}_roomType`);
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

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: currentForm.id,
          formName: currentForm.name,
          formData: filteredFormData,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        const data = await res.json();
        alert(`등록 실패: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (err) {
      alert('등록 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">로딩 중...</p>
      </main>
    );
  }

  if (forms.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white shadow-md rounded-xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {settings?.eventName || '이벤트'}
          </h1>
          <p className="text-gray-600">
            현재 등록 가능한 폼이 없습니다.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {settings?.eventName || '이벤트'} 참가 신청
          </h1>
          <p className="mt-2 text-gray-600">
            아래 신청서를 작성해주세요.
          </p>
        </div>

        {/* 신청 마감 안내 */}
        {!settings?.openRegistration && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-red-700 border border-red-200 text-center">
            현재 신청이 마감되었습니다.
          </div>
        )}

        {/* 성공 메시지 */}
        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4 text-green-700 border border-green-200 text-center">
            등록이 완료되었습니다!
          </div>
        )}

        {/* 탭 UI */}
        {forms.length > 1 && (
          <div className="mb-6 bg-white shadow rounded-lg p-2">
            <div className="flex gap-2">
              {forms.map((form, index) => (
                <button
                  key={form.id}
                  onClick={() => setActiveTab(index)}
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition ${
                    activeTab === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {form.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 폼 설명 */}
        {forms[activeTab]?.description && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 text-sm">{forms[activeTab].description}</p>
          </div>
        )}

        {/* 동적 폼 */}
        <div className="bg-white shadow-md rounded-xl p-6 sm:p-8">
          <DynamicForm
            formSchema={forms[activeTab]}
            settings={settings}
            onSubmit={handleSubmit}
            submitButtonText={submitting ? '등록 중...' : '등록하기'}
          />
        </div>
      </div>

      {/* 팝업 모달 */}
      {showPopup && settings?.popupMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white">📢 안내사항</h2>
            </div>

            {/* 내용 */}
            <div className="px-6 py-6">
              <div className="text-gray-800 whitespace-pre-wrap leading-loose text-base">
                {settings.popupMessage}
              </div>
            </div>

            {/* 하단 영역 */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={dontShowToday}
                  onChange={(e) => setDontShowToday(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 font-medium">오늘 다시 보지 않기</span>
              </label>
              <button
                onClick={handleClosePopup}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-sm"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
