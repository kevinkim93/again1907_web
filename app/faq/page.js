"use client";

import { useState } from "react";

const faqs = [
  {
    category: "등록",
    items: [
      {
        q: "등록은 어떻게 해야 하나요?",
        a: "홈페이지(www.again1907.com)에서 신청 가능합니다. 신청 후 등록비를 계좌로 입금해 주세요.\n등록 기간: 2024.10.28(월) ~ 2024.12.31(화) (선착순 등록)",
      },
      {
        q: "등록 변경/취소 하고 싶습니다.",
        a: "등록 변경/취소는 카카오채널 @again1907로 문의해 주세요.",
      },
      {
        q: "가족 단위 등록은 어떻게 하나요?",
        a: "가족단위 등록은 홈페이지 메뉴 '등록하기'의 '가족 신청'을 통해 신청해 주세요. 대표 등록자 이름으로 입금 시 가족 모두의 등록이 완료됩니다.",
      },
      {
        q: "단체등록은 어떻게 하나요?",
        a: "단체등록(10인 이상)은 홈페이지 메뉴 '단체등록'에서 신청서를 작성해 주세요.",
      },
      {
        q: "부분참가는 얼마인가요?",
        a: "부분참가비는 1일 참가 기준으로 책정되며, 숙소 포함 여부에 따라 상이합니다.\n숙소제공: 5만원 / 숙소 미제공: 3만원",
      },
    ],
  },
  {
    category: "숙소",
    items: [
      {
        q: "숙소는 어떻게 배정되나요?",
        a: "가족, 교회, 지역 단위로 최대한 배정되며, 개별 사정에 따라 조정될 수 있습니다.",
      },
      {
        q: "방 배정은 언제 되나요?",
        a: "1월 6일 행사 당일 현장에서 배정됩니다.",
      },
      {
        q: "숙소에 침대가 있나요?",
        a: "2인용 싱글 침대 2개가 구비되어 있습니다.",
      },
      {
        q: "숙소에 개별 화장실이 있나요?",
        a: "방마다 개별 화장실과 기본 세면도구가 제공됩니다.",
      },
    ],
  },
  {
    category: "기타",
    items: [
      {
        q: "캠프 당일 접수는 어떻게 진행되나요?",
        a: "접수 시간은 오후 3시부터이며, 현장에서 안내해 드립니다.",
      },
      {
        q: "유치부/초등부 프로그램이 있나요?",
        a: "네, 별도 장소에서 유치부/초등부 프로그램이 진행됩니다.",
      },
      {
        q: "온라인 예배는 어떻게 볼 수 있나요?",
        a: "홈페이지에서 실시간 예배 영상이 제공됩니다.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  let index = 0;

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">자주 묻는 질문 (FAQ)</h1>

      {faqs.map((group, gIdx) => (
        <div key={gIdx} className="mb-10">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">{group.category}</h2>
          <div className="space-y-3">
            {group.items.map((item, iIdx) => {
              const currentIndex = index++;
              return (
                <div
                  key={iIdx}
                  className="border rounded-md bg-white shadow-sm"
                >
                  <button
                    onClick={() => toggle(currentIndex)}
                    className="w-full flex justify-between items-center p-4 text-left"
                  >
                    <span className="font-medium text-gray-800">{item.q}</span>
                    <span className="ml-2 text-blue-500">
                      {openIndex === currentIndex ? "▲" : "▼"}
                    </span>
                  </button>
                  {openIndex === currentIndex && (
                    <div className="px-4 pb-4 text-gray-600 whitespace-pre-line">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
