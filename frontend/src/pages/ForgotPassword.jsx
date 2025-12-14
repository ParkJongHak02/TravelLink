// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom"; // ← 추가
import "./css/ForgotPassword.css";

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [tempPassword, setTempPassword] = useState("");

  const location = useLocation();               // ← 현재 모달이 기억한 배경 읽기
  const navigate = useNavigate();

  // 모달로 열린 경우에만, 기존 배경을 재사용
  const bg = location.state?.backgroundLocation || location;
  const cameFromModal = location.state?.modal && location.state?.backgroundLocation;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/forgot-password`, {
        username,
      });
      setTempPassword(res.data.temp_password);
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.detail || "에러 발생");
    }
  };

  const backToLogin = () => {
    if (cameFromModal) {
      // ✅ 배경 유지 + 로그인도 모달로
      navigate("/login", { state: { modal: true, backgroundLocation: bg } });
    } else {
      // 직접 /forgot-password로 들어온 경우엔 그냥 일반 이동
      navigate("/login");
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-box">
        <h2 className="forgot-title">비밀번호 찾기</h2>

        {submitted ? (
          <p className="forgot-message">
            임시 비밀번호: <strong>{tempPassword}</strong><br />
            로그인 후 비밀번호를 꼭 변경하세요.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">가입한 아이디</label>
            <input
              type="text"
              id="username"
              className="forgot-input"
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <button type="submit" className="forgot-button">
              임시 비밀번호 발급
            </button>
          </form>
        )}

        <div className="forgot-footer">
          {/* 버튼이지만 텍스트 링크처럼 보이게 */}
          <button type="button" className="linklike" onClick={backToLogin}>
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
