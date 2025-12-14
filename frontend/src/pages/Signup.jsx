// src/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // ← useLocation 추가
import "./css/Signup.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("@gmail.com");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contactType, setContactType] = useState("phone");
  const [contactValue, setContactValue] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  // 현재 라우트가 모달로 열렸다면 그 모달이 기억하는 '진짜 배경'을 재사용
  const bg = location.state?.backgroundLocation || location;

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const fullEmail = `${email}${emailDomain}`;
    const userData = {
      username,
      email: fullEmail,
      password,
      contact: { type: contactType, value: contactValue },
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "회원가입 실패");
      }

      const result = await res.json();
      alert(result.message || "회원가입 성공!");

      // ✅ 로그인도 모달로 열리도록
      navigate("/login", { state: { modal: true, backgroundLocation: bg } });
    } catch (err) {
      alert("에러: " + err.message);
      console.error(err);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="signup-title">회원가입</h2>

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>아이디</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="signup-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="signup-label">이메일</label>
            <div className="email-wrapper">
              <input
                type="text"
                className="signup-input email"
                value={email}
                onChange={(e) => setEmailId(e.target.value)}
                required
              />
              <select
                className="signup-select email"
                value={emailDomain}
                onChange={(e) => setEmailDomain(e.target.value)}
              >
                <option value="@gmail.com">@gmail.com</option>
                <option value="@naver.com">@naver.com</option>
                <option value="@kakao.com">@kakao.com</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="signup-input"
              required
            />
          </div>

          <div className="form-group">
            <label>비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="signup-input"
              required
            />
          </div>

          <div className="form-group">
            <label>연락 가능한 수단</label>
            <div className="contact-input-group">
              <select
                value={contactType}
                onChange={(e) => setContactType(e.target.value)}
                className="signup-select"
              >
                <option value="phone">전화번호</option>
                <option value="kakao">카카오톡 ID</option>
                <option value="instagram">인스타그램</option>
              </select>
              <input
                type="text"
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                className="signup-input"
                placeholder={
                  contactType === "phone"
                    ? "010-1234-5678"
                    : contactType === "kakao"
                    ? "kakao_id"
                    : "@your_insta"
                }
                required
              />
            </div>
          </div>

          <button type="submit" className="signup-button">회원가입</button>
        </form>

        <div className="signup-footer">
          이미 계정이 있으신가요?{" "}
          {/* ✅ 클릭 시에도 로그인 모달로 */}
          <Link
            to="/login"
            state={{ modal: true, backgroundLocation: bg }}
            className="login-link"
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
