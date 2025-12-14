import React, { useEffect, useState } from 'react';
// 👇 useOutletContext와 useNavigate를 react-router-dom에서 가져옵니다.
import { useOutletContext, useNavigate } from "react-router-dom";
import '../pages/css/LocationMenuPage.css';

const LocationMenuPage = () => {
    // 🔽 부모(Layout)로부터 username을 직접 받아옵니다.
    const { username } = useOutletContext();
    const navigate = useNavigate();

    // 🔽 로그인 상태를 확인하고, 비로그인 시 로그인 페이지로 보냅니다.
    useEffect(() => {
        if (!username) {
            alert("로그인이 필요한 서비스입니다.");
            navigate('/login');
        }
    }, [username, navigate]);

    const [location, setLocation] = useState(null);
    const [menus, setMenus] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [keyword, setKeyword] = useState("");
    const [loadingGeo, setLoadingGeo] = useState(false);
    const [loadingKeyword, setLoadingKeyword] = useState(false);

    // ✅ 내 위치 기반 추천
    const handleRecommend = () => {
        if (!navigator.geolocation) {
            setErrorMsg("이 브라우저는 위치 정보를 지원하지 않아요.");
            return;
        }
        setLoadingGeo(true);
        setErrorMsg("");
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lon: longitude });
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/recommend-menu`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ lat: latitude, lon: longitude }),
                    });
                    const data = await response.json();
                    setMenus(data.menus);
                } catch (error) {
                    setErrorMsg("추천을 불러오는 중 오류가 발생했어요.");
                } finally {
                    setLoadingGeo(false);
                }
            },
            () => {
                setErrorMsg("위치 접근이 거부되었어요.");
                setLoadingGeo(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    // ✅ 키워드 기반 추천
    const handleKeywordRecommend = async () => {
        if (!keyword.trim()) return;
        setLoadingKeyword(true);
        setErrorMsg("");
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/convert-keyword`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ keyword })
            });
            const { lat, lon } = await res.json();
            setLocation({ lat, lon });
            const menuRes = await fetch(`${process.env.REACT_APP_API_URL}/recommend-menu`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ lat, lon }),
            });
            const data = await menuRes.json();
            setMenus(data.menus);
        } catch (error) {
            setErrorMsg("키워드 기반 추천 중 오류가 발생했어요.");
        } finally {
            setLoadingKeyword(false);
        }
    };

    // 로그인되지 않은 사용자는 리디렉션되기 전까지 아무것도 보여주지 않음
    if (!username) {
        return null;
    }

    return (
        <div className="location-menu-container">
            <h2>🍽️ 오늘 뭐 먹지?</h2>

            <button onClick={handleRecommend} disabled={loadingGeo}>
                {loadingGeo ? "추천 중..." : "📡 내 위치로 추천받기"}
            </button>

            <div className="keyword-search-group">
                <input
                    className="keyword-input"
                    type="text"
                    placeholder="예: 강남역, 잠실역"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    disabled={loadingKeyword}
                />
                <button
                    className="keyword-button"
                    onClick={handleKeywordRecommend}
                    disabled={loadingKeyword || !keyword.trim()}
                >
                    {loadingKeyword ? "추천 중..." : "🔍추천"}
                </button>
            </div>

            {errorMsg && <p className="error-message">{errorMsg}</p>}

            {location && (
                <p className="location-info">
                    📍 위치 좌표: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                </p>
            )}

            {menus.length > 0 && (
                <div className="menu-result">
                    {menus.map((item, index) => (
                        <div key={index} className="menu-card">
                            <h4>{item.menu} <span style={{ fontSize: "0.9rem" }}>({item.category})</span></h4>
                            <p>{item.description}</p>
                            {item.restaurants && item.restaurants.length > 0 && (
                                <div style={{ marginTop: "0.7rem", paddingLeft: "1rem" }}>
                                    <p style={{ fontWeight: "bold", color: "#137333" }}>📍 근처 맛집</p>
                                    <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                                        {item.restaurants.map((r, i) => (
                                            <li key={i} style={{ marginBottom: "0.5rem" }}>
                                                <span style={{ fontWeight: "600" }}>{r.place_name}</span><br />
                                                <small>{r.address} ({r.distance})</small>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LocationMenuPage;