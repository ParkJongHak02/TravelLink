import React, { useEffect, useState } from "react";
// 👇 useOutletContext와 useNavigate를 react-router-dom에서 가져옵니다.
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import "./css/PlanApplications.css";

const PlanApplications = () => {
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

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 로그인한 경우에만 데이터를 불러옵니다.
        if (username) {
            fetch(`${process.env.REACT_APP_API_URL}/plan/${id}/applications`, {
                credentials: "include",
            })
                .then(res => res.json())
                .then(data => {
                    console.log("📦 신청자 목록 응답:", data);
                    if (Array.isArray(data)) {
                        setApplications(data);
                    } else if (Array.isArray(data.applications)) {
                        setApplications(data.applications);
                    } else {
                        setApplications([]);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error("신청자 목록 로드 실패:", err);
                    setApplications([]);
                    setLoading(false);
                });
        }
    }, [id, username]); // username이 확인되면 데이터를 요청

    const handleAccept = async (applicantUsername) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/plan/${id}/accept`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username: applicantUsername }),
            });

            if (res.ok) {
                alert(`✅ ${applicantUsername} 님을 합류시켰습니다.`);
                setApplications((prev) =>
                    prev.filter((a) => a.username !== applicantUsername)
                );
            } else {
                const errorData = await res.json();
                alert(`❌ 합류 실패: ${errorData.detail || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error("합류 요청 실패:", error);
            alert("서버 오류 발생");
        }
    };

    // 로그인되지 않은 사용자는 리디렉션되기 전까지 아무것도 보여주지 않음
    if (!username) {
        return null;
    }

    return (
        <div className="applications-container">
            <h2>👥 신청자 목록</h2>

            {loading ? (
                <p>📡 불러오는 중...</p>
            ) : applications.length === 0 ? (
                <p>아직 신청자가 없습니다.</p>
            ) : (
                <ul className="application-list">
                    {applications.map((app, idx) => (
                        <li key={idx} className="application-card">
                            <p><strong>아이디:</strong> {app.username}</p>
                            <p><strong>연락처:</strong> {app.contact_type} {app.contact_value} </p>
                            <p><strong>신청 사유:</strong> {app.reason}</p>
                            <button onClick={() => handleAccept(app.username)}>✔️ 합류시키기</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PlanApplications;