// About.jsx
import React from 'react';
import '../pages/css/About.css';

const features = [
  {
    title: 'AI 맞춤 여행 추천',
    status: '자동 추천',
    description: 'AI가 여행 스타일과 취향을 분석해 최적의 여행지를 제안합니다.',
    position: 'top'
  },
  {
    title: '일정 & 동행 매칭',
    status: '핵심 기능',
    description: '동행자를 자동 매칭하고 함께 일정을 짤 수 있어요.',
    position: 'bottom'
  },
  {
    title: '여행 정보 제공',
    status: '실시간 업데이트',
    description: '현지 날씨, 교통, 인기 장소를 바로 확인할 수 있어요.',
    position: 'top'
  },
  {
    title: '블로그 & 리뷰 추천',
    status: 'SNS 기반',
    description: '인기 여행 블로그와 사용자 후기를 기반으로 여행지를 탐색해요.',
    position: 'bottom'
  },
  {
    title: '테마별 여행 탐색',
    status: '다양한 취향',
    description: '힐링, 액티비티, 캠핑 등 나에게 맞는 여행을 쉽게 찾을 수 있어요.',
    position: 'top'
  },
  {
    title: '여행 스타일 설문',
    status: '간단 설문',
    description: '짧은 설문을 통해 당신의 취향을 파악 후, 정밀한 여행지를 추천해요.',
    position: 'bottom'
  },
  {
    title: '맛집 큐레이션',
    status: '로컬 기반',
    description: '현지에서 인기 있는 로컬 맛집을 AI가 자동 선별해 추천해드려요.',
    position: 'top'
  }
];

const About = () => {
  return (
    <div className="timeline-wrapper">
      <div className="hero-section">
  <img
    src="/images/your-hero-background.jpg"
    alt="배경 이미지"
    className="background-image"
  />

  {/* 텍스트 */}
  <div className="hero-content">
    <h1 className="main-title">서비스 소개</h1>
    <p className="main-subtitle">Travel Link / 여행과 사람을 잇는, 새로운 연결의 시작</p>
  </div>

  {/* 곡선 */}
  <div className="hero-curve">
    <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
      <path d="M0,0 C480,100 960,100 1440,0 L1440,100 L0,100 Z" fill="white" />
    
    </svg>
    
  </div>
  




        <div className="timeline-section">
          <h2 className="timeline-title">Travel Link가 특별한 이유</h2>
          <p className="timeline-subtitle">사용자 중심의 AI 기반 여행 경험을 제공합니다.</p>

          <div className="timeline">
            <div className="timeline-line"></div>
            {features.map((item, index) => (
              <div
                key={index}
                className={`timeline-item ${item.position}`}
                style={{ left: `${(index / (features.length - 1)) * 100}%` }}
              >
                <div className="dot"></div>
                <div className="timeline-card">
                  <h3>{item.title} <span className="status">{item.status}</span></h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="info-block user-growth">
          <div className="user-growth-left">
            <h3 className="section-title">
              누적 이용자 수 <span className="highlight">350,000명</span>
            </h3>
            <p className="user-desc"><strong>전국 대학생 10명 중 1명</strong>이 사용한 Travel Link</p>
            <p className="user-detail">AI 맞춤 여행 추천 사용 경험 보유</p>
            <p className="user-detail">여행 동행 매칭 시스템 15만 건 이상 활용</p>
          </div>
          <div className="user-growth-right">
            <img src="/images/사람.png" alt="누적 사용자 수 인포그래픽" />
          </div>
        </section>

        {/* ✅ 회색 선 분리 */}
        

        <section className="bar-chart-extended">
          <h3 className="chart-title">여행 추천 수 연도별 증가</h3>
          <div className="bars">
            <div className="bar">
              <div className="bar-inner-wrapper">
                <div className="bar-inner" style={{ height: '30%' }}></div>
              </div>
              <div className="bar-value">24만 건</div>
              <span>2021</span>
            </div>

            <div className="bar">
              <div className="bar-inner-wrapper">
                <div className="bar-inner" style={{ height: '50%' }}></div>
              </div>
              <div className="bar-value">36만 건<br /><small>+50%</small></div>
              <span>2022</span>
            </div>

            <div className="bar">
              <div className="bar-inner-wrapper">
                <div className="bar-inner" style={{ height: '75%' }}></div>
              </div>
              <div className="bar-value">63만 건<br /><small>+75%</small></div>
              <span>2023</span>
            </div>

            <div className="bar">
              <div className="bar-inner-wrapper">
                <div className="bar-inner active" style={{ height: '90%' }}></div>
              </div>
              <div className="bar-value">90만 건<br /><small>+43%</small></div>
              <span>2024</span>
            </div>
          </div>
        </section>

        <div className="section-divider"></div>

        {/* ✅ 회색선과 독립된 버블 구조 */}
        <section className="feature-bubbles-horizontal">
          <div className="bubble-left">
            <div className="bubble-container">
              <div className="bubble big highlight-bubble">동행 매칭<br /><strong>45%</strong></div>
              <div className="bubble medium">여행 일정<br /><strong>25%</strong></div>
              <div className="bubble small">맛집 추천<br /><strong>15%</strong></div>
              <div className="bubble smaller">스타일 설문<br /><strong>10%</strong></div>
            </div>
          </div>

          <div className="bubble-right">
            <p className="circle-summary-right">
              가장 많이 사용된 기능은<br />
              <strong>동행 매칭</strong>
            </p>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-left">
            <p className="footer-title">
              여행은 혼자보단 함께! <b>Travel Link</b>와 함께 떠나보세요.
            </p>
            <div className="footer-links">
              <a href="/about">서비스 소개</a>
              <a href="/faq">자주 묻는 질문</a>
              <a href="/contact">문의하기</a>
            </div>
          </div>

          <div className="footer-right">
            <p>(주)트래블링크  고객센터 : 031-123-4567 | 전화 : 오전 9시 ~ 새벽 1시 운영</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>주소 : 경기도 성남시 중원구 광명로 377 1F | 대표이사 : TRAVEL KIM | 사업자등록번호 : 123-45-67890 사업자정보확인</p>
          <p>전자우편주소 : support@travellink.kr | 전화번호 : 031-123-4567 | 호스팅서비스제공자의 상호 표시 : (주)트래블링크</p>
          <p>(주)트래블링크는 여행 일정을 제안하고 맞춤형 계획을 제공하는 플랫폼이며, 실제 상품의 예약·결제 및 이용에 대한 책임은 각 판매자에게 있습니다.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
