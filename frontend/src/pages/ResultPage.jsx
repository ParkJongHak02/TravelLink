import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import "./css/ResultPage.css";

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = useOutletContext();

  useEffect(() => {
    if (!username) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
    }
  }, [username, navigate]);

  // ▼▼▼ 1. State 변경 및 추가 ▼▼▼
  const [suggestions, setSuggestions] = useState([]); // 추천 여행지 3곳을 저장할 state
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("추천 여행지를 찾고 있어요..."); // 로딩 중 텍스트
  // ▲▲▲ 1. State 변경 및 추가 ▲▲▲

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerLoading, setAnswerLoading] = useState(false);
  const [memos, setMemos] = useState({});
  const [showMemo, setShowMemo] = useState({});
  const [selectedDay, setSelectedDay] = useState("all");
  const [showMap, setShowMap] = useState(true);
  const [mapQuery, setMapQuery] = useState("");
  const [mapZoom, setMapZoom] = useState(12);

  // =========================
  // ① 챗봇 상태 & 핸들러
  // =========================
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]); // {role:'user'|'ai', content:string}[]
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const GREETING_MSG = "여행 계획에 대해 질문해보세요!";
  const chatScrollRef = useRef(null);   // 👈 스크롤 컨테이너 참조

  const openChat = () => setChatOpen(true);
  const closeChat = () => setChatOpen(false);

  const sendChat = async () => {
    if (!chatInput.trim() || !result) return;
    const q = chatInput.trim();

    // 사용자 메시지 추가
    setChatMessages((m) => [...m, { role: "user", content: q }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ask-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, plan: result }),
      });
      const data = await res.json();
      const a = data.answer || "❌ AI 응답을 받지 못했습니다.";
      setChatMessages((m) => [...m, { role: "ai", content: a }]);
    } catch (e) {
      setChatMessages((m) => [
        ...m,
        { role: "ai", content: "🚨 서버 오류로 답변을 받지 못했습니다." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };


  /** ===== ① 목적지 스코프(국가/국내여부/기본지역) 추출 ===== */
  const deriveScope = (result, location) => {
    const region = pickBaseRegion(result, location);        // ✅ 도시 우선, 플래그 제거
    const countryRaw = scrub(result?.country) || scrub(location.state?.country) || "";

    // 해외 도시 → 국가 추정 (이미 쓰던 맵 + 필요시 추가)
    const foreignCountry = guessForeignCountry(region);

    const hasDomesticHints =
      /(대한민국|Korea|KR)/i.test(countryRaw) ||
      /(서울|부산|대구|인천|광주|대전|울산|세종|제주|경기|강원|충청|전라|경상|특별시|광역시|특별자치)/.test(region);

    const isDomestic = hasDomesticHints && !foreignCountry;
    const country = isDomestic ? "대한민국" : (foreignCountry || countryRaw || "");

    return { region, country, isDomestic };
  };


  /** ===== ② 해외 도시 → 국가 추정(없으면 추가해서 쓰면 됨) ===== */
  const guessForeignCountry = (name = "") => {
    const m = {
      // 일본
      오사카: "Japan", 도쿄: "Japan", 삿포로: "Japan", 후쿠오카: "Japan", 오키나와: "Japan",
      // 중국/홍콩/대만
      홍콩: "Hong Kong", 타이베이: "Taiwan", 상하이: "China", 베이징: "China",
      // 동남아
      방콕: "Thailand", 다낭: "Vietnam", 세부: "Philippines", 발리: "Indonesia", 싱가포르: "Singapore",
      // 유럽
      로마: "Italy", 파리: "France", 런던: "United Kingdom", 바르셀로나: "Spain", 프라하: "Czechia",
      // 미주
      뉴욕: "United States", LA: "United States", 로스앤젤레스: "United States",
    };
    return m[name.trim()] || "";
  };

  /** ===== ③ 국내 검색어 만들기(네가 쓰던 로직 보강) ===== */
  const toKRQuery = (raw) => {
    if (!raw) return "대한민국";
    const name = String(raw).trim();

    // 이미 광역 단위가 있으면 그대로
    if (/(광역시|특별시|특별자치시|특별자치도)/.test(name)) {
      return `대한민국 ${name}`;
    }

    // 광역시/특별시 바로 매핑
    const metro = {
      서울: "서울특별시", 부산: "부산광역시", 대구: "대구광역시", 인천: "인천광역시",
      광주: "광주광역시", 대전: "대전광역시", 울산: "울산광역시", 세종: "세종특별자치시", 제주: "제주특별자치도",
    };
    if (metro[name]) return `대한민국 ${metro[name]}`;

    // 도/특자도 매핑(일부 예시, 필요시 확장)
    const cityToProvince = {
      // 강원특별자치도
      강릉: "강원특별자치도", 속초: "강원특별자치도", 춘천: "강원특별자치도", 원주: "강원특별자치도", 평창: "강원특별자치도",
      // 경상북도/남도
      경주: "경상북도", 포항: "경상북도", 안동: "경상북도", 창원: "경상남도", 김해: "경상남도", 거제: "경상남도", 통영: "경상남도",
      // 전라북/남도
      전주: "전북특별자치도", 군산: "전북특별자치도", 여수: "전라남도", 순천: "전라남도", 광양: "전라남도", 목포: "전라남도",
      // 충청
      청주: "충청북도", 제천: "충청북도", 충주: "충청북도", 천안: "충청남도", 공주: "충청남도", 보령: "충청남도",
      // 경기(예시)
      수원: "경기도", 용인: "경기도", 성남: "경기도", 고양: "경기도",
    };
    const prov = cityToProvince[name];
    const withSuffix = /(시|군|구)$/.test(name) ? name : `${name}시`;
    return prov ? `대한민국 ${prov} ${withSuffix}` : `대한민국 ${withSuffix}`;
  };

  /** ===== ④ 최종 도시 문자열 만들기 (국내/해외 공용) ===== */
  const toCityQuery = (region, scope) => {
    if (scope.isDomestic) return toKRQuery(region);
    return scope.country ? `${scope.country} ${region}` : `${region}`;
  };


  /** ===== ⑤ 모호 키워드 & 도시 중심 대체어 ===== */
  const vagueKeywords = /(숙소|체크인|호텔|펜션|이동|교통|택시|버스|귀가|휴식|휴식시간|집|센터|센터로)/;
  const cityCenterFallback = (scope, cityQuery) =>
    scope.isDomestic ? `${cityQuery} 시청` : `${cityQuery} City Center`;

  /** ===== ⑥ 액티비티 문장 → 지도검색어/줌 ===== */
  const buildQueryForAct = (scope, actText) => {
    const city = toCityQuery(scope.region, scope);
    const text = String(actText || "").trim();

    // 괄호 속 힌트: "(시내/근처/일대)" → 중심 쪽으로
    const inParen = text.match(/\(([^)]+)\)/)?.[1] || "";
    if (inParen && /시내|근처|일대/.test(inParen)) {
      const hint = inParen.replace(/시내|근처|일대/g, "").trim();
      return { q: `${city} ${hint || (scope.isDomestic ? "시청" : "City Center")}`, zoom: 13 };
    }

    // 모호한 문장(숙소/이동 등) → 도시 중심
    if (!/[A-Za-z가-힣]/.test(text) || vagueKeywords.test(text)) {
      return { q: `${city} ${cityCenterFallback(scope, city)}`, zoom: 13 };
    }

    // 명확한 장소가 있으면 상세 검색
    return { q: `${city} ${text}`, zoom: 15 };
  };



  const onChatKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  };


  
  // 말풍선: 닫아도 새로고침 시 다시 보이게
  const [showChatTip, setShowChatTip] = useState(true);
  const closeChatTip = () => setShowChatTip(false);

// ... (파일의 다른 부분은 동일)

  // ▼▼▼ 데이터 로직 변경: 처음에는 추천 여행지(suggestions)를 가져옴 ▼▼▼
  useEffect(() => {
    if (!username || !location.state) return;

    // ✅ 1. 컴포넌트 마운트 상태 추적 변수 추가
    let isMounted = true;

    const fetchSuggestions = async () => {
      setLoading(true);
      setLoadingText("AI가 최적의 여행지를 찾고 있어요...");
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/suggest-locations`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(location.state),
          }
        );
        const data = await res.json();

        // ✅ 2. 마운트 상태일 때만 state 업데이트
        if (isMounted) {
          if (data.locations && data.locations.length > 0) {
            setSuggestions(data.locations);
          } else {
            alert("❌ 추천 여행지를 불러오지 못했어요!\n" + (data.detail || ""));
            navigate("/SurveyForm");
          }
        }

      } catch (err) {
        alert("🚨 서버 연결에 실패했습니다.");
        console.error("서버 오류:", err);
      } finally {
        // ✅ 2. 마운트 상태일 때만 state 업데이트
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSuggestions();

    // ✅ 3. 클린업 함수 반환
    return () => {
      isMounted = false;
    };

  }, [username, location.state, navigate]);
  // ▲▲▲ 데이터 로직 변경 ▲▲▲

  // ... (파일의 나머지 부분은 동일)

  // ▼▼▼ 핸들러 함수 추가: 사용자가 여행지를 선택하면 상세 계획을 요청 ▼▼▼
  const handleSuggestionSelect = async (selectedLocation) => {
    setLoading(true);
    setLoadingText(`'${selectedLocation}' 여행 계획을 생성 중입니다...`);
    setSuggestions([]); // 추천 목록 숨기기

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...location.state, // 기존 설문조사 데이터에
          selectedLocation: selectedLocation, // 사용자가 선택한 위치를 추가해서 보냄
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert("❌ 여행 계획을 만들지 못했어요!\n" + (data.detail || data.error));
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (err) {
      alert("🚨 서버 연결에 실패했습니다.");
      console.error("서버 오류:", err);
    } finally {
      setLoading(false);
    }
  };
  // ▲▲▲ 핸들러 함수 추가 ▲▲▲

  const handleShare = () => {
    const updatedItinerary = { ...result.itinerary };

    Object.entries(updatedItinerary).forEach(([date, activities], dayIndex) => {
      updatedItinerary[date] = activities.map((activity, actIndex) => {
        const memoKey = `${dayIndex + 1}일차-${actIndex}`;
        return {
          ...activity,
          memo: memos[memoKey] || "",
        };
      });
    });

    navigate("/share", {
      state: {
        planData: {
          ...result,
          itinerary: updatedItinerary,
          region: location.state?.region || "",
        },
        username,
      },
    });
  };

  // result가 로드되거나 선택한 일차가 바뀔 때 지도 검색어 갱신
  useEffect(() => {
    if (!result) return;

    const scope = deriveScope(result, location);
    const days = Object.entries(result.itinerary || {});

    if (selectedDay === "all") {
      const city = toCityQuery(scope.region, scope);
      setMapQuery(`${city} ${cityCenterFallback(scope, city)}`);
      setMapZoom(12);               // 도시 레벨
    } else {
      const [, acts] = days[selectedDay] || [];
      const firstAct = acts?.[0]?.activity || "";
      const { q, zoom } = buildQueryForAct(scope, firstAct);
      setMapQuery(q);
      setMapZoom(zoom);
    }
  }, [result, selectedDay, location]);


  useEffect(() => {
    if (!chatOpen) return;
    setChatMessages(prev => [...prev, { role: "ai", content: GREETING_MSG }]);
  }, [chatOpen, GREETING_MSG]);


  // 새 메시지/로딩/열림 상태가 바뀔 때마다 스크롤을 맨 아래로
  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;

    // 레이아웃 반영 직후에 스크롤하기
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [chatMessages, chatLoading, chatOpen]);

  const handleQuestionSubmit = async () => {
    if (!question.trim()) return;

    setAnswerLoading(true);
    setAnswer("");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ask-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          plan: result,
        }),
      });
      const data = await res.json();
      setAnswer(data.answer || "❌ AI 응답을 받지 못했습니다.");
    } catch (err) {
      setAnswer("🚨 서버 오류로 답변을 받지 못했습니다.");
      console.error("질문 에러:", err);
    } finally {
      setAnswerLoading(false);
    }
  };

  const handleMemoChange = (key, value) => {
    setMemos((prev) => ({ ...prev, [key]: value }));
  };

  const handleMemoToggle = (key) => {
    setShowMemo((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMemoSave = (key) => {
    alert("💾 메모가 저장되었습니다!");
  };


  // 컴포넌트 상단의 함수들 근처에 추가
  const handleFocusOnMap = (act) => {
    const scope = deriveScope(result, location);
    const { q, zoom } = buildQueryForAct(scope, act.activity);
    setMapQuery(q);
    setMapZoom(zoom);
  };


  // 플래그 값 정리
  const scrub = (v) =>
    typeof v === "string" && /^(domestic|international)$/i.test(v.trim()) ? "" : (v || "");

  // 도시처럼 보이는지
  const isCityLike = (s) =>
    typeof s === "string" &&
    /[가-힣A-Za-z]/.test(s) &&
    !/^(domestic|international)$/i.test(s.trim());

  // 추천/응답에서 도시 후보 고르기
  const pickBaseRegion = (result, location) => {
    const list = [
      ...(result?.recommendations || []),
      scrub(result?.region),
      scrub(location?.state?.region),
    ];
    return list.find(isCityLike) || "";
  };


  // ▼▼▼ 렌더링 로직 수정 ▼▼▼

  // 1. 로딩 중일 때
  if (loading) {
    return (
      <div className="result-page">
        <div className="spinner-container">
          <div className="dot-spinner"><div></div><div></div><div></div></div>
          <p>{loadingText}</p>
        </div>
      </div>
    );
  }

  // 2. 추천 여행지가 있고, 아직 상세 계획(result)이 없을 때 => 선택 화면 보여주기
  if (!result && suggestions.length > 0) {
    return (
      <div className="result-page suggestion-page">
        <div className="suggestion-container">
          <h2 className="suggestion-title">어디로 떠나볼까요?</h2>
          <p className="suggestion-subtitle">
            AI가 당신의 취향에 맞춰 찾은 여행지예요.
          </p>
          <div className="suggestion-cards">
            {suggestions.map((loc, index) => (
              <button
                key={index}
                className="suggestion-card"
                onClick={() => handleSuggestionSelect(loc)}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. 상세 계획(result)이 로드되었을 때 => 기존 결과 페이지 보여주기
  if (result) {
    return (
      <div className="result-page">
        {/* ====== 메인 3열 레이아웃 ====== */}
        <div className="plans-layout">
          {/* 좌측 사이드바 */}
          <aside className="plans-sidebar" aria-label="일정 선택">
            <h4 className="plans-sidebar-title">일정</h4>
            <ul className="plans-nav">
              <li>
                <button
                  className={`plans-nav-btn ${selectedDay === "all" ? "active" : ""}`}
                  onClick={() => setSelectedDay("all")}
                >
                  전체 일정
                </button>
              </li>
              {Object.entries(result.itinerary || {}).map(([, acts], idx) => (
                <li key={idx}>
                  <button
                    className={`plans-nav-btn ${selectedDay === idx ? "active" : ""}`}
                    onClick={() => setSelectedDay(idx)}
                  >
                    {idx + 1}일차
                  </button>
                </li>
              ))}
            </ul>

            <div className="plans-sidebar-tools">
              <label className="map-toggle">
                <input
                  type="checkbox"
                  checked={showMap}
                  onChange={(e) => setShowMap(e.target.checked)}
                />
                지도 보이기
              </label>
            </div>
          </aside>

          {/* 가운데 본문 */}
          <main className="plans-main">
            {/* 추천 여행지 — 한 줄 */}
            <section className="rec-plain" aria-label="추천 여행지">
              <span className="rec-plain-label">✳ 추천 여행지 :</span>
              <ul className="rec-plain-list">
                {(result.recommendations || []).map((place, i) => (
                  <li key={i}>{place}</li>
                ))}
              </ul>
            </section>

            {/* 여행 일정 (선택된 범위만) */}
            <section aria-labelledby="plan-title">
              <div className="sticky-box"> {/* ← 추가 */}
                <div className="day-cards">
                  {(selectedDay === "all"
                    ? Object.entries(result.itinerary || {})
                    : [Object.entries(result.itinerary || {})[selectedDay]]
                  ).map(([date, activities], index) => {
                    if (!activities) return null; // 혹시 모를 오류 방지
                    const dayNumber =
                      selectedDay === "all" ? index + 1 : Number(selectedDay) + 1;

                    return (
                      <article className="day-card" key={date || dayNumber}>
                        <header>
                          <h4>{dayNumber}일차</h4>
                        </header>
                        <ol className="activity-list">
                          {activities.map((act, idx) => {
                            const memoKey = `${dayNumber}일차-${idx}`;
                            const memoOpen = !!showMemo[memoKey];
                            const memoId = `memo-${dayNumber}-${idx}`;
                            const memoInputId = `memo-input-${dayNumber}-${idx}`;

                            return (
                              <li key={idx}>
                                <span className="badge">{act.time}</span>
                                {/* 👇 이 부분을 클릭 가능하게 */}
                                <button
                                  type="button"
                                  className="activity-link"
                                  onClick={() => handleFocusOnMap(act)}
                                  aria-label={`${act.time} ${act.activity} 위치 보기`}
                                >
                                  {act.activity}
                                </button>

                                <button
                                  type="button"
                                  className="memo-toggle-btn"
                                  onClick={() => handleMemoToggle(memoKey)}
                                  aria-expanded={memoOpen}
                                  aria-controls={memoId}
                                >
                                  {memoOpen ? "▲ 메모 닫기" : "▼ 메모 열기"}
                                </button>

{memoOpen && (
  <>
    <div className="memo-section" id={memoId}>
      <textarea
        id={memoInputId}
        placeholder="메모를 입력하세요"
        value={memos[memoKey] || ""}
        onChange={(e) => handleMemoChange(memoKey, e.target.value)}
        className="memo-textarea"
        aria-label={`${dayNumber}일차 ${idx + 1}번째 일정 메모 입력`}
      />
    </div>
    <button
      type="button"
      className="memo-save-btn"
      onClick={() => handleMemoSave(memoKey)}
      aria-controls={memoId}
    >
      저장
    </button>
  </>
)}
                              </li>
                            );
                          })}
                        </ol>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          </main>

          {/* 우측 지도 */}
          {showMap && (
            <aside className="plans-map" aria-label="지도">
              <div className="sticky-box"> {/* ← 추가 */}
                <div className="map-card">
                  <div className="map-header">
                    <strong>지도</strong>
                    <small className="map-sub">
                      {mapQuery ? `"${mapQuery}" 중심` : "지역 미정"}
                    </small>
                  </div>
                  <div className="map-frame">
                    <iframe
                      title="plan-map"
                      src={
                        mapQuery
                          ? `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&hl=ko&z=${mapZoom}&output=embed`
                          : `https://maps.google.com/maps?q=${encodeURIComponent("대한민국")}&hl=ko&z=${mapZoom}&output=embed`
                      }
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* 📤 공유 및 리셋 버튼 */}
        <div
          className="floating-buttons"
          role="group"
          aria-label="공유 및 다시 계획"
        >
          <button className="share-btn" onClick={handleShare}>
            계획 공유 하기
          </button>
          <button
            className="reset-btn"
            onClick={() => navigate("/SurveyForm")}
          >
            계획 다시 짜기
          </button>
        </div>

        {/* 말풍선 (닫아도 새로고침 시 다시 보임) */}
        {showChatTip && (
          <div
            className="chatbot-tip"
            role="status"
            onClick={openChat}
            title="여행 상담 봇 열기"
          >
            <p className="chatbot-tip-text">TL봇에게 물어보세요!</p>
          </div>
        )}

        {/* 상담사(챗봇) FAB — 아이콘만 */}
        <button
          className="chatbot-fab"
          type="button"
          aria-label="여행 상담봇 열기"
          onClick={openChat}
          title="여행 상담봇"
        >
          <img
            src="/images/chatbot.png"
            alt=""
            aria-hidden="true"
            className="chatbot-icon"
          />
        </button>

        {/* 우측 하단 슬라이드 채팅 패널 */}
        <div
          className={`chat-panel ${chatOpen ? "open" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-title"
        >
          <div className="chat-header">
            <div className="agent">
              <span className="avatar" aria-hidden="true">
                🤖
              </span>
              <div>
                <strong id="chat-title">여행 상담봇</strong>
                <div className="sub">현재 계획을 바탕으로 답해드려요</div>
              </div>
            </div>
            <button
              className="chat-close"
              aria-label="채팅창 닫기"
              onClick={closeChat}
            >
              ✕
            </button>
          </div>

          <div className="chat-messages" id="chat-scroll" aria-live="polite" ref={chatScrollRef}>
            {chatMessages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <p>{m.content}</p>
              </div>
            ))}
            {chatLoading && (
              <div className="msg ai typing">
                <p>답변 작성 중…</p>
              </div>
            )}
          </div>

          <div className="chat-input-row">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={onChatKeyDown}
              placeholder="질문을 입력하세요."
              aria-label="상담봇 질문 입력"
            />
            <button
              className="chat-send"
              onClick={sendChat}
              disabled={chatLoading || !chatInput.trim()}
              aria-label="전송"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. 모든 조건에 해당하지 않을 경우 (예: 에러 후)
  return (
    <div className="result-page">
      <div className="spinner-container">
        <p>여행 계획을 불러오는 데 실패했습니다. 다시 시도해주세요.</p>
        <button className="reset-btn" onClick={() => navigate("/SurveyForm")}>
          계획 다시 짜기
        </button>
      </div>
    </div>
  );
  // ▲▲▲ 렌더링 로직 수정 ▲▲▲
};

export default ResultPage;