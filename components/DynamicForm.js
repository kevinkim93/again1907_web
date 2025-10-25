'use client';

import { useState, useEffect } from 'react';

// 숙박비 계산 컴포넌트
function AccommodationCalculator({ formData, formSchema, settings, field }) {
  // 날짜 선택 필드 ID
  const dateFieldId = `${field.id}_dates`;
  // 방 타입 선택 필드 ID
  const roomTypeFieldId = `${field.id}_roomType`;

  const selectedDates = formData[dateFieldId] || [];
  const selectedRoomType = formData[roomTypeFieldId] || '';

  if (!field.dateOptions || field.dateOptions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-gray-600">관리자가 숙박 날짜 옵션을 설정하지 않았습니다.</p>
      </div>
    );
  }

  if (!field.roomTypes || field.roomTypes.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-gray-600">관리자가 방 타입을 설정하지 않았습니다.</p>
      </div>
    );
  }

  // 날짜가 선택되지 않았으면 안내 메시지
  if (selectedDates.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-gray-600">숙박 날짜를 하나 이상 선택해주세요.</p>
      </div>
    );
  }

  // 방 타입이 선택되지 않았으면 안내 메시지
  if (!selectedRoomType) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-gray-600">방 타입을 선택해주세요.</p>
      </div>
    );
  }

  if (!field.accommodationPricing) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-gray-600">관리자가 가격 정보를 설정하지 않았습니다.</p>
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
  const totalAmount = pricePerNight * totalNights;

  return (
    <div className="bg-green-50 border border-green-300 rounded-lg p-4">
      <h3 className="font-semibold text-green-900 mb-3">숙박비 계산</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-700">방 타입:</span>
          <span className="font-medium">{selectedRoomType}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-700">숙박 일수:</span>
          <span className="font-medium">{totalNights}박</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-700">등록 시기:</span>
          <span className="font-medium">{isPhase1 ? '1차 등록' : '2차 등록'}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-700">1박 요금:</span>
          <span className="font-medium">{pricePerNight.toLocaleString()}원</span>
        </div>

        <div className="border-t border-green-300 pt-2 mt-2 flex justify-between font-bold text-lg">
          <span className="text-green-900">총 숙박비</span>
          <span className="text-green-900">{totalAmount.toLocaleString()}원</span>
        </div>
      </div>
    </div>
  );
}

