import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import "./css/PlanDetail.css";

const PlanDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { username } = useOutletContext();

    const [plan, setPlan] = useState(null);
    const [error, setError] = useState(null);
    const [isApplied, setIsApplied] = useState(false);
    const [isParticipant, setIsParticipant] = useState(false);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/plan/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error("계획을 불러오지 못했습니다.");
                return res.json();
            })
            .then((data) => {
                setPlan(data);
                window.scrollTo(0, 0);
                setSelectedDayIndex(0);
            })
            .catch((err) => {
                console.error("❌ 계획 로딩 실패:", err);
                setError("계획을 불러오는 중 오류가 발생했습니다.");
            });

        if (username) {
            fetch(`${process.env.REACT_APP_API_URL}/plans/${id}/applied`, { credentials: "include" })
                .then((res) => res.json())
                .then((result) => setIsApplied(result.applied))
                .catch(err => console.error("신청 상태 확인 오류:", err));

            fetch(`${process.env.REACT_APP_API_URL}/plan/${id}/participants`)
                .then(res => res.json())
                .then(participants => {
                    const currentUserIsParticipant = participants.some(p => p.username === username);
                    setIsParticipant(currentUserIsParticipant);
                })
                .catch(err => console.error("참여자 목록 확인 오류:", err));
        } else {
            setIsApplied(false);
            setIsParticipant(false);
        }
    }, [id, username]);
    
    const handleDelete = async () => {
        if (!window.confirm("정말로 이 계획을 삭제하시겠습니까?")) return;
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/plan/${id}`, { method: "DELETE" });
            if (res.ok) {
                alert("계획이 삭제되었습니다.");
                navigate("/PlanList");
            } else {
                alert("삭제에 실패했습니다.");
            }
        } catch (error) {
            alert("서버 연결 오류가 발생했습니다.");
            console.error("삭제 중 오류:", error);
        }
    };

    const handleEdit = () => navigate(`/edit/${id}`);

    if (error) return <div className="plan-detail-error">{error}</div>;
    if (!plan) return <div className="plan-detail-loading">⏳ 계획을 불러오는 중...</div>;
    
    const isOwner = username && plan.username === username;

    const renderApplyButton = () => {
        if (plan.participants >= plan.capacity) {
            return <button className="btn btn-disabled" disabled>모집이 마감되었습니다</button>;
        }
        if (isParticipant) {
            return <button className="btn btn-disabled" disabled>이미 참여중인 계획입니다</button>;
        }
        if (isApplied) {
            return <button className="btn btn-disabled" disabled>승인 대기중입니다</button>;
        }
        return (
            <button className="btn btn-primary" onClick={() => navigate(`/plans/${id}/apply`)}>
                참여 신청하기
            </button>
        );
    };

    const itineraryDays = plan.itinerary ? Object.keys(plan.itinerary) : [];

    return (
        <div id="planDetailContainer" className="detail-page-container">
            <aside className="detail-left-sidebar">
                <div className="info-card">
                    <h3>여행 개요</h3>
                    {/* ✅ 작성자 정보를 여행 개요 안으로 이동 */}
                    <div className="info-item">
                        <div><label>작성자</label><p>{plan.username}</p></div>
                    </div>
                    <div className="info-item">
                        <div><label>목적지</label><p>{plan.destination}</p></div>
                    </div>
                    <div className="info-item">
                        <div><label>날짜</label><p>{plan.date || "미지정"}</p></div>
                    </div>
                    <div className="info-item">
                        <div><label>인원</label><p>{plan.participants} / {plan.capacity} 명</p></div>
                    </div>
                    {plan.tags && (
                         <div className="info-item">
                            <div>
                                <label>태그</label>
                                <div className="tags-container">
                                    {plan.tags.split(',').map(tag => tag.trim()).map((tag, index) => (
                                        <span key={index} className="tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {!isOwner && username && (
                    <div className="apply-section">
                        {renderApplyButton()}
                    </div>
                )}
            </aside>
            
            <main className="detail-main-content">
                <header className="plan-header">
                    <div className="plan-header-title">
                        <h2>{plan.title}</h2>
                        {/* ✅ "by 작성자" 부분 삭제 */}
                    </div>
                    {isOwner && (
                        <div className="plan-owner-actions">
                            <button className="btn btn-secondary" onClick={() => navigate(`/plans/${id}/applications`)}>신청자 목록</button>
                            <button className="btn btn-secondary" onClick={() => navigate(`/plan/${id}/participants`)}>참가자 명단</button>
                            <button className="btn btn-secondary" onClick={handleEdit}>수정</button>
                            <button className="btn btn-danger" onClick={handleDelete}>삭제</button>
                        </div>
                    )}
                </header>

                <section className="plan-itinerary-section">
                     {plan.summary && (
                        <div className="summary-card">
                            <h4>한줄 요약</h4>
                            <p>{plan.summary}</p>
                        </div>
                    )}
                    <h3>상세 여행 일정</h3>
                    <div className="day-selector-tabs">
                        {itineraryDays.map((_, index) => (
                            <button key={index} className={`day-selector-btn ${selectedDayIndex === index ? 'active' : ''}`} onClick={() => setSelectedDayIndex(index)}>
                                {index + 1}일차
                            </button>
                        ))}
                    </div>
                    <div className="itinerary-timeline">
                        {itineraryDays.length > 0 && (
                            <div className="itinerary-day-card">
                                <ul className="itinerary-list">
                                    {plan.itinerary[itineraryDays[selectedDayIndex]].map((item, idx) => (
                                        <li key={idx}>
                                            <span className="time-tag">{item.time}</span>
                                            <div className="activity-content">
                                                <p className="activity-title">{item.activity}</p>
                                                {item.memo && <p className="activity-memo">📝 {item.memo}</p>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default PlanDetail;