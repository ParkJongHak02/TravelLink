import React, { useEffect, useState } from "react";
// 👇 useOutletContext와 useNavigate를 react-router-dom에서 가져옵니다.
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import "./css/PlanParticipants.css"; 

const PlanParticipants = () => {
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

    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 로그인한 경우에만 데이터를 불러옵니다.
        if (username) {
            fetch(`${process.env.REACT_APP_API_URL}/plan/${id}/participants`)
                .then(res => res.json())
                .then(data => {
                    console.log("✅ 참가자 목록:", data);
                    setParticipants(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("참가자 목록 불러오기 실패:", err);
                    setParticipants([]);
                    setLoading(false);
                });
        }
    }, [id, username]); // username이 확인되면 데이터를 요청

    // 로그인되지 않은 사용자는 리디렉션되기 전까지 아무것도 보여주지 않음
    if (!username) {
        return null;
    }

    return (
        <div className="participants-container">
            <h2>✅ 확정된 참가자</h2>
            {loading ? (
                <p>📡 불러오는 중...</p>
            ) : participants.length === 0 ? (
                <p>아직 참가자가 없습니다.</p>
            ) : (
                <ul className="participant-list">
                    {participants.map((p, idx) => (
                        <li key={idx} className="participant-card">
                            👤 {p.username}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PlanParticipants;