// 참가비 계산 컴포넌트
function PaymentCalculator({ formData, formSchema, settings, field }) {
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
        <p className="text-sm text-gray-600">생년월일을 입력하면 참가비가 자동으로 계산됩니다.</p>
      </div>
    );
  }

  if (!field.dateOptions || field.dateOptions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-gray-600">관리자가 참석 날짜 옵션을 설정하지 않았습니다.</p>
      </div>
    );
  }

  if (!field.pricing) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-gray-600">관리자가 가격 정보를 설정하지 않았습니다.</p>
      </div>
    );
  }

  const selectedDates = dateField ? (formData[dateField.id] || []) : [];

  // 날짜가 선택되지 않았으면 안내 메시지
  if (selectedDates.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-gray-600">참석 날짜를 하나 이상 선택해주세요.</p>
      </div>
    );
  }

  const totalDates = field.dateOptions.length;
  const isPartial = selectedDates.length < totalDates;

  // 현재 날짜가 1차 등록 마감일 이전인지 확인
  const now = new Date();
  const phase1Deadline = field.phase1Deadline ? new Date(field.phase1Deadline) : null;
  const isPhase1 = phase1Deadline ? now <= phase1Deadline : true;

  const phase = isPhase1 ? field.pricing.phase1 : field.pricing.phase2;
  const price = isPartial ? phase?.daily : phase?.full;

  if (!price) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-gray-600">가격 정보가 설정되지 않았습니다.</p>
      </div>
    );
  }

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

  let totalAmount = 0;
  if (isPartial) {
    const days = selectedDates.length;
    totalAmount = (
      (price?.adult || 0) * adult * days +
      (price?.minor8plus || 0) * minor8plus * days +
      (price?.minorUnder8 || 0) * minorUnder8 * days
    );
  } else {
    totalAmount = (
      (price?.adult || 0) * adult +
      (price?.minor8plus || 0) * minor8plus +
      (price?.minorUnder8 || 0) * minorUnder8
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
      <h3 className="font-semibold text-blue-900 mb-3">참가비 계산</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-700">참가 유형:</span>
          <span className="font-medium">{isPartial ? `부분 참석 (${selectedDates.length}일)` : '전체 참석'}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-700">등록 시기:</span>
          <span className="font-medium">{isPhase1 ? '1차 등록' : '2차 등록'}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-700">총 인원:</span>
          <span className="font-medium">{totalPeople}명 (본인 포함)</span>
        </div>

        <div className="border-t border-blue-200 pt-2 mt-2">
          {adult > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-700">성인 {adult}명</span>
              <span>{((price?.adult || 0) * adult * (isPartial ? selectedDates.length : 1)).toLocaleString()}원</span>
            </div>
          )}
          {minor8plus > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-700">만8세 이상 {minor8plus}명</span>
              <span>{((price?.minor8plus || 0) * minor8plus * (isPartial ? selectedDates.length : 1)).toLocaleString()}원</span>
            </div>
          )}
          {minorUnder8 > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-700">만7세 이하 {minorUnder8}명</span>
              <span>{((price?.minorUnder8 || 0) * minorUnder8 * (isPartial ? selectedDates.length : 1)).toLocaleString()}원</span>
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

export default function DynamicForm({ formSchema, settings, onSubmit, submitButtonText = '등록하기' }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

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
      if (checked) {
        return { ...prev, [fieldId]: [...current, value] };
      } else {
        return { ...prev, [fieldId]: current.filter(v => v !== value) };
      }
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
      onSubmit(formData);
    }
  };

  // 필드 렌더링
  const renderField = (field) => {
    const value = formData[field.id] || '';
    const error = errors[field.id];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <input
            type={field.type}
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full border rounded-md p-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
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
            className={`w-full border rounded-md p-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
          />
        );

      case 'select':
        return (
          <select
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={`w-full border rounded-md p-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
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
            className={`w-full border rounded-md p-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
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
            className={`w-full border rounded-md p-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
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
                className={`w-full border rounded-md p-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">년도</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>

              <select
                value={tempDob.month || ''}
                onChange={(e) => handleDobChange('month', e.target.value)}
                className={`w-full border rounded-md p-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">월</option>
                {months.map(m => (
                  <option key={m} value={m}>{m}월</option>
                ))}
              </select>

              <select
                value={tempDob.day || ''}
                onChange={(e) => handleDobChange('day', e.target.value)}
                className={`w-full border rounded-md p-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">일</option>
                {days.map(d => (
                  <option key={d} value={d}>{d}일</option>
                ))}
              </select>
            </div>

            {age !== null && (
              <p className="text-sm text-gray-600">
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">성인</label>
              <input
                type="number"
                min="0"
                value={peopleValue.adult || 0}
                onChange={(e) => handleChange(field.id, { ...peopleValue, adult: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">8세 이상</label>
              <input
                type="number"
                min="0"
                value={peopleValue.minor8plus || 0}
                onChange={(e) => handleChange(field.id, { ...peopleValue, minor8plus: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">8세 미만</label>
              <input
                type="number"
                min="0"
                value={peopleValue.minorUnder8 || 0}
                onChange={(e) => handleChange(field.id, { ...peopleValue, minorUnder8: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md p-2"
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

        return (
          <div className="space-y-4">
            {/* 참석 날짜 선택 */}
            {dateOptions.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  참석 날짜 선택
                  {field.enableMealOptions && (
                    <span className="text-xs text-gray-500 ml-2">(필요시 식사 옵션 체크)</span>
                  )}
                </label>
                <div className="space-y-3">
                  {dateOptions.map(date => {
                    const isDateSelected = ((formData[dateFieldId] || [])).includes(date);
                    const mealLabels = field.mealLabels || { noBreakfast: '아침 식사 제외', fasting: '금식' };
                    const dateMealOptions = mealOptionsData[date] || { noBreakfast: false, fasting: false };

                    return (
                      <div key={date} className="border border-gray-200 rounded-lg p-3 bg-white">
                        <div className="flex items-start gap-3">
                          {/* 날짜 체크박스 */}
                          <label className="flex items-center gap-2 min-w-[120px]">
                            <input
                              type="checkbox"
                              checked={isDateSelected}
                              onChange={(e) => handleCheckboxArray(dateFieldId, date, e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span className="font-medium">{date}</span>
                          </label>

                          {/* 식사 옵션 (날짜가 선택되고 활성화된 경우만) */}
                          {field.enableMealOptions && isDateSelected && (
                            <div className="flex gap-4 flex-1 pl-3 border-l border-gray-300">
                              <label className="flex items-center gap-1.5 text-sm text-gray-700">
                                <input
                                  type="radio"
                                  name={`meal_${date}`}
                                  checked={dateMealOptions.noBreakfast === true}
                                  onChange={(e) => {
                                    if (e.target.checked) {
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
                                  className="w-3.5 h-3.5"
                                />
                                <span>{mealLabels.noBreakfast}</span>
                              </label>
                              <label className="flex items-center gap-1.5 text-sm text-gray-700">
                                <input
                                  type="radio"
                                  name={`meal_${date}`}
                                  checked={dateMealOptions.fasting === true}
                                  onChange={(e) => {
                                    if (e.target.checked) {
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
                                  className="w-3.5 h-3.5"
                                />
                                <span>{mealLabels.fasting}</span>
                              </label>
                            </div>
                          )}
                        </div>
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
            />
          </div>
        );

      case 'accommodation-calculator':
        // 숙박비 자동 계산 필드
        const accomDateFieldId = `${field.id}_dates`;
        const accomRoomTypeFieldId = `${field.id}_roomType`;
        const accomDateOptions = field.dateOptions || [];
        const accomRoomTypes = field.roomTypes || [];

        return (
          <div className="space-y-4">
            {/* 숙박 날짜 선택 */}
            {accomDateOptions.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">숙박 날짜 선택</label>
                <div className="space-y-2">
                  {accomDateOptions.map(date => (
                    <label key={date} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={((formData[accomDateFieldId] || [])).includes(date)}
                        onChange={(e) => handleCheckboxArray(accomDateFieldId, date, e.target.checked)}
                      />
                      <span>{date}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 방 타입 선택 */}
            {accomRoomTypes.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">방 타입 선택</label>
                <div className="space-y-2">
                  {accomRoomTypes.map(roomType => (
                    <label key={roomType} className="flex items-center gap-2">
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

            {/* 숙박비 계산기 */}
            <AccommodationCalculator
              formData={{...formData, [accomDateFieldId]: formData[accomDateFieldId], [accomRoomTypeFieldId]: formData[accomRoomTypeFieldId]}}
              formSchema={formSchema}
              settings={settings}
              field={field}
            />
          </div>
        );

      default:
        return <p className="text-gray-500 text-sm">알 수 없는 필드 타입: {field.type}</p>;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formSchema.fields.map(field => (
        <div key={field.id}>
          <label htmlFor={field.id} className="block text-sm font-medium mb-2">
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
  );
}
