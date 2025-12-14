import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from "react-router-dom";
import './css/Contact-list.css';

function ContactList() {
    // 🔽 부모(Layout)로부터 isAdmin 상태를 직접 받아옵니다.
    const { isAdmin } = useOutletContext();
    const navigate = useNavigate();

    // 🔽 관리자가 아닐 경우, 홈페이지로 보냅니다.
    useEffect(() => {
        // isAdmin 값이 확정된 후에 체크하도록 합니다 (null, undefined가 아닐 때).
        if (isAdmin === false) {
            alert("접근 권한이 없습니다.");
            navigate('/home');
        }
    }, [isAdmin, navigate]);

    const [contacts, setContacts] = useState([]);
    const [search, setSearch] = useState("");
    const [sortAsc, setSortAsc] = useState(false);
    const [answerMap, setAnswerMap] = useState({});

    useEffect(() => {
        // 관리자인 경우에만 데이터를 불러옵니다.
        if (isAdmin) {
            fetch(`${process.env.REACT_APP_API_URL}/api/contact`)
                .then(res => res.json())
                .then(data => setContacts(data))
                .catch(err => alert("문의 목록 로딩 실패"));
        }
    }, [isAdmin]); // isAdmin 상태가 true로 확인되면 데이터를 요청

    const handleSort = () => {
        setSortAsc(prev => !prev);
        setContacts(prev =>
            [...prev].sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at) : 0;
                const dateB = b.created_at ? new Date(b.created_at) : 0;
                return sortAsc ? dateA - dateB : dateB - dateA;
            })
        );
    };

    const handleAnswerChange = (id, value) => {
        setAnswerMap({ ...answerMap, [id]: value });
    };

    const submitAnswer = (id) => {
        fetch(`${process.env.REACT_APP_API_URL}/api/contact/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ answer: answerMap[id] || "" })
        })
            .then(res => {
                if (!res.ok) throw new Error("답변 실패");
                return res.json();
            })
            .then(() => {
                alert("답변 등록됨");
                setAnswerMap({});
                // 업데이트된 목록 다시 불러오기
                return fetch(`${process.env.REACT_APP_API_URL}/api/contact`);
            })
            .then(res => res.json())
            .then(data => setContacts(data))
            .catch(err => alert("답변 등록 중 오류 발생"));
    };

    const filtered = contacts.filter(c =>
        (c.name && c.name.includes(search)) || (c.title && c.title.includes(search))
    );
    
    // 관리자가 아닌 사용자는 리디렉션되기 전까지 아무것도 보여주지 않음
    if (!isAdmin) {
        return null;
    }

    return (
        <div className="contact-list-container">
            <h1>문의 관리</h1>

            <input
                type="text"
                placeholder="이름 또는 제목 검색"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ marginBottom: 12, padding: 6 }}
            />

            <table className="contact-table">
                <thead>
                    <tr>
                        <th>이름</th>
                        <th>제목</th>
                        <th>문의내용</th>
                        <th>답변</th>
                        <th style={{ cursor: "pointer" }} onClick={handleSort}>
                            작성일 {sortAsc ? "▲" : "▼"}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(contact => (
                        <tr key={contact.id}>
                            <td>{contact.name}</td>
                            <td>{contact.title}</td>
                            <td>{contact.message}</td>
                            <td>
                                {contact.answer ? (
                                    <span style={{ color: 'green' }}>{contact.answer}</span>
                                ) : (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="답변 입력"
                                            value={answerMap[contact.id] || ""}
                                            onChange={e =>
                                                handleAnswerChange(contact.id, e.target.value)
                                            }
                                            style={{ width: "80%" }}
                                        />
                                        <button onClick={() => submitAnswer(contact.id)}>등록</button>
                                    </>
                                )}
                            </td>
                            <td>{contact.created_at ? new Date(contact.created_at).toLocaleString() : 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ContactList;