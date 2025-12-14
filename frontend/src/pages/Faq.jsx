import React, { useState } from 'react';
import '../pages/css/Faq.css';

const faqData = [
  {
    category: '서비스',
    icon: '🧭',
    question: 'Travel Link는 어떤 서비스인가요?',
    answer: 'AI가 여행지를 추천하고, 동행자 매칭을 도와주는 여행 플랫폼입니다.',
  },
  {
    category: '서비스',
    icon: '💸',
    question: 'Travel Link는 무료인가요?',
    answer: '기본 기능은 무료이며, 프리미엄 기능은 유료로 제공됩니다.',
  },
  {
    category: '이용방법',
    icon: '👥',
    question: '동행자는 어떻게 매칭되나요?',
    answer: '설문을 통해 일정, 지역, 성향 등을 분석해 비슷한 여행자를 연결해줍니다.',
  },
  {
    category: '이용방법',
    icon: '🔁',
    question: '설문은 여러 번 할 수 있나요?',
    answer: '네, 로그인한 유저는 원하는 만큼 설문을 반복할 수 있습니다.',
  },
  {
    category: '기술',
    icon: '🤖',
    question: 'AI 추천이 신뢰할 수 있나요?',
    answer: 'Travel Link는 수천 건의 데이터를 기반으로 분석해 신뢰성 있는 결과를 제공합니다.',
  },
  {
    category: '서비스',
    icon: '🧳',
    question: 'Travel Link는 어떤 여행지를 추천하나요?',
    answer: '국내외 다양한 도시, 휴양지, 모험 여행지까지 개인 성향에 맞춰 추천합니다.',
  },
  {
    category: '이용방법',
    icon: '📝',
    question: '회원 가입 없이 이용할 수 있나요?',
    answer: '일부 기능은 비회원도 이용 가능하지만, 동행자 매칭 등은 회원가입이 필요합니다.',
  },
  {
    category: '기술',
    icon: '🔒',
    question: '개인 정보는 안전하게 보호되나요?',
    answer: 'Travel Link는 개인정보 보호를 최우선으로 하며, 안전한 시스템을 구축하고 있습니다.',
  },
];

const categories = ['전체', '서비스', '이용방법', '기술'];

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleQuestion = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  const filteredFaqs = faqData.filter(faq =>
    (selectedCategory === '전체' || faq.category === selectedCategory) &&
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="faq-wrapper">
      <div className="faq-header">
        <h1>❓ 자주 묻는 질문</h1>
        <p>Travel Link를 이용하면서 가장 많이 물어보는 것들입니다.</p>

        {/* 검색창 */}
        <input
          type="text"
          className="faq-search"
          placeholder="키워드로 검색해보세요 (예: AI, 설문, 동행자)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* 카테고리 버튼 */}
        <div className="faq-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`faq-category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 질문 리스트 */}
      <div className="faq-accordion">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <div className="faq-question" onClick={() => toggleQuestion(index)}>
                <span className="faq-icon">{faq.icon}</span>
                {faq.question}
                <span className="arrow">{activeIndex === index ? '▲' : '▼'}</span>
              </div>
              {activeIndex === index && (
                <div className="faq-answer">{faq.answer}</div>
              )}
            </div>
          ))
        ) : (
          <p className="no-result">🔍 해당 키워드에 대한 질문이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default Faq;
