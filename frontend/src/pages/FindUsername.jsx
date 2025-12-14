// src/pages/FindUsername.jsx

import React, { useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import "./css/FindUsername.css";

const FindUsername = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [foundUsername, setFoundUsername] = useState("");

  // 🔑 모달에서 들어온 경우 원래 배경을 그대로 이어 받기
  const location = useLocation();
  const bg = location.state?.backgroundLocation || location;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/find-username", {
        email,
      });
      setFoundUsername(res.data.username);
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.detail || "에러 발생");
    }
  };

  return (
    <div className="find-username-container">
      <div className="find-username-box">
        <h2 className="find-username-title">아이디 찾기</h2>

        {submitted ? (
          <p className="find-username-message">
            찾으시는 아이디는: <strong>{foundUsername}</strong> 입니다.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">가입한 이메일</label>
            <input
              type="email"
              id="email"
              className="find-username-input"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="find-username-button">
              아이디 찾기
            </button>
          </form>
        )}

        <div className="find-username-footer">
          {/* 🔗 모달 → 모달 전환 시에도 배경 유지 */}
          <Link to="/login" state={{ modal: true, backgroundLocation: bg }}>
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FindUsername;