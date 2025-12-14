import React, { useEffect, useState } from 'react';
import './css/Contact-list.css';
import { useNavigate, useOutletContext } from 'react-router-dom';

function ContactListUser() {
    // 🔽 username을 받아오지만, 접근 제한에 사용하지 않습니다.
    const { username } = useOutletContext();
    const navigate = useNavigate();

    // ❌ (기존) 로그인 상태 확인 및 리디렉션 로직 제거
    /*
    useEffect(() => {
        if (!username) {
            alert("로그인이 필요한 서비스입니다.");
            navigate('/login');
        }
    }, [username, navigate]);
    */

    const [contacts, setContacts] = useState([]);
    const [search, setSearch] = useState("");
    const [openRow, setOpenRow] = useState(null);

    useEffect(() => {
        // 🔽 로그인 여부와 관계없이 데이터를 로드 시도합니다.
        fetch(`${process.env.REACT_APP_API_URL}/api/contact`)
            .then(res => {
                if (!res.ok) throw new Error("서버 오류");
                return res.json();
            })
            .then(data => {
                let filteredData = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
                
                // 🔽 로그인된 사용자만 자신의 문의를 볼 수 있도록 필터링합니다. (백엔드 지원이 없을 경우)
                if (username) {
                    filteredData = filteredData.filter(c => c.name === username); 
                } else {
                    // 🔽 비로그인 사용자에게는 빈 목록을 보여줍니다.
                    filteredData = [];
                }
                
                setContacts(filteredData);
            })
            .catch(err => {
                console.error("❌ 문의 목록 로딩 실패:", err);
                // alert("문의 목록 로딩 실패"); // 비로그인 시에도 에러 알림이 뜨는 것을 방지하기 위해 주석 처리할 수 있습니다.
                setContacts([]);
            });
    }, [username]); // username이 변경되면 데이터를 다시 요청 (필터링 기준 변경)

    const toggleRow = (id) => {
        setOpenRow(prev => (prev === id ? null : id));
    };

    const filtered = Array.isArray(contacts)
        ? contacts.filter(c =>
            // 🔽 비로그인 상태일 때는 이름 검색이 불가능하므로, 제목 검색만 활성화합니다.
            (username && c.name && c.name.includes(search)) || (c.title && c.title.includes(search))
        )
        : [];

    // ❌ (기존) 비로그인 사용자 시 return null 로직 제거
    /*
    if (!username) {
        return null;
    }
    */

    return (
        <div className="contact-list-container">
            <h1>{username ? `${username}님의 문의 내역` : "문의 내역"}</h1>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <input
                    type="text"
                    placeholder={username ? "이름 또는 제목 검색" : "제목 검색"}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: 6, flex: 1, marginRight: 10 }}
                />

                <button onClick={() => navigate("/contact")} className="contact-btn">
                    문의하기
                </button>
            </div>
            
            {/* 🔽 비로그인 시 안내 메시지 */}
            {!username && (
                <p style={{textAlign: 'center', color: 'red'}}>
                    로그인해야 본인의 문의 내역을 확인할 수 있습니다.
                </p>
            )}

            <table className="contact-table">
                <thead>
                    <tr>
                        <th>아이디</th>
                        <th>제목 / 답변 여부</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length > 0 ? (
                        filtered.map(contact => (
                            <React.Fragment key={contact.id}>
                                <tr onClick={() => toggleRow(contact.id)} style={{ cursor: "pointer" }}>
                                    <td>{contact.name}</td>
                                    <td>
                                        <span style={{ color: "#007acc", textDecoration: "underline", marginRight: 12 }}>
                                            {contact.title}
                                        </span>
                                        <span
                                            style={{
                                                color: contact.answer ? 'green' : 'gray',
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            {contact.answer ? '완료' : '미완료'}
                                        </span>
                                        <br />
                                        <small style={{ color: "#999" }}>
                                            {contact.created_at ? new Date(contact.created_at).toLocaleString() : 'N/A'}
                                        </small>
                                    </td>
                                </tr>

                                <tr>
                                    <td colSpan={2} style={{ padding: 0, border: 'none' }}>
                                        <div
                                            className={`expanded-content ${openRow === contact.id ? 'open' : ''}`}
                                            aria-hidden={openRow !== contact.id}
                                        >
                                            <p><strong>문의 내용:</strong><br />{contact.message}</p>
                                            <p>
                                                <strong>답변:</strong><br />
                                                <span style={{ color: contact.answer ? "green" : "gray" }}>
                                                    {contact.answer || "아직 미답변"}
                                                </span>
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={2} style={{ textAlign: 'center', padding: '20px' }}>
                                {username ? "등록된 문의 내역이 없습니다." : "표시할 문의 내역이 없습니다."}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ContactListUser;