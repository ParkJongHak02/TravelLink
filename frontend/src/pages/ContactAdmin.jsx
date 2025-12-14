import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom"; 
// import '../styles/Admin.css'; // 필요 시 주석 해제

// prop으로 isAdmin을 받도록 수정
const ContactAdmin = ({ isAdmin }) => {
    // 🔽 useOutletContext 제거
    const navigate = useNavigate();

    const [contacts, setContacts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // 로딩 상태 추가

    useEffect(() => {
        // isAdmin이 true일 때만 데이터 요청 시작
        if (isAdmin) {
            setLoading(true); 
            // 🚩 수정: API URL을 명시적으로 설정
            fetch(`http://localhost:8000/api/contact`, { 
                credentials: "include"
            })
            .then(res => {
                if (!res.ok) {
                    // API 호출 실패 시 에러를 던져 catch 블록으로 보냅니다.
                    throw new Error(`HTTP 오류! 상태 코드: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                // 서버가 배열 형태의 문의 목록을 반환한다고 가정
                if (Array.isArray(data)) {
                    // 🔽 createdAt 필드를 기준으로 최신순(내림차순) 정렬
                    const sortedData = data.sort((a, b) => 
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                    setContacts(sortedData);
                } else {
                    // 응답 형식이 배열이 아닐 경우 오류 처리
                    setError("응답 형식이 올바르지 않습니다.");
                }
            })
            .catch(err => {
                console.error("❌ 문의글 불러오기 실패:", err);
                // 네트워크 오류 또는 HTTP 오류 메시지를 사용자에게 표시
                setError(`문의글을 불러오는 중 오류가 발생했습니다: ${err.message}`);
            })
            .finally(() => {
                setLoading(false); // 로딩 종료
            });
        }
    }, [isAdmin]);

    // --- 핸들러 함수들 ---

    const handleAnswerChange = (id, value) => {
        setContacts(prev =>
            prev.map(contact =>
                contact.id === id ? { ...contact, tempAnswer: value } : contact
            )
        );
    };

    const handleStartEdit = (id) => {
        const contact = contacts.find(c => c.id === id);
        // tempAnswer가 undefined인 경우에만 편집 모드를 시작합니다.
        if (contact.tempAnswer === undefined) {
            handleAnswerChange(id, contact.answer || "");
        }
    };

    // 🔽 handleCancelEdit 함수는 사용되지 않으므로 제거하거나 그대로 둡니다.
    // 렌더링 부분에서 버튼만 제거하고 함수는 유지하겠습니다.
    const handleCancelEdit = (id) => {
        setContacts(prev =>
            prev.map(contact =>
                contact.id === id ? { ...contact, tempAnswer: undefined } : contact
            )
        );
    };

    const handleAnswerSubmit = (id) => {
        const contact = contacts.find(c => c.id === id);
        if (!contact.tempAnswer && !contact.answer) {
             alert("답변 내용을 입력해 주세요.");
             return;
        }

        // 🚩 수정: API URL을 명시적으로 설정
        fetch(`http://localhost:8000/api/contact/${id}`, { 
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ answer: contact.tempAnswer })
        })
        .then(res => {
            if (!res.ok) throw new Error("답변 저장 실패");
            return res.json();
        })
        .then(data => {
            setContacts(prev =>
                prev.map(c =>
                    c.id === id
                        ? { ...c, answer: data.answer, tempAnswer: undefined } // 🔽 서버 응답 데이터를 사용하여 answer를 업데이트
                        : c
                )
            );
            alert("답변이 저장되었습니다.");
        })
        .catch(err => {
            console.error("답변 저장 실패:", err);
            alert("답변 저장 실패");
        });
    };

    const handleDelete = (id) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        // 🚩 수정: API URL을 명시적으로 설정
        fetch(`http://localhost:8000/api/contact/${id}`, {
            method: "DELETE",
            credentials: "include"
        })
        .then(res => {
            if (!res.ok) throw new Error("삭제 실패");
            return res.text(); // DELETE는 응답 본문이 없을 수 있음
        })
        .then(() => {
            setContacts(prev => prev.filter(c => c.id !== id));
            alert("삭제되었습니다.");
        })
        .catch(err => {
            console.error("삭제 실패:", err);
            alert("삭제 실패");
        });
    };

    // ------------------------------------
    // 🔽 렌더링 로직

    if (loading) {
        return <div className="loading-spinner">문의글 목록 로드 중...</div>;
    }
    
    // Admin.jsx에서 이미 권한을 확인했으므로, 이 상태에 도달하면 null을 반환합니다.
    if (!isAdmin) {
        return null; 
    }

    return (
        // 🔽 className 적용
        <div className="contact-admin-container">
            <h2>문의글 관리</h2>

            {error ? (
                <p style={{ color: "red", textAlign: "center" }}>{error}</p>
            ) : contacts.length === 0 ? (
                <p className="no-data">문의글이 없습니다.</p>
            ) : (
                <div className="contact-list">
                    {contacts.map(contact => (
                        // 🔽 className 적용
                        <div key={contact.id} className="contact-item">
                            <div className="contact-header">
                                <strong>{contact.title}</strong>
                                <div className="contact-meta">
                                    <p>작성자: {contact.name}</p>
                                    {/* DB에서 createdAt 필드를 제공한다고 가정하고 표시 */}
                                    {contact.createdAt && (
                                        <p>등록일: {new Date(contact.createdAt).toLocaleDateString('ko-KR')}</p>
                                    )}
                                </div>
                            </div>

                            <div className="contact-content">
                                <p><strong>내용:</strong> {contact.message}</p>
                            </div>

                            {/* 편집/답변 영역 */}
                            {/* 1. 편집 모드 (임시 답변 작성 중) */}
                            {contact.tempAnswer !== undefined ? (
                                <div className="answer-area">
                                    <strong>답변 수정</strong>
                                    <textarea
                                        className="answer-textarea"
                                        value={contact.tempAnswer}
                                        onChange={(e) => handleAnswerChange(contact.id, e.target.value)}
                                        rows={3}
                                    />
                                    <div className="action-buttons">
                                        <button onClick={() => handleAnswerSubmit(contact.id)}>저장</button>
                                        <button 
                                            onClick={() => handleDelete(contact.id)}
                                            className="delete-btn"
                                        >
                                            삭제
                                        </button>
                                        {/* ❌ 취소 버튼 제거 */}
                                        {/* <button 
                                            onClick={() => handleCancelEdit(contact.id)}
                                            className="cancel-btn"
                                        >
                                            취소
                                        </button> */}
                                    </div>
                                </div>
                            ) 
                            /* 2. 답변 완료 상태 */
                            : contact.answer ? (
                                <div className="answer-area">
                                    <strong>답변 완료</strong>
                                    <p>{contact.answer}</p>
                                    <div className="action-buttons">
                                        <button onClick={() => handleStartEdit(contact.id)}>수정</button>
                                        <button 
                                            onClick={() => handleDelete(contact.id)}
                                            className="delete-btn"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            ) 
                            /* 3. 미답변 상태 (새 답변 작성) */
                            : (
                                <div className="answer-area">
                                    <strong>새 답변 작성</strong>
                                    <textarea
                                        className="answer-textarea"
                                        placeholder="답변 입력..."
                                        onChange={(e) => handleAnswerChange(contact.id, e.target.value)}
                                        rows={3}
                                    />
                                    <div className="action-buttons">
                                        <button onClick={() => handleAnswerSubmit(contact.id)}>답변 저장</button>
                                        <button 
                                            onClick={() => handleDelete(contact.id)}
                                            className="delete-btn"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContactAdmin;