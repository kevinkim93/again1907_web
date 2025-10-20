'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FormsManagementPage() {
  const router = useRouter();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchForms = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/forms');
    const data = await res.json();
    setForms(data.forms || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const createForm = async () => {
    const name = prompt('새 폼 이름을 입력하세요:');
    if (!name) return;

    await fetch('/api/admin/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: '' }),
    });

    fetchForms();
  };

  const deleteForm = async (formId, formName) => {
    if (!confirm(`"${formName}" 폼을 삭제하시겠습니까?\n\n이 폼으로 등록된 모든 데이터는 그대로 유지되지만, 새로운 등록은 받을 수 없습니다.`)) {
      return;
    }

    await fetch('/api/admin/forms', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formId }),
    });

    fetchForms();
  };

  const toggleEnabled = async (formId, currentEnabled) => {
    await fetch('/api/admin/forms', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formId, updates: { enabled: !currentEnabled } }),
    });

    fetchForms();
  };

  const moveForm = async (formId, direction) => {
    const index = forms.findIndex(f => f.id === formId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === forms.length - 1) return;

    const newForms = [...forms];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newForms[index], newForms[targetIndex]] = [newForms[targetIndex], newForms[index]];

    // order 업데이트
    const updates = newForms.map((form, i) => ({
      formId: form.id,
      order: i,
    }));

    for (const update of updates) {
      await fetch('/api/admin/forms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: update.formId, updates: { order: update.order } }),
      });
    }

    fetchForms();
  };

  if (loading) {
    return (
      <main className="p-6">
        <p>로딩 중...</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">등록 폼 관리</h1>
        <button
          onClick={createForm}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + 새 폼 만들기
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-yellow-900 mb-2">💡 사용 방법</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• 폼을 만들고 &quot;편집&quot; 버튼을 눌러 필드를 추가하세요</li>
          <li>• 활성화된 폼만 사용자 등록 페이지에 표시됩니다</li>
          <li>• 순서를 변경하면 등록 페이지의 탭 순서가 바뀝니다</li>
          <li>• 폼 삭제 시 기존 등록 데이터는 유지됩니다</li>
        </ul>
      </div>

      {forms.length === 0 ? (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">등록된 폼이 없습니다</p>
          <button
            onClick={createForm}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            첫 폼 만들기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((form, index) => (
              <div
                key={form.id}
                className={`bg-white border rounded-lg p-6 shadow-sm ${
                  form.enabled ? 'border-blue-300' : 'border-gray-300 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{form.name}</h3>
                    {form.description && (
                      <p className="text-sm text-gray-600">{form.description}</p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    form.enabled
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {form.enabled ? '활성화' : '비활성화'}
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <p>필드 수: {form.fields?.length || 0}개</p>
                  <p className="text-xs text-gray-500 mt-1">
                    생성일: {form.createdAt?.split('T')[0] || '-'}
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => router.push(`/admin/forms/${form.id}/edit`)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    편집
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleEnabled(form.id, form.enabled)}
                      className={`flex-1 px-4 py-2 rounded text-sm ${
                        form.enabled
                          ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          : 'bg-green-100 hover:bg-green-200 text-green-700'
                      }`}
                    >
                      {form.enabled ? '비활성화' : '활성화'}
                    </button>
                    <button
                      onClick={() => deleteForm(form.id, form.name)}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded text-sm"
                    >
                      삭제
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => moveForm(form.id, 'up')}
                      disabled={index === 0}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ↑ 위로
                    </button>
                    <button
                      onClick={() => moveForm(form.id, 'down')}
                      disabled={index === forms.length - 1}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ↓ 아래로
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </main>
  );
}
