import { useEffect, useState, useRef } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import axios from 'axios';
import '../pages/css/Home.css';

const Home = () => {
  const [username, setUsername] = useState(null);

  const blogSliderRef = useRef(null);
  const sectionContainerRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation(); 
  
  // ✅ 로그인 상태 확인 (유지)
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/user`, { withCredentials: true })
      .then((res) => {
        if (res.data.loggedIn) {
          setUsername(res.data.username);
        } else {
          setUsername(null);
        }
      })
      .catch(() => setUsername(null));
  }, []);

  // 🔽 handlePlanClick 함수 제거 (또는 단순화)
  // 버튼에서 직접 navigate를 사용하므로 이 함수는 더 이상 필요하지 않습니다.
  /*
  const handlePlanClick = () => {
    if (username) {
      navigate('/SurveyForm');
    } else {
      alert('로그인이 필요합니다.');
      navigate('/login', {
        state: { modal: true, backgroundLocation: location }
      });
    }
  };
  */

  const handleMenuClick = () => navigate('/menu'); // (유지)

  // 블로그 수평 슬라이더 (유지)
  const scrollLeft = () => {
    if (blogSliderRef.current) {
      blogSliderRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };
  const scrollRight = () => {
    if (blogSliderRef.current) {
      blogSliderRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  // 사이드 도트 내비게이션 (유지)
  const goToSection = (index) => {
    const container = sectionContainerRef.current;
    if (!container) return;
    const sections = container.querySelectorAll('.fp-section');
    const target = sections[index];
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  // 현재 섹션 인덱스 계산 (유지)
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const container = sectionContainerRef.current;
    if (!container) return;
    const handler = () => {
      const sections = Array.from(container.querySelectorAll('.fp-section'));
      const mid = container.scrollTop + window.innerHeight / 2;
      const idx = Math.max(
        0,
        sections.findIndex((el) => el.offsetTop <= mid && el.offsetTop + el.offsetHeight > mid)
      );
      setActiveIdx(idx === -1 ? 0 : idx);
    };
    container.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => container.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="fp-container" ref={sectionContainerRef}>
      {/* ====== 섹션 1 : TRING 스타일 Hero ====== */}
      <section
        className="fp-section hero-section parallax"
        style={{ backgroundImage: "url('/images/your-hero-background1.jpg')" }}
      >
        {/* ⬇️ 헤더 제거하고, Hero 내부 왼쪽 상단 로고 고정 */}


        <div className="hero-inner">
          <h1 className="hero-title">여행과 사람을 잇는, Travel Link</h1>
          <p className="hero-sub">
            여행을 함께 할 사람을 찾고,<br />AI가 당신에게 딱 맞는 여행지를 추천해드립니다.
          </p>

          <div className="hero-cta-col">


            {/* 🔽 수정된 부분: username 확인 로직 제거 및 단순 이동 */}
            <button className="ghost-btn" onClick={() => navigate('/SurveyForm')}>
                계획 작성하기
            </button>
            
          </div>
        </div>
      </section>

{/* ====== 섹션 2 : 남이 짜놓은 여행 계획 보기 ====== */}
<section
  className="fp-section hero-section parallax hero-left"
  style={{ backgroundImage: "url('/images/2-1.jpg')" }}
>
  <div className="hero-inner">
    <h1 className="hero-title">검증된 동선, <br />한번에 모아보기</h1>
    <p className="hero-sub">
      커뮤니티 기반 인기 플랜을<br /> 빠르게 살펴보세요.
    </p>

    <div className="hero-cta-col">
      <button className="ghost-btn" onClick={() => navigate('/PlanList')}>
        플랜 보러가기
      </button>
    </div>
  </div>
</section>

{/* ====== 섹션 3 : AI가 추천하는 주변 맛집 ====== */}
<section
  className="fp-section hero-section parallax hero-left"
  style={{ backgroundImage: "url('/images/food-2-2.jpg')" }}
>
  <div className="hero-inner">
    <h1 className="hero-title">AI가 추천하는 맛집</h1>
    <p className="hero-sub">
      지금 있는 곳 주변의 인기 맛집을<br />AI가 똑똑하게 골라드려요.
    </p>

    <div className="hero-cta-col">
      <button className="ghost-btn" onClick={handleMenuClick}> 
        주변 맛집 보러가기
      </button>
    </div>
  </div>
</section>


      
      {/* ====== 섹션 4 : 서비스 소개(히어로) ====== */}
<section
  className="fp-section about-hero-section parallax"
  style={{ backgroundImage: "url('/images/섹션4.jpg')" }}  // 원하는 배경으로 교체
>
  <div className="hero-inner hero-inner--left">
    <h1 className="hero-title">
      혼자 고민 말고,<br />
      함께 떠나요
    </h1>
    <p className="hero-sub">
      취향을 알면, 여정이 쉬워져요.<br />
      AI가 맞춤 일정과 동행을 찾아드립니다.
    </p>

    <button className="ghost-btn" onClick={() => navigate('/about')}>
      서비스 소개
    </button>
  </div>
</section>


     
      {/* ====== 섹션 5 : 푸터(회사/고객센터) ====== */}
      <section className="fp-section footer-section">
  <div className="footer">

    {/* 상단: 왼쪽 아이콘 / 오른쪽 헤드라인 */}
    <div className="footer-top">
      <div className="footer-left">
        <ul className="footer-social">
          <li><a href="/kakao" aria-label="카카오톡"><img src="/images/카톡.png" alt="KakaoTalk" /></a></li>
          <li><a href="/linkedin" aria-label="LinkedIn"><img src="/images/인스타.png" alt="Insta" /></a></li>
          <li><a href="/blog" aria-label="블로그"><img src="/images/블로그.png" alt="Blog" /></a></li>
        </ul>
      </div>

      <div className="footer-right">
        <h2 className="footer-hero">
          설레는 여행을,<br />서로의 연결로 완성하다
        </h2>
        <p className="footer-sub">(주)트래블링크</p>
      </div>
    </div>

    {/* 링크/안내 행 */}
    <div className="footer-links-row">
            <div className="links-right">
        <p>(주)트래블링크  고객센터 : 031-123-4567 | 전화 : 오전 9시 ~ 새벽 1시 운영</p>
      </div>
      <div className="links-left">
        <div className="footer-links">
          <a href="/about">서비스 소개</a>
          <a href="/faq">자주 묻는 질문</a>
          <a href="/contact-list">문의페이지</a>
          <a href="/admin">관리자 페이지</a>
        </div>
      </div>

    </div>

    {/* 하단 사업자 정보 */}
    <div className="footer-bottom">
      <p>주소 : 경기도 성남시 중원구 광명로 377 1F | 대표이사 : TRAVEL KIM | 사업자등록번호 : 123-45-67890 사업자정보확인</p>
      <p>전자우편주소 : support@travellink.kr | 전화번호 : 031-123-4567 | 호스팅서비스제공자의 상호 표시 : (주)트래블링크</p>
      <p>(주)트래블링크는 여행 일정을 제안하고 맞춤형 계획을 제공하는 플랫폼이며, 실제 상품의 예약·결제 및 이용에 대한 책임은 각 판매자에게 있습니다.</p>
    </div>

  </div>
</section>


{/* 사이드 도트 내비게이션 */}
<div className="dot-nav" aria-label="섹션 바로가기">
  {[0, 1, 2, 3, 4].map((i) => (
    <button
      key={i}
      className={`dot-btn ${activeIdx === i ? 'is-active' : ''}`}
      aria-label={`섹션 ${i + 1}로 이동`}
      onClick={() => goToSection(i)}
    />
  ))}
</div>

    </div>
  );
};

export default Home;