"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const res = await fetch("/api/faq");
      if (!res.ok) throw new Error("FAQ 조회 실패");
      const data = await res.json();
      setFaqs(data.faqs || []);
    } catch (error) {
      console.error("FAQ 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">자주 묻는 질문 (FAQ)</h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            홈으로
          </Link>
        </div>
        <p className="text-gray-600">
          궁금하신 내용을 확인해보세요. 질문을 클릭하면 답변을 볼 수 있습니다.
        </p>
      </div>

      {/* FAQ 목록 */}
      {faqs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">등록된 FAQ가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* 질문 */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shrink-0 mt-0.5">
                    Q
                  </span>
                  <span className="font-semibold text-gray-900">
                    {faq.question}
                  </span>
                </div>
                <svg
                  className={`w-6 h-6 text-gray-500 transition-transform shrink-0 ml-2 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* 답변 */}
              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold shrink-0">
                      A
                    </span>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 추가 문의 안내 */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-2 text-center">
          더 궁금한 사항이 있으신가요?
        </h3>
        <p className="text-blue-700 text-center mb-4">
          카카오채널로 문의해주시면 친절히 답변드리겠습니다.
        </p>
        <div className="text-center">
          <a
            href="http://pf.kakao.com/_zCjxdn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-3 rounded-lg transition-colors"
          >
            카카오채널 @again1907 문의하기
          </a>
        </div>
      </div>
    </div>
  );
}
