import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/css/PlanList.css";

const domesticLocations = ["서울", "부산", "전주", "제주도", "강릉"];
const overseasLocations = ["일본", "베트남", "태국", "대만", "유럽"];

const ITEMS_PER_PAGE = 20;
const PAGE_NUMBER_LIMIT = 5; // 한 번에 보여줄 페이지 번호의 수

const PlanList = () => {
  const [plans, setPlans] = useState([]);
  const [sortOrder, setSortOrder] = useState("latest");
  const [recruitmentStatus, setRecruitmentStatus] = useState("all");
  const [activeLocation, setActiveLocation] = useState("all");
  const [openCategory, setOpenCategory] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/plans`)
      .then((res) => res.json())
      .then((data) => setPlans(data))
      .catch((err) => console.error("불러오기 실패", err));
  }, []);

  const toggleCategory = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setAppliedSearchTerm(searchInput);
  };

  const filteredAndSortedPlans = useMemo(() => {
    let filtered = [...plans];
    if (appliedSearchTerm.trim() !== "") {
      const lowercasedTerm = appliedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (plan) =>
          plan.title?.toLowerCase().includes(lowercasedTerm) ||
          plan.destination?.toLowerCase().includes(lowercasedTerm) ||
          plan.username?.toLowerCase().includes(lowercasedTerm)
      );
    }
    if (activeLocation !== "all") {
      filtered = filtered.filter((plan) =>
        plan.destination?.includes(activeLocation)
      );
    }
    if (recruitmentStatus === "open") {
      filtered = filtered.filter((plan) => plan.participants < plan.capacity);
    } else if (recruitmentStatus === "closed") {
      filtered = filtered.filter((plan) => plan.participants >= plan.capacity);
    }
    if (sortOrder === "views") {
      return filtered.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    }
    if (sortOrder === "latest") {
      return filtered.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    }
    return filtered;
  }, [plans, sortOrder, recruitmentStatus, activeLocation, appliedSearchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortOrder, recruitmentStatus, activeLocation, appliedSearchTerm]);

  // 페이지네이션 로직
  const totalPages = Math.ceil(
    filteredAndSortedPlans.length / ITEMS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPlans = filteredAndSortedPlans.slice(startIndex, endIndex);

  // 화면에 표시할 페이지 번호들을 계산하는 로직
  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= PAGE_NUMBER_LIMIT) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const halfWindow = Math.floor(PAGE_NUMBER_LIMIT / 2);
      let startPage = Math.max(currentPage - halfWindow, 1);
      let endPage = startPage + PAGE_NUMBER_LIMIT - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = endPage - PAGE_NUMBER_LIMIT + 1;
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    return pageNumbers;
  };

  const pageNumbersToShow = getPageNumbers();

  const topViewedPlans = useMemo(() => {
    return [...plans]
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      .slice(0, 10);
  }, [plans]);

  return (
    <div className="page-container">
      <aside className="left-sidebar">
        <div className="filter-group create-plan-box">
          <button
            className="create-plan-btn"
            onClick={() => navigate("/SurveyForm")}
          >
            + 계획 작성하러가기
          </button>
        </div>

        <div className="filter-group">
          <h4>검색</h4>
          <form className="search-container" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="제목, 지역, 작성자 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="search-btn" aria-label="검색">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>
        </div>

        <div className="filter-group">
          <h4>모집 여부</h4>
          <button
            className={`filter-btn ${
              recruitmentStatus === "all" ? "active" : ""
            }`}
            onClick={() => setRecruitmentStatus("all")}
          >
            전체
          </button>
          <button
            className={`filter-btn ${
              recruitmentStatus === "open" ? "active" : ""
            }`}
            onClick={() => setRecruitmentStatus("open")}
          >
            모집중
          </button>
          <button
            className={`filter-btn ${
              recruitmentStatus === "closed" ? "active" : ""
            }`}
            onClick={() => setRecruitmentStatus("closed")}
          >
            모집 마감
          </button>
        </div>

        <div className="filter-group">
          <h4>추천 나라/지역</h4>
          <button
            className={`filter-btn ${activeLocation === "all" ? "active" : ""}`}
            onClick={() => {
              setActiveLocation("all");
              setOpenCategory(null);
            }}
          >
            전체
          </button>
          <div
            className={`location-category-header ${
              openCategory === "domestic" ? "open" : ""
            }`}
            onClick={() => toggleCategory("domestic")}
          >
            국내{" "}
            <span className="arrow">
              {openCategory === "domestic" ? "▲" : "▼"}
            </span>
          </div>
          <div
            className={`collapsible-content ${
              openCategory === "domestic" ? "open" : ""
            }`}
          >
            {domesticLocations.map((location) => (
              <button
                key={location}
                className={`filter-btn ${
                  activeLocation === location ? "active" : ""
                }`}
                onClick={() => setActiveLocation(location)}
              >
                {location}
              </button>
            ))}
          </div>
          <div
            className={`location-category-header ${
              openCategory === "overseas" ? "open" : ""
            }`}
            onClick={() => toggleCategory("overseas")}
          >
            해외{" "}
            <span className="arrow">
              {openCategory === "overseas" ? "▲" : "▼"}
            </span>
          </div>
          <div
            className={`collapsible-content ${
              openCategory === "overseas" ? "open" : ""
            }`}
          >
            {overseasLocations.map((location) => (
              <button
                key={location}
                className={`filter-btn ${
                  activeLocation === location ? "active" : ""
                }`}
                onClick={() => setActiveLocation(location)}
              >
                {location}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="planlist-wrapper">
        <div className="list-header-controls">
          <h2 className="list-title">전체 게시글</h2>
          <div className="sort-options">
            <span
              className={`sort-option ${sortOrder === "views" ? "active" : ""}`}
              onClick={() => setSortOrder("views")}
            >
              조회순
            </span>
            <span className="sort-separator">|</span>
            <span
              className={`sort-option ${
                sortOrder === "latest" ? "active" : ""
              }`}
              onClick={() => setSortOrder("latest")}
            >
              최신순
            </span>
          </div>
        </div>
        <div className="plan-list-container">
          <div className="plan-list-header">
            <span>여행지</span>
            <span className="header-title">제목</span>
            <span>모집 상태</span>
            <span>작성자</span>
            <span>조회수</span>
          </div>
          <div className="plan-list-body">
            {paginatedPlans.length > 0 ? (
              paginatedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="plan-list-item"
                  onClick={() => navigate(`/plan/${plan.id}`)}
                >
                  <span className="item-destination">
                    {plan.destination || "미정"}
                  </span>
                  <span className="item-title">{plan.title}</span>
                  <span>
                    {plan.participants >= plan.capacity ? "마감" : "모집중"}
                  </span>
                  <span>{plan.username}</span>
                  <span>{plan.views ?? 0}</span>
                </div>
              ))
            ) : (
              <div className="no-results">해당하는 계획이 없습니다.</div>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="pagination-container">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {pageNumbersToShow.map((page) => (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        )}
      </main>

      <aside className="top-posts-sidebar">
        <h3>인기 게시글 Top 10</h3>
        <ol className="top-posts-list">
          {topViewedPlans.map((plan, index) => (
            <li key={plan.id} onClick={() => navigate(`/plan/${plan.id}`)}>
              <span className="top-post-rank">{index + 1}</span>
              <span className="top-post-title">{plan.title}</span>
              <span className="top-post-views">({plan.views ?? 0})</span>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
};

export default PlanList;