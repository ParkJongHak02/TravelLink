import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "./css/Modal.css"; // ← pages/css 경로

export default function Modal({ children, extraClass = "", showClose = true }) {
  const navigate = useNavigate();
  const close = () => navigate(-1);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && close();
    document.body.style.overflow = "hidden"; // 모달 열릴 때 스크롤 잠금
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return createPortal(
    <div className="modal-backdrop" onClick={close}>
      <div
        className={`modal-card ${extraClass}`}
        onClick={(e) => e.stopPropagation()} // 카드 안 클릭 시 닫힘 방지
      >
        {showClose && (
          <button
            type="button"
            className="modal-close"
            aria-label="닫기"
            onClick={close}
          >
            X
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
