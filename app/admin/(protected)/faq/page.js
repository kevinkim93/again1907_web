"use client";

import { useState, useEffect } from "react";

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ question: "", answer: "", order: 0 });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const res = await fetch("/api/admin/faq");
      if (!res.ok) throw new Error("FAQ 조회 실패");
      const data = await res.json();
      setFaqs(data.faqs || []);
    } catch (error) {
      console.error("FAQ 조회 오류:", error);
      alert("FAQ를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({ question: "", answer: "", order: faqs.length });
  };

  const handleEdit = (faq) => {
    setEditingId(faq.id);
    setFormData({ question: faq.question, answer: faq.answer, order: faq.order });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ question: "", answer: "", order: 0 });
  };

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert("질문과 답변을 입력해주세요.");
      return;
    }

    try {
      if (isAdding) {
        // 추가
        const res = await fetch("/api/admin/faq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("FAQ 추가 실패");
        alert("FAQ가 추가되었습니다.");
      } else if (editingId) {
        // 수정
        const res = await fetch("/api/admin/faq", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...formData }),
        });
        if (!res.ok) throw new Error("FAQ 수정 실패");
        alert("FAQ가 수정되었습니다.");
      }

      handleCancel();
      fetchFAQs();
    } catch (error) {
      console.error("FAQ 저장 오류:", error);
      alert("FAQ 저장에 실패했습니다.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch("/api/admin/faq", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("FAQ 삭제 실패");
      alert("FAQ가 삭제되었습니다.");
      fetchFAQs();
    } catch (error) {
      console.error("FAQ 삭제 오류:", error);
      alert("FAQ 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">FAQ 관리</h1>
        <button
          onClick={handleAdd}
          disabled={isAdding || editingId}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          + FAQ 추가
        </button>
      </div>

      {/* 추가 폼 */}
      {isAdding && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">새 FAQ 추가</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">순서</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">질문</label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="질문을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">답변</label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 h-32"
                placeholder="답변을 입력하세요"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                저장
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ 목록 */}
      <div className="space-y-4">
        {faqs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">등록된 FAQ가 없습니다.</p>
          </div>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="bg-white border border-gray-200 rounded-lg p-6">
              {editingId === faq.id ? (
                // 수정 모드
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">순서</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">질문</label>
                    <input
                      type="text"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">답변</label>
                    <textarea
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 h-32"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      저장
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                // 보기 모드
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                          순서: {faq.order}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Q. {faq.question}</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">A. {faq.answer}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(faq)}
                      disabled={isAdding || editingId}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      disabled={isAdding || editingId}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
