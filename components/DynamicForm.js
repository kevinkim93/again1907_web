'use client';

import { useState, useEffect } from 'react';

// 숙박비 계산 컴포넌트
function AccommodationCalculator({ formData, formSchema, settings, field, handleChange }) {
  // 무료 체크박스 필드 ID
  const freeOptionFieldId = `${field.id}_free`;
  const isFree = formData[freeOptionFieldId] || false;
  // 날짜 선택 필드 ID
  const dateFieldId = `${field.id}_dates`;
  // 방 타입 선택 필드 ID
  const roomTypeFieldId = `${field.id}_roomType`;
  // 방 옵션 필드 ID
  const roomOptionsFieldId = `${field.id}_roomOptions`;

  const selectedDates = formData[dateFieldId] || [];
  const selectedRoomType = formData[roomTypeFieldId] || '';
  const roomOptions = formData[roomOptionsFieldId] || {};


  if (!field.dateOptions || field.dateOptions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-black sm:text-gray-900">관리자가 숙박 날짜 옵션을 설정하지 않았습니다.</p>
      </div>
    );
  }

  if (!field.roomTypes || field.roomTypes.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-black sm:text-gray-900">관리자가 방 타입을 설정하지 않았습니다.</p>
      </div>
    );
  }

  // 날짜가 선택되지 않았으면 안내 메시지
  if (selectedDates.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-black sm:text-gray-900">숙박 날짜를 하나 이상 선택해주세요.</p>
      </div>
    );
  }

  // 방 타입이 선택되지 않았으면 안내 메시지
  if (!selectedRoomType) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-black sm:text-gray-900">방 타입을 선택해주세요.</p>
      </div>
    );
  }

  if (!field.accommodationPricing) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-black sm:text-gray-900">관리자가 가격 정보를 설정하지 않았습니다.</p>
      </div>
    );
  }

  // 현재 날짜가 1차 등록 마감일 이전인지 확인
  const now = new Date();
  const phase1Deadline = field.phase1Deadline ? new Date(field.phase1Deadline) : null;
  const isPhase1 = phase1Deadline ? now <= phase1Deadline : true;

  const phase = isPhase1 ? field.accommodationPricing.phase1 : field.accommodationPricing.phase2;
  const pricePerNight = phase?.[selectedRoomType] || 0;

  const totalNights = selectedDates.length;

  // 방 타입별 인원 수 계산
  const roomTypeOption = field.roomTypeOptions?.[selectedRoomType];
  let peopleCount = 1; // 기본값: 1명
  let maleCount = 0;
  let femaleCount = 0;

  if (roomTypeOption?.type === 'gender') {
    // 단체실: 배열 기반 남자 + 여자 인원
    const maleList = roomOptions.male || [];
    const femaleList = roomOptions.female || [];

    maleCount = maleList.length;
    femaleCount = femaleList.length;
    peopleCount = maleCount + femaleCount;
  } else if (roomTypeOption?.type === 'count') {
    // 2인실 같은 경우: 선택한 인원 수 (가격 계산에는 영향 없음)
    peopleCount = parseInt(roomOptions.count) || 1;
  }

  // 총 금액 계산: 30인실은 인원당 가격, 그 외는 방당 가격
  let totalAmount = 0;

  if (roomTypeOption?.type === 'gender') {
    // 30인실: 인원 수 × 1박 요금 × 박수
    totalAmount = pricePerNight * peopleCount * totalNights;
  } else {
    // 2인실 등: 1박 요금 × 박수 (인원수 무관)
    totalAmount = pricePerNight * totalNights;
  }
  totalAmount = isFree?0:totalAmount

  return (
    <div className="bg-green-50 border border-green-300 rounded-lg p-4">
      <h3 className="font-semibold text-green-900 mb-3">숙박비 계산</h3>

      {/* 무료 전환 체크박스 */}
      {field.enableFreeOption && (
        <div className="mb-3 pb-3 border-b border-green-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => handleChange(freeOptionFieldId, e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-black sm:text-gray-900">
              {field.freeOptionLabel || '무료 (봉사자/스텝)'}
            </span>
          </label>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-black sm:text-gray-700">방 타입:</span>
          <span className="font-medium text-black sm:text-gray-900">{selectedRoomType}</span>
        </div>

        {roomTypeOption?.type === 'gender' && (
          <div className="flex justify-between">
            <span className="text-black sm:text-gray-700">인원:</span>
            <span className="font-medium text-black sm:text-gray-900">
              {peopleCount}명 (남 {maleCount}, 여 {femaleCount})
            </span>
          </div>
        )}

        {roomTypeOption?.type === 'count' && (
          <div className="flex justify-between">
            <span className="text-black sm:text-gray-700">동숙 인원:</span>
            <span className="font-medium text-black sm:text-gray-900">{peopleCount}명</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-black sm:text-gray-700">숙박 일수:</span>
          <span className="font-medium text-black sm:text-gray-900">{totalNights}박</span>
        </div>

        <div className="flex justify-between">
          <span className="text-black sm:text-gray-700">등록 시기:</span>
          <span className="font-medium text-black sm:text-gray-900">{isPhase1 ? '1차 등록' : '2차 등록'}</span>
        </div>

        {roomTypeOption?.type !== 'gender' && (
          <div className="flex justify-between">
            <span className="text-black sm:text-gray-700">1박 요금:</span>
            <span className="font-medium text-black sm:text-gray-900">{pricePerNight.toLocaleString()}원</span>
          </div>
        )}

        <div className="border-t border-green-300 pt-2 mt-2 flex justify-between font-bold text-lg">
          <span className="text-green-900">총 숙박비</span>
          <span className="text-green-900">{totalAmount.toLocaleString()}원</span>
        </div>
      </div>
    </div>
  );
}

// 참가비 계산 컴포넌트
function PaymentCalculator({ formData, formSchema, settings, field, handleChange }) {
  // 무료 체크박스 필드 ID
  const freeOptionFieldId = `${field.id}_free`;
  const isFree = formData[freeOptionFieldId] || false;
  // 생년월일 필드 찾기 (대표자 나이 확인)
  const dobField = formSchema.fields.find(f => f.type === 'date-of-birth');

  // 날짜 선택 필드 ID (payment-calculator의 dateFieldId)
  const dateFieldId = field.dateFieldId;
  const dateField = dateFieldId ? formSchema.fields.find(f => f.id === dateFieldId) : null;

  // people-count 필드 찾기
  const peopleField = formSchema.fields.find(f => f.type === 'people-count');


  const calculateAgeGroup = (dob) => {
    if (!dob) return null;
    const birthYear = new Date(dob).getFullYear();
    const thisYear = new Date().getFullYear();
    const age = thisYear - birthYear;

    if (age >= 19) return 'adult';
    if (age >= 8) return 'minor8plus';
    return 'minorUnder8';
  };

  // 생년월일이 완전히 입력되지 않았으면 안내 메시지
  if (!dobField || !formData[dobField.id]) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-black sm:text-gray-900">생년월일을 입력하면 참가비가 자동으로 계산됩니다.</p>
      </div>
    );
  }

  if (!field.dateOptions || field.dateOptions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-black sm:text-gray-900">관리자가 참석 날짜 옵션을 설정하지 않았습니다.</p>
      </div>
    );
  }

  if (!field.pricing) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-black sm:text-gray-900">관리자가 가격 정보를 설정하지 않았습니다.</p>
      </div>
    );
  }

  const selectedDates = dateField ? (formData[dateField.id] || []) : [];

  // 날짜가 선택되지 않았으면 안내 메시지
  if (selectedDates.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-black sm:text-gray-900">참석 날짜를 하나 이상 선택해주세요.</p>
      </div>
    );
  }

  const totalDates = field.dateOptions.length;
  const isPartial = selectedDates.length < totalDates;

  // 1차/2차 가격 활성화 여부 확인
  const phase1Enabled = field.enablePhase1 !== false;
  const phase2Enabled = field.enablePhase2 !== false;

  // 현재 날짜가 1차 등록 마감일 이전인지 확인
  const now = new Date();
  const phase1Deadline = field.phase1Deadline ? new Date(field.phase1Deadline) : null;
  let isPhase1 = false;

  // 1차만 활성화된 경우
  if (phase1Enabled && !phase2Enabled) {
    isPhase1 = true;
  }
  // 2차만 활성화된 경우
  else if (!phase1Enabled && phase2Enabled) {
    isPhase1 = false;
  }
  // 둘 다 활성화된 경우
  else if (phase1Enabled && phase2Enabled) {
    isPhase1 = phase1Deadline ? now <= phase1Deadline : true;
  }
  // 둘 다 비활성화된 경우
  else {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-black sm:text-gray-900">가격 정보가 설정되지 않았습니다.</p>
      </div>
    );
  }

  const phase = isPhase1 ? field.pricing.phase1 : field.pricing.phase2;

  // 대표자 본인만 기본으로 포함
  let adult = 0;
  let minor8plus = 0;
  let minorUnder8 = 0;

  // 대표자 나이 확인하여 해당 그룹에 추가
  const representativeAgeGroup = calculateAgeGroup(formData[dobField.id]);
  if (representativeAgeGroup === 'adult') adult = 1;
  else if (representativeAgeGroup === 'minor8plus') minor8plus = 1;
  else if (representativeAgeGroup === 'minorUnder8') minorUnder8 = 1;

  // 추가 인원이 있으면 합산
  if (peopleField && formData[peopleField.id]) {
    const peopleData = formData[peopleField.id];
    adult += peopleData.adult || 0;
    minor8plus += peopleData.minor8plus || 0;
    minorUnder8 += peopleData.minorUnder8 || 0;
  }

  const totalPeople = adult + minor8plus + minorUnder8;

  // 가격 계산
  let totalAmount = 0;
  let priceDetails = { adult: 0, minor8plus: 0, minorUnder8: 0 };


  if (isPartial) {
    // 부분 참석: 날짜별 개별 가격 합산
    selectedDates.forEach(date => {
      const datePrice = phase?.perDate?.[date];
      if (datePrice) {
        priceDetails.adult += (datePrice.adult || 0) * adult;
        priceDetails.minor8plus += (datePrice.minor8plus || 0) * minor8plus;
        priceDetails.minorUnder8 += (datePrice.minorUnder8 || 0) * minorUnder8;
      }
    });
    totalAmount = priceDetails.adult + priceDetails.minor8plus + priceDetails.minorUnder8;
  } else {
    // 전체 참석: 전체 참석 가격 사용
    const fullPrice = phase?.full;
    if (fullPrice) {
      priceDetails.adult = (fullPrice.adult || 0) * adult;
      priceDetails.minor8plus = (fullPrice.minor8plus || 0) * minor8plus;
      priceDetails.minorUnder8 = (fullPrice.minorUnder8 || 0) * minorUnder8;
      totalAmount = priceDetails.adult + priceDetails.minor8plus + priceDetails.minorUnder8;
    }
  }
  totalAmount=isFree?0:totalAmount

  // if (totalAmount === 0) {
  //   return (
  //     <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
  //       <p className="text-sm text-black sm:text-gray-600">가격 정보가 설정되지 않았습니다.</p>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
      <h3 className="font-semibold text-blue-900 mb-3">참가비 계산</h3>

      {/* 무료 전환 체크박스 */}
      {field.enableFreeOption && (
        <div className="mb-3 pb-3 border-b border-blue-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => handleChange(freeOptionFieldId, e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-black sm:text-gray-900">
              {field.freeOptionLabel || '무료 (봉사자/스텝)'}
            </span>
          </label>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-black sm:text-gray-700">참가 유형:</span>
          <span className="font-medium text-black sm:text-gray-900">{isPartial ? `부분 참석 (${selectedDates.length}일)` : '전체 참석'}</span>
        </div>

        {phase1Enabled && phase2Enabled && (
          <div className="flex justify-between">
            <span className="text-black sm:text-gray-700">등록 시기:</span>
            <span className="font-medium text-black sm:text-gray-900">{isPhase1 ? '1차 등록' : '2차 등록'}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-black sm:text-gray-700">총 인원:</span>
          <span className="font-medium text-black sm:text-gray-900">{totalPeople}명 (본인 포함)</span>
        </div>

        <div className="border-t border-blue-200 pt-2 mt-2">
          {adult > 0 && (
            <div className="flex justify-between">
              <span className="text-black sm:text-gray-700">성인 {adult}명</span>
              <span className="text-black sm:text-gray-900">{isFree?0:priceDetails.adult.toLocaleString()}원</span>
            </div>
          )}
          {minor8plus > 0 && (
            <div className="flex justify-between">
              <span className="text-black sm:text-gray-700">만8세 이상 {minor8plus}명</span>
              <span className="text-black sm:text-gray-900">{isFree?0:priceDetails.minor8plus.toLocaleString()}원</span>
            </div>
          )}
          {minorUnder8 > 0 && (
            <div className="flex justify-between">
              <span className="text-black sm:text-gray-700">만7세 이하 {minorUnder8}명</span>
              <span className="text-black sm:text-gray-900">{isFree?0:priceDetails.minorUnder8.toLocaleString()}원</span>
            </div>
          )}
        </div>

        <div className="border-t border-blue-300 pt-2 mt-2 flex justify-between font-bold text-lg">
          <span className="text-blue-900">총 참가비</span>
          <span className="text-blue-900">{totalAmount.toLocaleString()}원</span>
        </div>
      </div>
    </div>
  );
}

export default function DynamicForm({ formSchema, settings, onSubmit, submitButtonText = '등록하기', initialData = null }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // initialData가 있으면 해당 필드에 자동으로 채우기
  useEffect(() => {
    if (initialData && formSchema) {
      const autoFilledData = {};

      // 등록 수정 모드: initialData에 모든 필드 데이터가 있음
      if (initialData.formId) {
        // 모든 필드 ID를 순회하며 데이터 채우기
        formSchema.fields.forEach(field => {
          if (initialData[field.id] !== undefined) {
            autoFilledData[field.id] = initialData[field.id];
          }

          // payment-calculator 날짜 필드 처리
          if (field.type === 'payment-calculator') {
            const dateFieldId = `${field.id}_dates`;
            const mealOptionsFieldId = `${field.id}_mealOptions`;
            if (initialData[dateFieldId]) {
              autoFilledData[dateFieldId] = initialData[dateFieldId];
            }
            if (initialData[mealOptionsFieldId]) {
              autoFilledData[mealOptionsFieldId] = initialData[mealOptionsFieldId];
            }
          }

          // accommodation-calculator 필드 처리
          if (field.type === 'accommodation-calculator') {
            const accomDateFieldId = `${field.id}_dates`;
            const accomRoomTypeFieldId = `${field.id}_roomType`;
            const accomRoomOptionsFieldId = `${field.id}_roomOptions`;
            if (initialData[accomDateFieldId]) {
              autoFilledData[accomDateFieldId] = initialData[accomDateFieldId];
            }
            if (initialData[accomRoomTypeFieldId]) {
              autoFilledData[accomRoomTypeFieldId] = initialData[accomRoomTypeFieldId];
            }
            if (initialData[accomRoomOptionsFieldId]) {
              autoFilledData[accomRoomOptionsFieldId] = initialData[accomRoomOptionsFieldId];
            }
          }

          // date-of-birth 임시 필드 처리
          if (field.type === 'date-of-birth') {
            const tempDobKey = `_temp_${field.id}`;
            if (initialData[tempDobKey]) {
              autoFilledData[tempDobKey] = initialData[tempDobKey];
            }
          }
        });
      } else {
        // 일반 등록 모드: 이름, 전화번호만 자동 채우기
        const nameField = formSchema.fields.find(f =>
          f.type === 'text' && (f.label.includes('이름') || f.label.includes('성명'))
        );
        if (nameField && initialData.name) {
          autoFilledData[nameField.id] = initialData.name;
        }

        const telField = formSchema.fields.find(f => f.type === 'tel');
        if (telField && initialData.tel) {
          autoFilledData[telField.id] = initialData.tel;
        }
      }

      if (Object.keys(autoFilledData).length > 0) {
        setFormData(autoFilledData);
      }
    }
  }, [initialData, formSchema]);

  // 필드 값 변경 핸들러
  const handleChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // 에러 클리어
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: null }));
    }
  };

  // 체크박스 배열 핸들러
  const handleCheckboxArray = (fieldId, value, checked) => {
    setFormData(prev => {
      const current = prev[fieldId] || [];
      const newData = { ...prev };

      if (checked) {
        newData[fieldId] = [...current, value];
      } else {
        newData[fieldId] = current.filter(v => v !== value);

        // payment-calculator의 날짜 선택 해제 시 해당 날짜의 식사 옵션도 제거
        if (fieldId.endsWith('_dates')) {
          const mealOptionsFieldId = fieldId.replace('_dates', '_mealOptions');
          if (newData[mealOptionsFieldId] && newData[mealOptionsFieldId][value]) {
            const updatedMealOptions = { ...newData[mealOptionsFieldId] };
            delete updatedMealOptions[value];
            newData[mealOptionsFieldId] = updatedMealOptions;
          }
        }
      }

      return newData;
    });
  };

  // 폼 검증
  const validate = () => {
    const newErrors = {};

    formSchema.fields.forEach(field => {
      const value = formData[field.id];

      if (field.required) {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.id] = `${field.label}은(는) 필수 입력 항목입니다.`;
        }
      }

      // payment-calculator 필드는 날짜 선택 필수
      if (field.type === 'payment-calculator') {
        const dateFieldId = `${field.id}_dates`;
        const selectedDates = formData[dateFieldId] || [];
        if (selectedDates.length === 0) {
          newErrors[field.id] = '참석 날짜를 하나 이상 선택해주세요.';
        }
      }

      // 타입별 검증
      if (value) {
        if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[field.id] = '올바른 이메일 형식이 아닙니다.';
        }
        if (field.type === 'tel' && !/^[\d-]+$/.test(value)) {
          newErrors[field.id] = '올바른 전화번호 형식이 아닙니다.';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    onSubmit(formData);
  };

  // 필드 렌더링
  const renderField = (field) => {
    const value = formData[field.id] || '';
    const error = errors[field.id];

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={field.type}
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full border rounded-md p-2 text-gray-900 ${error ? 'border-red-500' : 'border-gray-300'}`}
          />
        );

      case 'tel':
        return (
          <input
            type="tel"
            id={field.id}
            defaultValue={value}
            onInput={(e) => {
              // 숫자와 하이픈만 허용
              e.target.value = e.target.value.replace(/[^0-9-]/g, '');
            }}
            onBlur={(e) => {
              // 포커스를 잃을 때 숫자만 저장
              const numericValue = e.target.value.replace(/[^0-9]/g, '');
              handleChange(field.id, numericValue);
            }}
            placeholder={field.placeholder}
            className={`w-full border rounded-md p-2 text-gray-900 ${error ? 'border-red-500' : 'border-gray-300'}`}
          />
        );

      case 'number':
        return (
          <input
            type={field.type}
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full border rounded-md p-2 text-gray-900 ${error ? 'border-red-500' : 'border-gray-300'}`}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`w-full border rounded-md p-2 text-gray-900 ${error ? 'border-red-500' : 'border-gray-300'}`}
          />
        );

      case 'select':
        return (
          <select
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={`w-full border rounded-md p-2 text-gray-900 ${error ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">선택하세요</option>
            {(field.options || []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case 'select-multiple':
        return (
          <select
            id={field.id}
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
              handleChange(field.id, selected);
            }}
            className={`w-full border rounded-md p-2 text-gray-900 ${error ? 'border-red-500' : 'border-gray-300'}`}
            size={Math.min((field.options || []).length, 5)}
          >
            {(field.options || []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {(field.options || []).map(opt => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.id}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        // 단일 체크박스 (true/false)
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(field.id, e.target.checked)}
            />
            <span>{field.placeholder || '동의합니다'}</span>
          </label>
        );

      case 'checkbox-multiple':
        // 다중 선택 체크박스
        return (
          <div className="space-y-2">
            {(field.options || []).map(opt => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(value || []).includes(opt)}
                  onChange={(e) => handleCheckboxArray(field.id, opt, e.target.checked)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={`w-full border rounded-md p-2 text-gray-900 ${error ? 'border-red-500' : 'border-gray-300'}`}
          />
        );

      case 'date-of-birth':
        // 생년월일 드롭다운 입력 + 나이 자동 계산
        const calculateAge = (dob) => {
          if (!dob) return null;
          const birthYear = new Date(dob).getFullYear();
          const thisYear = new Date().getFullYear();
          return thisYear - birthYear;
        };

        // 년/월/일 파싱 - 임시 상태를 위한 키
        const tempDobKey = `_temp_${field.id}`;
        const tempDob = formData[tempDobKey] || { year: '', month: '', day: '' };

        // 실제 값이 있으면 파싱
        if (value && !tempDob.year) {
          const [y, m, d] = value.split('-');
          tempDob.year = y || '';
          tempDob.month = m || '';
          tempDob.day = d || '';
        }

        // 년도 옵션 생성 (현재 년도부터 100년 전까지)
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

        // 월 옵션
        const months = Array.from({ length: 12 }, (_, i) => i + 1);

        // 일 옵션 (선택된 년/월에 따라 달라짐)
        const getDaysInMonth = (year, month) => {
          if (!year || !month) return 31;
          return new Date(year, month, 0).getDate();
        };

        const days = Array.from(
          { length: getDaysInMonth(tempDob.year, tempDob.month) },
          (_, i) => i + 1
        );

        const handleDobChange = (type, val) => {
          const newTempDob = { ...tempDob };

          if (type === 'year') newTempDob.year = val;
          if (type === 'month') newTempDob.month = val;
          if (type === 'day') newTempDob.day = val;

          // 임시 상태 저장
          setFormData(prev => ({ ...prev, [tempDobKey]: newTempDob }));

          // 모든 값이 있으면 최종 날짜 문자열 생성
          if (newTempDob.year && newTempDob.month && newTempDob.day) {
            const paddedMonth = String(newTempDob.month).padStart(2, '0');
            const paddedDay = String(newTempDob.day).padStart(2, '0');
            handleChange(field.id, `${newTempDob.year}-${paddedMonth}-${paddedDay}`);
          }
        };

        const age = calculateAge(value);

        return (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <select
                value={tempDob.year || ''}
                onChange={(e) => handleDobChange('year', e.target.value)}
                className={`w-full border rounded-md p-2 text-gray-900 ${error ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">년도</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>

              <select
                value={tempDob.month || ''}
                onChange={(e) => handleDobChange('month', e.target.value)}
                className={`w-full border rounded-md p-2 text-gray-900 ${error ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">월</option>
                {months.map(m => (
                  <option key={m} value={m}>{m}월</option>
                ))}
              </select>

              <select
                value={tempDob.day || ''}
                onChange={(e) => handleDobChange('day', e.target.value)}
                className={`w-full border rounded-md p-2 text-gray-900 ${error ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">일</option>
                {days.map(d => (
                  <option key={d} value={d}>{d}일</option>
                ))}
              </select>
            </div>

            {age !== null && (
              <p className="text-sm text-black sm:text-gray-900">
                만 {age}세 (만 나이 기준)
              </p>
            )}
          </div>
        );

      case 'checkbox-dates':
        // settings.dates 기반 날짜 체크박스
        const dates = settings?.dates || [];
        return (
          <div className="space-y-2">
            {dates.map(date => (
              <label key={date} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(value || []).includes(date)}
                  onChange={(e) => handleCheckboxArray(field.id, date, e.target.checked)}
                />
                <span>{date}</span>
              </label>
            ))}
          </div>
        );

      case 'people-count':
        // 성인, 8세 이상, 8세 미만 인원 입력
        const peopleValue = value || { adult: 0, minor8plus: 0, minorUnder8: 0 };
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-black sm:text-gray-900">성인<span className="block text-xs font-normal text-black sm:text-gray-500 mt-0.5"><br/></span></label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                value={peopleValue.adult || 0}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    handleChange(field.id, { ...peopleValue, adult: val });
                  }
                }}
                className="w-full border border-gray-300 text-black sm:text-gray-900 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black sm:text-gray-900">
                만 8~18세
                <span className="block text-xs font-normal text-black sm:text-gray-500 mt-0.5">(2007~2019년생)</span>
              </label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                value={peopleValue.minor8plus || 0}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    handleChange(field.id, { ...peopleValue, minor8plus: val });
                  }
                }}
                className="w-full border border-gray-300 text-black sm:text-gray-900 rounded-md p-2 "
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black sm:text-gray-900">
                만 8세 미만
                <span className="block text-xs font-normal text-black sm:text-gray-500 mt-0.5">(2020년생 이후)</span>
              </label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                value={peopleValue.minorUnder8 || 0}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    handleChange(field.id, { ...peopleValue, minorUnder8: val });
                  }
                }}
                className="w-full border border-gray-300 text-black sm:text-gray-900 rounded-md p-2"
              />
            </div>
          </div>
        );

      case 'payment-calculator':
        // 참가비 자동 계산 필드
        // 날짜 선택 체크박스를 먼저 렌더링
        const dateFieldId = `${field.id}_dates`;
        const mealOptionsFieldId = `${field.id}_mealOptions`;
        const dateOptions = field.dateOptions || [];
        const selectedDatesForMeal = formData[dateFieldId] || [];
        const mealOptionsData = formData[mealOptionsFieldId] || {};

        console.log('Payment Calculator Render:', {
          dateFieldId,
          mealOptionsFieldId,
          selectedDatesForMeal,
          mealOptionsData,
          formData
        });

        return (
          <div className="space-y-4">
            {/* 참석 날짜 선택 */}
            {dateOptions.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 text-black sm:text-gray-900">
                  참석 날짜 선택
                  {field.enableMealOptions && (
                    <span className="text-xs text-black sm:text-gray-500 ml-2">(필요시 식사 옵션 체크)</span>
                  )}
                </label>
                <div className="space-y-3 text-black sm:text-gray-900">
                  {dateOptions.map(date => {
                    const isDateSelected = ((formData[dateFieldId] || [])).includes(date);
                    const mealLabels = field.mealLabels || { noBreakfast: '아침 식사 제외', fasting: '금식' };
                    const dateMealOptions = mealOptionsData[date] || { noBreakfast: false, fasting: false };

                    console.log(`Date ${date}:`, { isDateSelected, dateMealOptions });

                    return (
                      <div key={date} className="border border-gray-200 rounded-lg p-3 bg-white">
                        {/* 날짜 체크박스 */}
                        <label className="flex items-center gap-2 text-black sm:text-gray-900">
                          <input
                            type="checkbox"
                            checked={isDateSelected}
                            onChange={(e) => handleCheckboxArray(dateFieldId, date, e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="font-medium">{date}</span>
                        </label>

                        {/* 식사 옵션 (날짜가 선택되고 활성화된 경우만) - 모바일: 아래로, 데스크톱: 옆으로 */}
                        {field.enableMealOptions && isDateSelected && (
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-3 sm:mt-2 sm:ml-6 sm:pl-3 sm:border-l sm:border-gray-300">
                            <label
                              className="flex items-center gap-1.5 text-sm text-black sm:text-gray-700 cursor-pointer"
                              onClick={() => {
                                // 이미 선택된 경우 클릭하면 해제
                                if (dateMealOptions.noBreakfast === true) {
                                  const newMealOptions = {
                                    ...mealOptionsData,
                                    [date]: {
                                      noBreakfast: false,
                                      fasting: false
                                    }
                                  };
                                  handleChange(mealOptionsFieldId, newMealOptions);
                                } else {
                                  const newMealOptions = {
                                    ...mealOptionsData,
                                    [date]: {
                                      noBreakfast: true,
                                      fasting: false
                                    }
                                  };
                                  handleChange(mealOptionsFieldId, newMealOptions);
                                }
                              }}
                            >
                              <input
                                type="radio"
                                name={`meal_${date}`}
                                checked={dateMealOptions.noBreakfast === true}
                                onChange={() => {}} // onClick으로 처리하므로 빈 함수
                                className="w-3.5 h-3.5 cursor-pointer"
                              />
                              <span>{mealLabels.noBreakfast}</span>
                            </label>
                            <label
                              className="flex items-center gap-1.5 text-sm text-black sm:text-gray-700 cursor-pointer"
                              onClick={() => {
                                // 이미 선택된 경우 클릭하면 해제
                                if (dateMealOptions.fasting === true) {
                                  const newMealOptions = {
                                    ...mealOptionsData,
                                    [date]: {
                                      noBreakfast: false,
                                      fasting: false
                                    }
                                  };
                                  handleChange(mealOptionsFieldId, newMealOptions);
                                } else {
                                  const newMealOptions = {
                                    ...mealOptionsData,
                                    [date]: {
                                      noBreakfast: false,
                                      fasting: true
                                    }
                                  };
                                  handleChange(mealOptionsFieldId, newMealOptions);
                                }
                              }}
                            >
                              <input
                                type="radio"
                                name={`meal_${date}`}
                                checked={dateMealOptions.fasting === true}
                                onChange={() => {}} // onClick으로 처리하므로 빈 함수
                                className="w-3.5 h-3.5 cursor-pointer"
                              />
                              <span>{mealLabels.fasting}</span>
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 참가비 계산기 */}
            <PaymentCalculator
              formData={{...formData, [dateFieldId]: formData[dateFieldId]}}
              formSchema={{...formSchema, fields: [...formSchema.fields, {id: dateFieldId, type: 'checkbox-multiple'}]}}
              settings={settings}
              field={{...field, dateFieldId}}
              handleChange={handleChange}
            />
          </div>
        );

      case 'accommodation-calculator':
        // 숙박비 자동 계산 필드
        const accomDateFieldId = `${field.id}_dates`;
        const accomRoomTypeFieldId = `${field.id}_roomType`;
        const accomRoomOptionsFieldId = `${field.id}_roomOptions`;
        const accomDateOptions = field.dateOptions || [];
        const accomRoomTypes = field.roomTypes || [];
        const selectedRoomType = formData[accomRoomTypeFieldId];
        const roomTypeOption = selectedRoomType ? field.roomTypeOptions?.[selectedRoomType] : null;

        return (
          <div className="space-y-4">
            {/* 숙박 날짜 선택 */}
            {accomDateOptions.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 text-black sm:text-gray-900">숙박 날짜 선택</label>
                <div className="space-y-3">
                  {accomDateOptions.map(date => {
                    const isDateSelected = ((formData[accomDateFieldId] || [])).includes(date);
                    return (
                      <div key={date} className="border border-gray-200 rounded-lg p-3 bg-white">
                        <label className="flex items-center gap-2 text-black sm:text-gray-900">
                          <input
                            type="checkbox"
                            checked={isDateSelected}
                            onChange={(e) => handleCheckboxArray(accomDateFieldId, date, e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="font-medium">{date}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 방 타입 선택 */}
            {accomRoomTypes.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 text-black sm:text-gray-900">방 타입 선택</label>
                <div className="space-y-2 ">
                  {accomRoomTypes.map(roomType => (
                    <label key={roomType} className="flex items-center gap-2 text-black sm:text-gray-900">
                      <input
                        type="radio"
                        name={accomRoomTypeFieldId}
                        value={roomType}
                        checked={formData[accomRoomTypeFieldId] === roomType}
                        onChange={(e) => handleChange(accomRoomTypeFieldId, e.target.value)}
                      />
                      <span>{roomType}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 방 타입별 추가 옵션 */}
            {selectedRoomType && roomTypeOption && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3">{selectedRoomType} 추가 정보</h4>

                {roomTypeOption.type === 'gender' && (() => {
                  const currentData = formData[accomRoomOptionsFieldId] || { male: [], female: [] };
                  const maleList = currentData.male || [];
                  const femaleList = currentData.female || [];

                  // 대표자 정보 가져오기
                  const nameField = formSchema.fields.find(f => f.type === 'text' && f.label.includes('이름'));
                  const telField = formSchema.fields.find(f => f.type === 'tel');
                  const dobField = formSchema.fields.find(f => f.label.includes('나이'));
                  const representativeName = formData[nameField?.id] || '대표자';
                  const representativeTel = formData[telField?.id] || '';
                  const representativeAge = formData[dobField?.id]
                    ? String(formData[dobField.id])
                    : '';

                  // 대표자가 어디에 추가되어 있는지 확인
                  const isInMale = maleList.some(p => p.isRepresentative);
                  const isInFemale = femaleList.some(p => p.isRepresentative);
                  const representativeGender = isInMale ? 'male' : isInFemale ? 'female' : null;

                  // 대표자 정보가 변경되었는지 확인하고 자동 업데이트
                  if (representativeGender) {
                    const currentRepresentative = representativeGender === 'male'
                      ? maleList.find(p => p.isRepresentative)
                      : femaleList.find(p => p.isRepresentative);

                    // 정보가 다르면 업데이트
                    if (currentRepresentative && (
                      currentRepresentative.name !== representativeName ||
                      currentRepresentative.phone !== representativeTel ||
                      String(currentRepresentative.age || '') !== String(representativeAge)
                    )) {
                      let newMaleList = [...maleList];
                      let newFemaleList = [...femaleList];

                      if (representativeGender === 'male') {
                        const repIndex = newMaleList.findIndex(p => p.isRepresentative);
                        if (repIndex >= 0) {
                          newMaleList[repIndex] = {
                            ...newMaleList[repIndex],
                            name: representativeName,
                            age: representativeAge,
                            phone: representativeTel,
                            isRepresentative: true
                          };
                        }
                      } else if (representativeGender === 'female') {
                        const repIndex = newFemaleList.findIndex(p => p.isRepresentative);
                        if (repIndex >= 0) {
                          newFemaleList[repIndex] = {
                            ...newFemaleList[repIndex],
                            name: representativeName,
                            age: representativeAge,
                            phone: representativeTel,
                            isRepresentative: true
                          };
                        }
                      }

                      // 다음 렌더링 사이클에서 업데이트 (무한 루프 방지)
                      setTimeout(() => {
                        handleChange(accomRoomOptionsFieldId, {
                          ...currentData,
                          male: newMaleList,
                          female: newFemaleList,
                          representativeName,
                          representativeTel
                        });
                      }, 0);
                    }
                  }

                  const handleRepresentativeGenderChange = (gender) => {
                    let newMaleList = [...maleList];
                    let newFemaleList = [...femaleList];

                    // 기존에 있던 대표자 제거
                    newMaleList = newMaleList.filter(p => !p.isRepresentative);
                    newFemaleList = newFemaleList.filter(p => !p.isRepresentative);

                    // 선택한 성별에 대표자 추가
                    if (gender === 'male') {
                      newMaleList.unshift({
                        name: representativeName,
                        age: representativeAge,
                        phone: representativeTel,
                        isRepresentative: true
                      });
                    } else if (gender === 'female') {
                      newFemaleList.unshift({
                        name: representativeName,
                        age: representativeAge,
                        phone: representativeTel,
                        isRepresentative: true
                      });
                    }

                    handleChange(accomRoomOptionsFieldId, {
                      ...currentData,
                      male: newMaleList,
                      female: newFemaleList,
                      representativeName,
                      representativeTel
                    });
                  };

                  return (
                    <div className="space-y-4">
                      {/* 대표자 본인 성별 선택 */}
                      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                        <p className="text-sm text-yellow-800 mb-2">
                          💡 대표자 본인도 숙박할 경우 성별을 선택해주세요
                        </p>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`${accomRoomOptionsFieldId}_representative_gender`}
                              checked={representativeGender === 'male'}
                              onChange={() => handleRepresentativeGenderChange('male')}
                              className="w-4 h-4"
                            />
                            <span className="text-sm font-medium text-black sm:text-gray-900">본인(남)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`${accomRoomOptionsFieldId}_representative_gender`}
                              checked={representativeGender === 'female'}
                              onChange={() => handleRepresentativeGenderChange('female')}
                              className="w-4 h-4"
                            />
                            <span className="text-sm font-medium text-black sm:text-gray-900">본인(여)</span>
                          </label>
                          {representativeGender && (
                            <button
                              type="button"
                              onClick={() => handleRepresentativeGenderChange(null)}
                              className="text-xs text-red-600 hover:text-red-800 underline"
                            >
                              선택 해제
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 남자 인원 */}
                      <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-black sm:text-gray-900">남자 인원</label>
                        <button
                          type="button"
                          onClick={() => {
                            const currentData = formData[accomRoomOptionsFieldId] || { male: [], female: [] };
                            const maleList = currentData.male || [];

                            handleChange(accomRoomOptionsFieldId, {
                              ...currentData,
                              male: [...maleList, { name: '', age: '', phone: '', isRepresentative: false }]
                            });
                          }}
                          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          + 추가
                        </button>
                      </div>
                      <div className="space-y-2">
                        {((formData[accomRoomOptionsFieldId]?.male) || []).map((person, idx) => {
                          const isRep = person.isRepresentative;
                          return (
                            <div key={idx} className={`border rounded p-3 ${isRep ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-300'}`}>
                              {/* 모바일: 헤더와 삭제 버튼 */}
                              <div className="flex sm:hidden items-center justify-between mb-2">
                                <span className="text-sm font-medium text-black sm:text-gray-700">
                                  남자 {idx + 1} {isRep && '(대표자)'}
                                </span>
                                {!isRep && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentData = formData[accomRoomOptionsFieldId] || { male: [], female: [] };
                                      const maleList = [...(currentData.male || [])];
                                      maleList.splice(idx, 1);
                                      handleChange(accomRoomOptionsFieldId, {
                                        ...currentData,
                                        male: maleList
                                      });
                                    }}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    삭제
                                  </button>
                                )}
                              </div>

                              {/* PC: 가로 배치, 모바일: 세로 배치 */}
                              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                                <span className="hidden sm:inline text-sm text-gray-900 min-w-[60px]">
                                  {idx + 1}. {isRep && '(대표자)'}
                                </span>
                                <input
                                  type="text"
                                  placeholder="이름"
                                  value={person.name || ''}
                                  readOnly={isRep}
                                  onChange={(e) => {
                                    if (isRep) return;
                                    const currentData = formData[accomRoomOptionsFieldId] || { male: [], female: [] };
                                    const maleList = [...(currentData.male || [])];
                                    maleList[idx] = { ...maleList[idx], name: e.target.value };
                                    handleChange(accomRoomOptionsFieldId, {
                                      ...currentData,
                                      male: maleList
                                    });
                                  }}
                                  className={`w-full sm:flex-1 text-black sm:text-gray-900 border rounded px-3 py-2 text-sm ${isRep ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                                />
                                <input
                                  type="number"
                                  placeholder="나이"
                                  value={person.age || ''}
                                  readOnly={isRep}
                                  onChange={(e) => {
                                    if (isRep) return;
                                    const currentData = formData[accomRoomOptionsFieldId] || { male: [], female: [] };
                                    const maleList = [...(currentData.male || [])];
                                    maleList[idx] = { ...maleList[idx], age: e.target.value };
                                    handleChange(accomRoomOptionsFieldId, {
                                      ...currentData,
                                      male: maleList
                                    });
                                  }}
                                  className={`w-full sm:w-20 text-black sm:text-gray-900 border rounded px-3 py-2 text-sm ${isRep ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                                />
                                <input
                                  type="tel"
                                  placeholder="전화번호 (예: 010-1234-5678)"
                                  value={person.phone || ''}
                                  readOnly={isRep}
                                  onChange={(e) => {
                                    if (isRep) return;
                                    const currentData = formData[accomRoomOptionsFieldId] || { male: [], female: [] };
                                    const maleList = [...(currentData.male || [])];
                                    maleList[idx] = { ...maleList[idx], phone: e.target.value };
                                    handleChange(accomRoomOptionsFieldId, {
                                      ...currentData,
                                      male: maleList
                                    });
                                  }}
                                  className={`w-full sm:flex-1 text-black sm:text-gray-900 border rounded px-3 py-2 text-sm ${isRep ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                                />
                                {!isRep && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentData = formData[accomRoomOptionsFieldId] || { male: [], female: [] };
                                      const maleList = [...(currentData.male || [])];
                                      maleList.splice(idx, 1);
                                      handleChange(accomRoomOptionsFieldId, {
                                        ...currentData,
                                        male: maleList
                                      });
                                    }}
                                    className="hidden sm:block text-red-600 hover:text-red-800 text-sm px-2 whitespace-nowrap"
                                  >
                                    삭제
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 여자 인원 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-black sm:text-gray-900">여자 인원</label>
                        <button
                          type="button"
                          onClick={() => {
                            const currentData = formData[accomRoomOptionsFieldId] || { male: [], female: [] };
                            const femaleList = currentData.female || [];

                            handleChange(accomRoomOptionsFieldId, {
                              ...currentData,
                              female: [...femaleList, { name: '', age: '', phone: '', isRepresentative: false }]
                            });
                          }}
                          className="text-sm bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600"
                        >
                          + 추가
                        </button>
                      </div>
                      <div className="space-y-2">
                        {((formData[accomRoomOptionsFieldId]?.female) || []).map((person, idx) => {
                          const isRep = person.isRepresentative;
                          return (
                            <div key={idx} className={`border rounded p-3 ${isRep ? 'bg-pink-50 border-pink-300' : 'bg-white border-gray-300'}`}>
                              {/* 모바일: 헤더와 삭제 버튼 */}
                              <div className="flex sm:hidden items-center justify-between mb-2">
                                <span className="text-sm font-medium text-black sm:text-gray-700">
                                  여자 {idx + 1} {isRep && '(대표자)'}
                                </span>
                                {!isRep && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentData = formData[accomRoomOptionsFieldId] || { male: [], female: [] };
                                      const femaleList = [...(currentData.female || [])];
                                      femaleList.splice(idx, 1);
                                      handleChange(accomRoomOptionsFieldId, {
                                        ...currentData,
                                        female: femaleList
                                      });
                                    }}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    삭제
                                  </button>
                                )}
                              </div>

                              {/* PC: 가로 배치, 모바일: 세로 배치 */}
                              <div className="flex flex-col sm:flex-row gap-2 sm:items-center ">
                                <span className="hidden sm:inline text-sm text-gray-900 min-w-[60px]">
                                  {idx + 1}. {isRep && '(대표자)'}
                                </span>
                                <input
                                  type="text"
                                  placeholder="이름"
                                  value={person.name || ''}
                                  readOnly={isRep}
                                  onChange={(e) => {
                                    if (isRep) return;
                                    const currentData = formData[accomRoomOptionsFieldId] || { male: [], female: [] };
                                    const femaleList = [...(currentData.female || [])];
                                    femaleList[idx] = { ...femaleList[idx], name: e.target.value };
                                    handleChange(accomRoomOptionsFieldId, {
                                      ...currentData,
                                      female: femaleList
                                    });
                                  }}
                                  className={`w-full sm:flex-1 text-black sm:text-gray-900 border rounded px-3 py-2 text-sm ${isRep ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                                />
                                <input
                                  type="number"
                                  placeholder="나이"
                                  value={person.age || ''}
                                  readOnly={isRep}
                                  onChange={(e) => {
                                    if (isRep) return;
                                    const currentData = formData[accomRoomOptionsFieldId] || { male: [], female: [] };
                                    const femaleList = [...(currentData.female || [])];
                                    femaleList[idx] = { ...femaleList[idx], age: e.target.value };
                                    handleChange(accomRoomOptionsFieldId, {
                                      ...currentData,
                                      female: femaleList
                                    });
                                  }}
                                  className={`w-full sm:w-20 text-black sm:text-gray-900 border rounded px-3 py-2 text-sm ${isRep ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                                />
                                <input
                                  type="tel"
                                  placeholder="전화번호 (예: 010-1234-5678)"
                                  value={person.phone || ''}
                                  readOnly={isRep}
                                  onChange={(e) => {
                                    if (isRep) return;
                                    const currentData = formData[accomRoomOptionsFieldId] || { male: [], female: [] };
                                    const femaleList = [...(currentData.female || [])];
                                    femaleList[idx] = { ...femaleList[idx], phone: e.target.value };
                                    handleChange(accomRoomOptionsFieldId, {
                                      ...currentData,
                                      female: femaleList
                                    });
                                  }}
                                  className={`w-full sm:flex-1 text-black sm:text-gray-900 border rounded px-3 py-2 text-sm ${isRep ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                                />
                                {!isRep && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentData = formData[accomRoomOptionsFieldId] || { male: [], female: [] };
                                      const femaleList = [...(currentData.female || [])];
                                      femaleList.splice(idx, 1);
                                      handleChange(accomRoomOptionsFieldId, {
                                        ...currentData,
                                        female: femaleList
                                      });
                                    }}
                                    className="hidden sm:block text-red-600 hover:text-red-800 text-sm px-2 whitespace-nowrap"
                                  >
                                    삭제
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    </div>
                  );
                })()}

                {roomTypeOption.type === 'count' && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black sm:text-gray-900">함께 숙박할 인원 (본인 포함)</label>
                    <select
                      value={formData[accomRoomOptionsFieldId]?.count || '1'}
                      onChange={(e) => handleChange(accomRoomOptionsFieldId, {
                        count: e.target.value
                      })}
                      className="w-full border border-gray-300 rounded-md p-2 text-black sm:text-gray-900"
                    >
                      <option value="1">1명 (본인만)</option>
                      <option value="2">2명</option>
                      <option value="3">3명</option>
                      <option value="4">4명</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* 숙박비 계산기 */}
            <AccommodationCalculator
              formData={{
                ...formData,
                [accomDateFieldId]: formData[accomDateFieldId],
                [accomRoomTypeFieldId]: formData[accomRoomTypeFieldId],
                [accomRoomOptionsFieldId]: formData[accomRoomOptionsFieldId]
              }}
              formSchema={formSchema}
              settings={settings}
              field={field}
              handleChange={handleChange}
            />
          </div>
        );

      default:
        return <p className="text-black sm:text-gray-500 text-sm">알 수 없는 필드 타입: {field.type}</p>;
    }
  };

  // 확인 모달에 표시할 정보 추출
  // 확인 모달에서 사용할 isFree 값 계산
  let isFree = false;
  formSchema?.fields?.forEach(field => {
    if (field.type === 'payment-calculator' || field.type === 'accommodation-calculator') {
      const freeOptionFieldId = `${field.id}_free`;
      if (formData[freeOptionFieldId]) {
        isFree = true;
      }
    }
  });
  const getConfirmationInfo = () => {
    const info = {
      name: '',
      phone: '',
      extraPeople: { adult: 0, minor8plus: 0, minorUnder8: 0 },
      totalAmount: 0,
      paymentAmount: 0,
      accommodationAmount: 0,
      accommodationDetails: {
        pricePerNight: 0,
        nights: 0,
        people: 0,
        roomType: ''
      }
    };

    formSchema.fields.forEach(field => {
      // 이름
      if (field.type === 'text' && (field.label.includes('이름') || field.label.includes('성명'))) {
        info.name = formData[field.id] || '';
      }
      // 전화번호
      if (field.type === 'tel') {
        info.phone = formData[field.id] || '';
      }
      // 추가 인원
      if (field.type === 'people-count') {
        const peopleData = formData[field.id] || {};
        info.extraPeople.adult = peopleData.adult || 0;
        info.extraPeople.minor8plus = peopleData.minor8plus || 0;
        info.extraPeople.minorUnder8 = peopleData.minorUnder8 || 0;
      }
      // 참가비 계산
      if (field.type === 'payment-calculator') {
        const dateFieldId = `${field.id}_dates`;
        const selectedDates = formData[dateFieldId] || [];

        if (selectedDates.length > 0) {
          const totalDates = field.dateOptions?.length || 0;
          const isPartial = selectedDates.length < totalDates;

          const phase1Enabled = field.enablePhase1 !== false;
          const phase2Enabled = field.enablePhase2 !== false;
          const now = new Date();
          const phase1Deadline = field.phase1Deadline ? new Date(field.phase1Deadline) : null;

          let isPhase1 = false;
          if (phase1Enabled && !phase2Enabled) isPhase1 = true;
          else if (!phase1Enabled && phase2Enabled) isPhase1 = false;
          else if (phase1Enabled && phase2Enabled) isPhase1 = phase1Deadline ? now <= phase1Deadline : true;

          const phase = isPhase1 ? field.pricing?.phase1 : field.pricing?.phase2;

          // 대표자 + 추가 인원 계산
          const dobField = formSchema.fields.find(f => f.type === 'date-of-birth');
          let adult = 0, minor8plus = 0, minorUnder8 = 0;

          if (dobField && formData[dobField.id]) {
            const birthYear = new Date(formData[dobField.id]).getFullYear();
            const age = new Date().getFullYear() - birthYear;
            if (age >= 19) adult = 1;
            else if (age >= 8) minor8plus = 1;
            else minorUnder8 = 1;
          }

          adult += info.extraPeople.adult;
          minor8plus += info.extraPeople.minor8plus;
          minorUnder8 += info.extraPeople.minorUnder8;

          if (isPartial) {
            selectedDates.forEach(date => {
              const datePrice = phase?.perDate?.[date];
              if (datePrice) {
                info.paymentAmount += (datePrice.adult || 0) * adult;
                info.paymentAmount += (datePrice.minor8plus || 0) * minor8plus;
                info.paymentAmount += (datePrice.minorUnder8 || 0) * minorUnder8;
              }
            });
          } else {
            const fullPrice = phase?.full;
            if (fullPrice) {
              info.paymentAmount = (
                (fullPrice.adult || 0) * adult +
                (fullPrice.minor8plus || 0) * minor8plus +
                (fullPrice.minorUnder8 || 0) * minorUnder8
              );
            }
          }
        }
      }
      // 숙박비 계산
      if (field.type === 'accommodation-calculator') {
        const accomDateFieldId = `${field.id}_dates`;
        const accomRoomTypeFieldId = `${field.id}_roomType`;
        const accomRoomOptionsFieldId = `${field.id}_roomOptions`;

        const selectedAccomDates = formData[accomDateFieldId] || [];
        const selectedRoomType = formData[accomRoomTypeFieldId] || '';
        const roomOptions = formData[accomRoomOptionsFieldId] || {};

        if (selectedAccomDates.length > 0 && selectedRoomType) {
          const now = new Date();
          const phase1Deadline = field.phase1Deadline ? new Date(field.phase1Deadline) : null;
          const isPhase1 = phase1Deadline ? now <= phase1Deadline : true;

          const phase = isPhase1 ? field.accommodationPricing?.phase1 : field.accommodationPricing?.phase2;
          const pricePerNight = phase?.[selectedRoomType] || 0;
          const totalNights = selectedAccomDates.length;

          const roomTypeOption = field.roomTypeOptions?.[selectedRoomType];
          let peopleCount = 1;

          if (roomTypeOption?.type === 'gender') {
            const maleList = roomOptions.male || [];
            const femaleList = roomOptions.female || [];
            peopleCount = maleList.length + femaleList.length;
            info.accommodationAmount = pricePerNight * peopleCount * totalNights;
          } else {
            info.accommodationAmount = pricePerNight * totalNights;
          }

          info.accommodationDetails = {
            pricePerNight,
            nights: totalNights,
            people: peopleCount,
            roomType: selectedRoomType
          };
        }
      }
    });

    info.totalAmount = info.paymentAmount + info.accommodationAmount;
    return info;
  };

  const confirmInfo = getConfirmationInfo();
  const totalPeople = 1 + confirmInfo.extraPeople.adult + confirmInfo.extraPeople.minor8plus + confirmInfo.extraPeople.minorUnder8;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {formSchema.fields.map(field => (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium mb-2 text-black sm:text-gray-900">
              {field.label}
              {field.required && <span className="text-red-600 ml-1">*</span>}
            </label>
            {renderField(field)}
            {errors[field.id] && (
              <p className="text-red-600 text-sm mt-1">{errors[field.id]}</p>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium"
        >
          {submitButtonText}
        </button>
      </form>

      {/* 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">등록 정보 확인</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-700">이름</span>
                <span className="text-gray-900">{confirmInfo.name}</span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-700">전화번호</span>
                <span className="text-gray-900">{confirmInfo.phone}</span>
              </div>

              {totalPeople > 1 && (
                <div className="border-b pb-2">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-700">총 인원</span>
                    <span className="text-gray-900">{totalPeople}명</span>
                  </div>
                  <div className="text-sm text-gray-900 space-y-1 ml-4">
                    <div>본인 1명</div>
                    {confirmInfo.extraPeople.adult > 0 && (
                      <div>성인 {confirmInfo.extraPeople.adult}명</div>
                    )}
                    {confirmInfo.extraPeople.minor8plus > 0 && (
                      <div>만 8~18세 {confirmInfo.extraPeople.minor8plus}명</div>
                    )}
                    {confirmInfo.extraPeople.minorUnder8 > 0 && (
                      <div>만 8세 미만 {confirmInfo.extraPeople.minorUnder8}명</div>
                    )}
                  </div>
                </div>
              )}

              {confirmInfo.paymentAmount > 0 && (
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium text-gray-700">참가비</span>
                  <span className="text-gray-900">{confirmInfo.paymentAmount.toLocaleString()}원</span>
                </div>
              )}

              {confirmInfo.accommodationAmount > 0 && (
                <div className="border-b pb-2">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-700">숙박비</span>
                    <span className="text-gray-900">{confirmInfo.accommodationAmount.toLocaleString()}원</span>
                  </div>
                  <div className="text-sm text-gray-900 space-y-1 ml-4">
                    <div>방 타입: {confirmInfo.accommodationDetails.roomType}</div>
                    <div>1박 요금: {isFree?0:confirmInfo.accommodationDetails.pricePerNight.toLocaleString()}원</div>
                    <div>숙박 일수: {confirmInfo.accommodationDetails.nights}박</div>
                    {confirmInfo.accommodationDetails.people > 1 && (
                      <div>인원: {confirmInfo.accommodationDetails.people}명</div>
                    )}
                  </div>
                </div>
              )}

              {confirmInfo.totalAmount > 0 && (
                <div className="flex justify-between pt-2">
                  <span className="font-bold text-gray-900 text-lg">총 금액</span>
                  <span className="font-bold text-blue-600 text-lg">{isFree?0:confirmInfo.totalAmount.toLocaleString()}원</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 font-medium"
              >
                취소
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
