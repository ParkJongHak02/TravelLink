import React, { useState, useEffect } from "react";
// 👇 useOutletContext를 react-router-dom에서 가져옵니다.
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import "./css/PlanApply.css";

const ApplyForm = () => {
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

    // ... (useState, handleSubmit 등 나머지 코드는 그대로 유지) ...
    const [contactType, setContactType] = useState("전화번호");
    const [contactValue, setContactValue] = useState("");
    const [reason, setReason] = useState("");
    const [style, setStyle] = useState("");
    
    // 이 useEffect는 사용자 기본 연락처를 가져오는 로직이므로 그대로 둬도 괜찮습니다.
    useEffect(() => {
        // ... (기존 useEffect 내용) ...
    }, []); 

    const handleSubmit = (e) => {
        // ... (기존 handleSubmit 내용) ...
    };

    // 로그인되지 않은 사용자는 리디렉션되기 전까지 아무것도 보여주지 않음
    if (!username) {
        return null;
    }

  return (
    <form onSubmit={handleSubmit} className="plan-apply-container">
      <h2>참여 신청서</h2>

      <label htmlFor="contactType">연락처 종류</label>
      <select
        id="contactType"
        value={contactType}
        onChange={(e) => setContactType(e.target.value)}
        required
      >
        <option value="전화번호">전화번호</option>
        <option value="이메일">이메일</option>
      </select>

      <label htmlFor="contactValue">연락처 (전화번호 또는 이메일)</label>
      <input
        id="contactValue"
        type="text"
        value={contactValue}
        onChange={(e) => setContactValue(e.target.value)}
        placeholder="전화번호 또는 이메일 입력"
        required
      />

      <label htmlFor="reason">신청 이유</label>
      <textarea
        id="reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        required
      />

      <label htmlFor="style">선호하는 여행 스타일</label>
      <input
        id="style"
        type="text"
        value={style}
        onChange={(e) => setStyle(e.target.value)}
        required
      />

      <button type="submit">신청하기</button>
    </form>
  );
};

export default ApplyForm;
