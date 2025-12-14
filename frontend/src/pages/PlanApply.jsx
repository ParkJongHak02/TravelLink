import React, { useState, useEffect } from "react";
// 👇 useOutletContext를 react-router-dom에서 가져옵니다.
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import "../pages/css/PlanApply.css";

const PlanApply = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    // 🔽 부모(Layout)로부터 username을 직접 받아옵니다.
    const { username } = useOutletContext();

    // 🔽 로그인 상태를 확인하고, 비로그인 시 로그인 페이지로 보냅니다.
    useEffect(() => {
        if (!username) {
            alert("로그인이 필요한 서비스입니다.");
            navigate('/login');
        }
    }, [username, navigate]);

    const [contactType, setContactType] = useState("전화번호");
    const [contactValue, setContactValue] = useState("");
    const [reason, setReason] = useState("");
    const [style, setStyle] = useState("");

    // ❌ Layout에서 이미 로그인 상태를 확인하므로, 이 useEffect는 더 이상 필요 없습니다.
    /*
    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/user`, {
            credentials: "include",
        })
            .then(res => res.json())
            .then(data => {
                if (data.loggedIn) setUsername(data.username);
            });
    }, []);
    */

// PlanApply.jsx 파일의 handleSubmit 함수를 아래 코드로 교체하세요.

const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 기본 동작(새로고침) 방지

    // 서버로 보낼 데이터 객체 생성
    const applicationData = {
        username: username,
        contact_type: contactType,
        contact_value: contactValue,
        reason: reason,
        // ❗️❗️[가장 중요한 부분] 'style'이 아니라 'travel_style' 이어야 합니다.
        travel_style: style, 
    };

    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/plans/${id}/apply`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(applicationData),
        });

        if (response.ok) {
            alert("✅ 성공적으로 신청되었습니다!");
            navigate(`/plan/${id}`);
        } else {
            const errorData = await response.json();
            alert(`신청에 실패했습니다: ${errorData.detail || "서버 오류"}`);
        }
    } catch (error) {
        console.error("❌ 신청 중 오류 발생:", error);
        alert("서버와 통신 중 오류가 발생했습니다.");
    }
};

    // 로그인되지 않은 사용자는 리디렉션되기 전까지 아무것도 보여주지 않음
    if (!username) {
        return null;
    }

    return (
        <div className="plan-apply-container">
            <h2>계획 참여 신청</h2>
            <form onSubmit={handleSubmit} className="apply-form">
                <label>신청자</label>
                <input value={username || ''} readOnly />

                <label>연락 수단 유형</label>
                <select value={contactType} onChange={(e) => setContactType(e.target.value)} required>
                    <option value="전화번호">전화번호</option>
                    <option value="이메일">이메일</option>
                </select>

                <label>연락처</label>
                <input
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder="전화번호 또는 이메일 입력"
                    required
                />

                <label>여행 스타일 (선택)</label>
                <input
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    placeholder="예) 액티브, 휴양 등"
                />

                <label>신청 사유</label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    required
                />

                <button type="submit">신청하기</button>
            </form>
        </div>
    );
};

export default PlanApply;