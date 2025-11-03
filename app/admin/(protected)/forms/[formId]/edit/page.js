'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

const FIELD_TYPES = [
  { value: 'text', label: '텍스트 입력' },
  { value: 'number', label: '숫자 입력' },
  { value: 'tel', label: '전화번호' },
  { value: 'email', label: '이메일' },
  { value: 'date', label: '날짜 선택' },
  { value: 'date-of-birth', label: '생년월일 (나이 자동 계산)' },
  { value: 'textarea', label: '긴 텍스트' },
  { value: 'select', label: '선택 (드롭다운)' },
  { value: 'select-multiple', label: '다중 선택 (드롭다운)' },
  { value: 'radio', label: '라디오 버튼' },
  { value: 'checkbox', label: '체크박스 (단일)' },
  { value: 'checkbox-multiple', label: '체크박스 (다중 선택)' },
  { value: 'people-count', label: '인원수 입력 (성인/아동)' },
  { value: 'payment-calculator', label: '참가비 자동 계산' },
  { value: 'accommodation-calculator', label: '숙박비 자동 계산' },
];

export default function FormEditorPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.formId;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null); // 편집 중인 필드

  const fetchForm = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/forms');
    const data = await res.json();
    const found = data.forms.find(f => f.id === formId);
    setForm(found || null);
    setLoading(false);
  }, [formId]);

  useEffect(() => {
    if (formId) {
      fetchForm();
    }
  }, [formId, fetchForm]);

  const updateFormMeta = async (updates) => {
    await fetch('/api/admin/forms', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formId, updates }),
    });
    fetchForm();
  };

  const addField = () => {
    setEditingField({
      id: `field_${Date.now()}`,
      type: 'text',
      label: '새 필드',
      placeholder: '',
      required: false,
      options: [], // select, radio, checkbox용
      validation: {},
    });
  };

  const saveField = async () => {
    if (!editingField) return;

    const fields = form.fields || [];
    const existingIndex = fields.findIndex(f => f.id === editingField.id);

    if (existingIndex >= 0) {
      fields[existingIndex] = editingField;
    } else {
      fields.push(editingField);
    }

    await updateFormMeta({ fields });
    setEditingField(null);
  };

  const deleteField = async (fieldId) => {
    if (!confirm('이 필드를 삭제하시겠습니까?')) return;

    const fields = form.fields.filter(f => f.id !== fieldId);
    await updateFormMeta({ fields });
  };

  const moveField = async (fieldId, direction) => {
    const fields = [...form.fields];
    const index = fields.findIndex(f => f.id === fieldId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [fields[index], fields[targetIndex]] = [fields[targetIndex], fields[index]];

    await updateFormMeta({ fields });
  };

  if (loading) {
    return <main className="p-6"><p>로딩 중...</p></main>;
  }

  if (!form) {
    return <main className="p-6"><p>폼을 찾을 수 없습니다.</p></main>;
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => router.push('/admin/forms')}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← 목록으로
      </button>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">폼 편집: {form.name}</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">폼 이름</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onBlur={(e) => updateFormMeta({ name: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">폼 설명</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              onBlur={(e) => updateFormMeta({ description: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              폼별 안내 메시지
              <span className="text-xs text-gray-500 ml-2">(이 폼을 선택했을 때 표시되는 안내 문구)</span>
            </label>
            <textarea
              value={form.noticeMessage || ''}
              onChange={(e) => setForm({ ...form, noticeMessage: e.target.value })}
              onBlur={(e) => updateFormMeta({ noticeMessage: e.target.value })}
              className="w-full border border-amber-300 rounded-md p-2 focus:ring-2 focus:ring-amber-500"
              rows={3}
              placeholder="*예배와 식사는 별도신청이 불가능합니다."
            />
            <p className="text-xs text-gray-500 mt-1">
              등록 페이지에서 이 폼을 선택하면 눈에 띄는 안내 메시지로 표시됩니다.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">필드 관리</h2>
          <button
            onClick={addField}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + 필드 추가
          </button>
        </div>

        {(!form.fields || form.fields.length === 0) ? (
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">필드가 없습니다</p>
            <button
              onClick={addField}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              첫 필드 추가하기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {form.fields.map((field, index) => (
              <div
                key={field.id}
                className="bg-gray-50 border border-gray-300 rounded-lg p-4 flex items-center gap-4"
              >
                <div className="flex-1">
                  <div className="font-medium">{field.label}</div>
                  <div className="text-sm text-gray-600">
                    타입: {FIELD_TYPES.find(t => t.value === field.type)?.label || field.type}
                    {field.required && <span className="ml-2 text-red-600">*필수</span>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => moveField(field.id, 'up')}
                    disabled={index === 0}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveField(field.id, 'down')}
                    disabled={index === form.fields.length - 1}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => setEditingField({ ...field })}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    편집
                  </button>
                  <button
                    onClick={() => deleteField(field.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 필드 편집 모달 */}
      {editingField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">필드 편집</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">필드 타입</label>
                  <select
                    value={editingField.type}
                    onChange={(e) => setEditingField({ ...editingField, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    {FIELD_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">필드 라벨</label>
                  <input
                    type="text"
                    value={editingField.label}
                    onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">플레이스홀더</label>
                  <input
                    type="text"
                    value={editingField.placeholder || ''}
                    onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingField.required}
                      onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
                    />
                    <span className="text-sm font-medium">필수 입력</span>
                  </label>
                </div>

                {/* select, radio, checkbox 타입인 경우 옵션 입력 */}
                {['select', 'select-multiple', 'radio', 'checkbox-multiple'].includes(editingField.type) && (
                  <div>
                    <label className="block text-sm font-medium mb-1">선택 옵션 (한 줄에 하나씩)</label>
                    <textarea
                      value={(editingField.options || []).join('\n')}
                      onChange={(e) => {
                        // 빈 줄 제거는 저장할 때만 수행
                        const options = e.target.value.split('\n');
                        setEditingField({ ...editingField, options });
                      }}
                      onBlur={(e) => {
                        // blur 시 빈 줄 제거
                        const options = e.target.value.split('\n').filter(o => o.trim());
                        setEditingField({ ...editingField, options });
                      }}
                      className="w-full border border-gray-300 rounded-md p-2 font-mono text-sm"
                      rows={5}
                      placeholder="옵션1&#10;옵션2&#10;옵션3"
                    />
                  </div>
                )}

                {/* payment-calculator 타입인 경우 참석 날짜 및 가격 설정 */}
                {editingField.type === 'payment-calculator' && (
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900">참가비 설정</h4>

                    {/* 무료 전환 체크박스 옵션 */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-medium text-yellow-900 mb-3">무료 전환 옵션</h5>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingField.enableFreeOption || false}
                            onChange={(e) => setEditingField({
                              ...editingField,
                              enableFreeOption: e.target.checked
                            })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">무료 전환 체크박스 활성화</span>
                        </label>
                        {editingField.enableFreeOption && (
                          <div>
                            <label className="block text-sm font-medium mb-1">체크박스 라벨</label>
                            <input
                              type="text"
                              value={editingField.freeOptionLabel || '무료 (봉사자/스텝)'}
                              onChange={(e) => setEditingField({
                                ...editingField,
                                freeOptionLabel: e.target.value
                              })}
                              className="w-full border border-gray-300 rounded-md p-2"
                              placeholder="예: 무료 (봉사자/스텝)"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 참석 날짜 옵션 */}
                    <div>
                      <label className="block text-sm font-medium mb-2">참석 날짜 옵션 (한 줄에 하나씩)</label>
                      <textarea
                        value={(editingField.dateOptions || []).join('\n')}
                        onChange={(e) => {
                          const dateOptions = e.target.value.split('\n');
                          setEditingField({ ...editingField, dateOptions });
                        }}
                        onBlur={(e) => {
                          const dateOptions = e.target.value.split('\n').filter(o => o.trim());
                          setEditingField({ ...editingField, dateOptions });
                        }}
                        className="w-full border border-gray-300 rounded-md p-2 font-mono text-sm"
                        rows={3}
                        placeholder="2025-10-04&#10;2025-10-05&#10;2025-10-06"
                      />
                    </div>

                    {/* 1차 등록 가격 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-blue-900">1차 등록 가격</h5>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingField.enablePhase1 !== false}
                            onChange={(e) => setEditingField({
                              ...editingField,
                              enablePhase1: e.target.checked
                            })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">사용</span>
                        </label>
                      </div>

                      {editingField.enablePhase1 !== false && (
                        <>

                      {/* 전체 참석 가격 */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">전체 참석 (총액)</label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            placeholder="성인"
                            value={editingField.pricing?.phase1?.full?.adult || ''}
                            onChange={(e) => setEditingField({
                              ...editingField,
                              pricing: {
                                ...editingField.pricing,
                                phase1: {
                                  ...editingField.pricing?.phase1,
                                  full: {
                                    ...editingField.pricing?.phase1?.full,
                                    adult: parseInt(e.target.value) || 0
                                  }
                                }
                              }
                            })}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                          />
                          <input
                            type="number"
                            placeholder="만8세↑"
                            value={editingField.pricing?.phase1?.full?.minor8plus || ''}
                            onChange={(e) => setEditingField({
                              ...editingField,
                              pricing: {
                                ...editingField.pricing,
                                phase1: {
                                  ...editingField.pricing?.phase1,
                                  full: {
                                    ...editingField.pricing?.phase1?.full,
                                    minor8plus: parseInt(e.target.value) || 0
                                  }
                                }
                              }
                            })}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                          />
                          <input
                            type="number"
                            placeholder="만7세↓"
                            value={editingField.pricing?.phase1?.full?.minorUnder8 || ''}
                            onChange={(e) => setEditingField({
                              ...editingField,
                              pricing: {
                                ...editingField.pricing,
                                phase1: {
                                  ...editingField.pricing?.phase1,
                                  full: {
                                    ...editingField.pricing?.phase1?.full,
                                    minorUnder8: parseInt(e.target.value) || 0
                                  }
                                }
                              }
                            })}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                          />
                        </div>
                      </div>

                      {/* 날짜별 개별 가격 */}
                      <div>
                        <label className="block text-sm font-medium mb-2">날짜별 개별 가격</label>
                        <div className="space-y-3">
                          {(editingField.dateOptions || []).map((date, idx) => (
                            <div key={idx} className="bg-white border border-blue-300 rounded-lg p-3">
                              <div className="font-medium text-sm text-gray-700 mb-2">{date}</div>
                              <div className="grid grid-cols-3 gap-2">
                                <input
                                  type="number"
                                  placeholder="성인"
                                  value={editingField.pricing?.phase1?.perDate?.[date]?.adult || ''}
                                  onChange={(e) => setEditingField({
                                    ...editingField,
                                    pricing: {
                                      ...editingField.pricing,
                                      phase1: {
                                        ...editingField.pricing?.phase1,
                                        perDate: {
                                          ...editingField.pricing?.phase1?.perDate,
                                          [date]: {
                                            ...editingField.pricing?.phase1?.perDate?.[date],
                                            adult: parseInt(e.target.value) || 0
                                          }
                                        }
                                      }
                                    }
                                  })}
                                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                />
                                <input
                                  type="number"
                                  placeholder="만8세↑"
                                  value={editingField.pricing?.phase1?.perDate?.[date]?.minor8plus || ''}
                                  onChange={(e) => setEditingField({
                                    ...editingField,
                                    pricing: {
                                      ...editingField.pricing,
                                      phase1: {
                                        ...editingField.pricing?.phase1,
                                        perDate: {
                                          ...editingField.pricing?.phase1?.perDate,
                                          [date]: {
                                            ...editingField.pricing?.phase1?.perDate?.[date],
                                            minor8plus: parseInt(e.target.value) || 0
                                          }
                                        }
                                      }
                                    }
                                  })}
                                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                />
                                <input
                                  type="number"
                                  placeholder="만7세↓"
                                  value={editingField.pricing?.phase1?.perDate?.[date]?.minorUnder8 || ''}
                                  onChange={(e) => setEditingField({
                                    ...editingField,
                                    pricing: {
                                      ...editingField.pricing,
                                      phase1: {
                                        ...editingField.pricing?.phase1,
                                        perDate: {
                                          ...editingField.pricing?.phase1?.perDate,
                                          [date]: {
                                            ...editingField.pricing?.phase1?.perDate?.[date],
                                            minorUnder8: parseInt(e.target.value) || 0
                                          }
                                        }
                                      }
                                    }
                                  })}
                                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                        </>
                      )}
                    </div>

                    {/* 2차 등록 가격 */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-green-900">2차 등록 가격</h5>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingField.enablePhase2 !== false}
                            onChange={(e) => setEditingField({
                              ...editingField,
                              enablePhase2: e.target.checked
                            })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">사용</span>
                        </label>
                      </div>

                      {editingField.enablePhase2 !== false && (
                        <>

                      {/* 전체 참석 가격 */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">전체 참석 (총액)</label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            placeholder="성인"
                            value={editingField.pricing?.phase2?.full?.adult || ''}
                            onChange={(e) => setEditingField({
                              ...editingField,
                              pricing: {
                                ...editingField.pricing,
                                phase2: {
                                  ...editingField.pricing?.phase2,
                                  full: {
                                    ...editingField.pricing?.phase2?.full,
                                    adult: parseInt(e.target.value) || 0
                                  }
                                }
                              }
                            })}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                          />
                          <input
                            type="number"
                            placeholder="만8세↑"
                            value={editingField.pricing?.phase2?.full?.minor8plus || ''}
                            onChange={(e) => setEditingField({
                              ...editingField,
                              pricing: {
                                ...editingField.pricing,
                                phase2: {
                                  ...editingField.pricing?.phase2,
                                  full: {
                                    ...editingField.pricing?.phase2?.full,
                                    minor8plus: parseInt(e.target.value) || 0
                                  }
                                }
                              }
                            })}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                          />
                          <input
                            type="number"
                            placeholder="만7세↓"
                            value={editingField.pricing?.phase2?.full?.minorUnder8 || ''}
                            onChange={(e) => setEditingField({
                              ...editingField,
                              pricing: {
                                ...editingField.pricing,
                                phase2: {
                                  ...editingField.pricing?.phase2,
                                  full: {
                                    ...editingField.pricing?.phase2?.full,
                                    minorUnder8: parseInt(e.target.value) || 0
                                  }
                                }
                              }
                            })}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                          />
                        </div>
                      </div>

                      {/* 날짜별 개별 가격 */}
                      <div>
                        <label className="block text-sm font-medium mb-2">날짜별 개별 가격</label>
                        <div className="space-y-3">
                          {(editingField.dateOptions || []).map((date, idx) => (
                            <div key={idx} className="bg-white border border-green-300 rounded-lg p-3">
                              <div className="font-medium text-sm text-gray-700 mb-2">{date}</div>
                              <div className="grid grid-cols-3 gap-2">
                                <input
                                  type="number"
                                  placeholder="성인"
                                  value={editingField.pricing?.phase2?.perDate?.[date]?.adult || ''}
                                  onChange={(e) => setEditingField({
                                    ...editingField,
                                    pricing: {
                                      ...editingField.pricing,
                                      phase2: {
                                        ...editingField.pricing?.phase2,
                                        perDate: {
                                          ...editingField.pricing?.phase2?.perDate,
                                          [date]: {
                                            ...editingField.pricing?.phase2?.perDate?.[date],
                                            adult: parseInt(e.target.value) || 0
                                          }
                                        }
                                      }
                                    }
                                  })}
                                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                />
                                <input
                                  type="number"
                                  placeholder="만8세↑"
                                  value={editingField.pricing?.phase2?.perDate?.[date]?.minor8plus || ''}
                                  onChange={(e) => setEditingField({
                                    ...editingField,
                                    pricing: {
                                      ...editingField.pricing,
                                      phase2: {
                                        ...editingField.pricing?.phase2,
                                        perDate: {
                                          ...editingField.pricing?.phase2?.perDate,
                                          [date]: {
                                            ...editingField.pricing?.phase2?.perDate?.[date],
                                            minor8plus: parseInt(e.target.value) || 0
                                          }
                                        }
                                      }
                                    }
                                  })}
                                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                />
                                <input
                                  type="number"
                                  placeholder="만7세↓"
                                  value={editingField.pricing?.phase2?.perDate?.[date]?.minorUnder8 || ''}
                                  onChange={(e) => setEditingField({
                                    ...editingField,
                                    pricing: {
                                      ...editingField.pricing,
                                      phase2: {
                                        ...editingField.pricing?.phase2,
                                        perDate: {
                                          ...editingField.pricing?.phase2?.perDate,
                                          [date]: {
                                            ...editingField.pricing?.phase2?.perDate?.[date],
                                            minorUnder8: parseInt(e.target.value) || 0
                                          }
                                        }
                                      }
                                    }
                                  })}
                                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                        </>
                      )}
                    </div>

                    {/* 등록 기간 설정 */}
                    {editingField.enablePhase1 !== false && editingField.enablePhase2 !== false && (
                    <div>
                      <label className="block text-sm font-medium mb-2">1차 등록 마감일</label>
                      <input
                        type="date"
                        value={editingField.phase1Deadline || ''}
                        onChange={(e) => setEditingField({ ...editingField, phase1Deadline: e.target.value })}
                        className="w-full border border-gray-300 rounded-md p-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        이 날짜까지는 1차 가격, 이후는 2차 가격이 적용됩니다.
                      </p>
                    </div>
                    )}

                    {/* 식사 옵션 설정 */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h5 className="font-medium text-purple-900 mb-3">날짜별 식사 옵션 설정</h5>
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={editingField.enableMealOptions || false}
                          onChange={(e) => setEditingField({ ...editingField, enableMealOptions: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">날짜별 식사 옵션 활성화</span>
                      </label>
                      <p className="text-xs text-gray-600 mb-3">
                        활성화하면 사용자가 각 날짜별로 식사 옵션(아침 식사 제외, 금식)을 선택할 수 있습니다.
                      </p>

                      {editingField.enableMealOptions && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">식사 옵션 라벨</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="아침 식사 제외"
                              value={editingField.mealLabels?.noBreakfast || '아침 식사 제외'}
                              onChange={(e) => setEditingField({
                                ...editingField,
                                mealLabels: {
                                  ...editingField.mealLabels,
                                  noBreakfast: e.target.value
                                }
                              })}
                              className="w-full border border-gray-300 rounded-md p-2 text-sm"
                            />
                            <input
                              type="text"
                              placeholder="금식"
                              value={editingField.mealLabels?.fasting || '금식'}
                              onChange={(e) => setEditingField({
                                ...editingField,
                                mealLabels: {
                                  ...editingField.mealLabels,
                                  fasting: e.target.value
                                }
                              })}
                              className="w-full border border-gray-300 rounded-md p-2 text-sm"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            식사 옵션의 표시 이름을 커스터마이징할 수 있습니다.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* accommodation-calculator 타입인 경우 숙박 날짜 및 방 타입 설정 */}
                {editingField.type === 'accommodation-calculator' && (
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900">숙박비 설정</h4>

                    {/* 무료 전환 체크박스 옵션 */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-medium text-yellow-900 mb-3">무료 전환 옵션</h5>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingField.enableFreeOption || false}
                            onChange={(e) => setEditingField({
                              ...editingField,
                              enableFreeOption: e.target.checked
                            })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">무료 전환 체크박스 활성화</span>
                        </label>
                        {editingField.enableFreeOption && (
                          <div>
                            <label className="block text-sm font-medium mb-1">체크박스 라벨</label>
                            <input
                              type="text"
                              value={editingField.freeOptionLabel || '무료 (봉사자/스텝)'}
                              onChange={(e) => setEditingField({
                                ...editingField,
                                freeOptionLabel: e.target.value
                              })}
                              className="w-full border border-gray-300 rounded-md p-2"
                              placeholder="예: 무료 (봉사자/스텝)"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 숙박 날짜 옵션 */}
                    <div>
                      <label className="block text-sm font-medium mb-2">숙박 날짜 옵션 (한 줄에 하나씩)</label>
                      <textarea
                        value={(editingField.dateOptions || []).join('\n')}
                        onChange={(e) => {
                          const dateOptions = e.target.value.split('\n');
                          setEditingField({ ...editingField, dateOptions });
                        }}
                        onBlur={(e) => {
                          const dateOptions = e.target.value.split('\n').filter(o => o.trim());
                          setEditingField({ ...editingField, dateOptions });
                        }}
                        className="w-full border border-gray-300 rounded-md p-2 font-mono text-sm"
                        rows={3}
                        placeholder="2025-10-04&#10;2025-10-05&#10;2025-10-06"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        각 날짜는 숙박하는 밤을 의미합니다 (예: 10/4 선택 = 10/4 밤에 숙박)
                      </p>
                    </div>

                    {/* 방 타입 설정 */}
                    <div>
                      <label className="block text-sm font-medium mb-2">방 타입 옵션 (한 줄에 하나씩)</label>
                      <textarea
                        value={(editingField.roomTypes || []).join('\n')}
                        onChange={(e) => {
                          const roomTypes = e.target.value.split('\n');
                          setEditingField({ ...editingField, roomTypes });
                        }}
                        onBlur={(e) => {
                          const roomTypes = e.target.value.split('\n').filter(o => o.trim());
                          setEditingField({ ...editingField, roomTypes });
                        }}
                        className="w-full border border-gray-300 rounded-md p-2 font-mono text-sm"
                        rows={3}
                        placeholder="2인실&#10;30인실"
                      />
                    </div>

                    {/* 방 타입별 추가 옵션 설정 */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h5 className="font-medium text-purple-900 mb-3">방 타입별 추가 옵션 설정</h5>
                      <p className="text-xs text-purple-700 mb-3">
                        각 방 타입이 개인실인지 단체실인지 선택하세요. 단체실은 남녀별 인원 입력을, 개인실은 동숙 인원 수를 받습니다.
                      </p>
                      <div className="space-y-3">
                        {(editingField.roomTypes || []).map((roomType, idx) => (
                          <div key={idx} className="bg-white border border-purple-300 rounded-lg p-3">
                            <div className="font-medium text-gray-900 mb-2">{roomType}</div>
                            <select
                              value={editingField.roomTypeOptions?.[roomType]?.type || 'none'}
                              onChange={(e) => {
                                const optionType = e.target.value;
                                setEditingField({
                                  ...editingField,
                                  roomTypeOptions: {
                                    ...editingField.roomTypeOptions,
                                    [roomType]: optionType === 'none' ? null : { type: optionType }
                                  }
                                });
                              }}
                              className="w-full border border-gray-300 rounded-md p-2 text-sm"
                            >
                              <option value="none">추가 옵션 없음</option>
                              <option value="gender">단체실 (남녀 인원 입력)</option>
                              <option value="count">개인실 (동숙 인원 선택)</option>
                            </select>
                            {editingField.roomTypeOptions?.[roomType]?.type === 'gender' && (
                              <p className="text-xs text-gray-600 mt-1">
                                → 단체실: 사용자가 남자/여자 인원을 각각 입력합니다. 각 인원의 이름, 나이, 전화번호를 받습니다.
                              </p>
                            )}
                            {editingField.roomTypeOptions?.[roomType]?.type === 'count' && (
                              <p className="text-xs text-gray-600 mt-1">
                                → 개인실: 사용자가 함께 숙박할 총 인원 수를 선택합니다.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 1차 등록 가격 */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-medium text-green-900 mb-3">1차 등록 가격 (1박 기준)</h5>
                      <div className="space-y-3">
                        {(editingField.roomTypes || []).map((roomType, idx) => (
                          <div key={idx}>
                            <label className="block text-sm font-medium mb-1">{roomType}</label>
                            <input
                              type="number"
                              placeholder="1박 요금"
                              value={editingField.accommodationPricing?.phase1?.[roomType] || ''}
                              onChange={(e) => setEditingField({
                                ...editingField,
                                accommodationPricing: {
                                  ...editingField.accommodationPricing,
                                  phase1: {
                                    ...editingField.accommodationPricing?.phase1,
                                    [roomType]: parseInt(e.target.value) || 0
                                  }
                                }
                              })}
                              className="w-full border border-gray-300 rounded-md p-2 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2차 등록 가격 */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h5 className="font-medium text-orange-900 mb-3">2차 등록 가격 (1박 기준)</h5>
                      <div className="space-y-3">
                        {(editingField.roomTypes || []).map((roomType, idx) => (
                          <div key={idx}>
                            <label className="block text-sm font-medium mb-1">{roomType}</label>
                            <input
                              type="number"
                              placeholder="1박 요금"
                              value={editingField.accommodationPricing?.phase2?.[roomType] || ''}
                              onChange={(e) => setEditingField({
                                ...editingField,
                                accommodationPricing: {
                                  ...editingField.accommodationPricing,
                                  phase2: {
                                    ...editingField.accommodationPricing?.phase2,
                                    [roomType]: parseInt(e.target.value) || 0
                                  }
                                }
                              })}
                              className="w-full border border-gray-300 rounded-md p-2 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 등록 기간 설정 */}
                    <div>
                      <label className="block text-sm font-medium mb-2">1차 등록 마감일</label>
                      <input
                        type="date"
                        value={editingField.phase1Deadline || ''}
                        onChange={(e) => setEditingField({ ...editingField, phase1Deadline: e.target.value })}
                        className="w-full border border-gray-300 rounded-md p-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        이 날짜까지는 1차 가격, 이후는 2차 가격이 적용됩니다.
                      </p>
                    </div>
                  </div>
                )}

                {/* 필드 ID (읽기 전용, 참고용) */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-500">필드 ID (자동 생성)</label>
                  <input
                    type="text"
                    value={editingField.id}
                    readOnly
                    className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-600 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setEditingField(null)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  onClick={saveField}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
