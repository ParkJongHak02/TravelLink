import React, { useEffect, useState } from "react";
// 👇 useOutletContext와 useNavigate를 react-router-dom에서 가져옵니다.
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import "./css/PlanParticipantsPage.css";

const PlanParticipantsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    // 🔽 부모(Layout)로부터 현재 로그인한 사용자 이름(username)을 직접 받아옵니다.
    const { username: currentUsername } = useOutletContext();

    const [participants, setParticipants] = useState([]);
    const [planOwner, setPlanOwner] = useState(null);
    const [expandedIdx, setExpandedIdx] = useState(null);
    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    // 🔽 로그인 상태 및 작성자 권한 확인 로직
    useEffect(() => {
        // 1. 로그인 여부 확인
        if (!currentUsername) {
            alert("로그인이 필요한 서비스입니다.");
            navigate('/login');
            return;
        }

        // 2. 여러 API를 순차적으로 호출 (Promise.all 사용)
        Promise.all([
            fetch(`${process.env.REACT_APP_API_URL}/plan/${id}`).then(res => res.json()),
            fetch(`${process.env.REACT_APP_API_URL}/plan/${id}/participants`).then(res => res.json())
        ])
        .then(([planData, participantsData]) => {
            // 3. 작성자 본인 여부 확인
            if (planData.username !== currentUsername) {
                alert("참가자 목록을 볼 권한이 없습니다.");
                navigate(`/plan/${id}`); // 상세 페이지로 돌려보냄
                return;
            }

            // 4. 권한이 확인되면 데이터 설정
            setPlanOwner(planData.username);
            setParticipants(participantsData);
            setLoading(false);
        })
        .catch(err => {
            console.error("❌ 데이터 로딩 실패:", err);
            alert("데이터를 불러오는 데 실패했습니다.");
            navigate(`/plan/${id}`);
        });

    }, [id, currentUsername, navigate]);

    const handleToggle = (idx) => {
        setExpandedIdx(prev => (prev === idx ? null : idx));
    };

    const handleRemove = async (usernameToRemove) => {
        const confirmed = window.confirm(`${usernameToRemove} 참가자를 삭제할까요?`);
        if (!confirmed) return;

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/plan/${id}/participants/remove`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // 인증 정보 포함
                body: JSON.stringify({ username: usernameToRemove }),
            });

            if (res.ok) {
                alert("삭제 완료");
                setParticipants(prev => prev.filter(p => p.username !== usernameToRemove));
            } else {
                const errorData = await res.json();
                alert(`삭제 실패: ${errorData.detail || '알 수 없는 오류'}`);
            }
        } catch (err) {
            console.error("삭제 요청 실패:", err);
            alert("서버 오류");
        }
    };
    
    // 로딩 중이거나 권한이 없는 경우
    if (loading) {
        return <div className="participants-page-container"><h2>📡 참가자 목록을 불러오는 중...</h2></div>;
    }

    return (
        <div className="participants-page-container">
            <h2>✅ 참가자 목록</h2>
            {participants.length === 0 ? (
                <p>아직 참가자가 없습니다.</p>
            ) : (
                <ul className="participant-list">
                    {participants.map((p, idx) => (
                        <li key={idx} className="participant-card">
                            <div
                                className="participant-summary"
                                onClick={() => handleToggle(idx)}
                            >
                                👤 {p.username}
                            </div>

                            {expandedIdx === idx && (
                                <div className="participant-details">
                                    <p><strong>연락 수단:</strong> {p.contact_type}</p>
                                    <p><strong>연락처:</strong> {p.contact_value}</p>
                                    <p><strong>여행 스타일:</strong> {p.travel_style}</p>
                                    <button
                                        className="remove-btn"
                                        onClick={() => handleRemove(p.username)}
                                    >
                                        참가자 삭제
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PlanParticipantsPage;