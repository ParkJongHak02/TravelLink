// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./css/Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // 🔑 지금 라우트가 모달로 열렸다면, 그 모달이 기억하고 있는 '진짜 배경'을 재사용
  // (모달이 아니라 직접 /login 으로 들어온 경우엔 현재 location을 배경으로 사용)
  const bg = location.state?.backgroundLocation || location;

  const handleLogin = (e) => {
    e.preventDefault();

    fetch(`${process.env.REACT_APP_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("로그인 실패");
        return res.json();
      })
      .then((data) => {
        alert("로그인 성공!");
        localStorage.setItem("username", data.username);
        localStorage.setItem("isAdmin", String(data.is_admin));
        navigate("/home", {
          state: { username: data.username, isAdmin: data.is_admin },
        });
      })
      .catch((err) => {
        alert("아이디 또는 비밀번호가 잘못되었습니다.");
        console.error("로그인 에러:", err);
      });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">로그인</h2>

        <form onSubmit={handleLogin}>
          <div className="login-field">
            <label>아이디</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <div className="login-field">
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <button type="submit" className="login-button">로그인</button>
        </form>

        <div className="login-footer">
          {/* 🔗 전부 동일한 배경(bg)을 state로 전달해서 '모달 → 모달' 전환 시에도 배경 유지 */}
          <Link to="/findusername" state={{ modal: true, backgroundLocation: bg }}>
            아이디 찾기
          </Link>
          <br />
          <Link to="/forgot-password" state={{ modal: true, backgroundLocation: bg }}>
            비밀번호 찾기
          </Link>
          <br />
          <Link to="/signup" state={{ modal: true, backgroundLocation: bg }}>
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
