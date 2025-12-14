import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import "./css/PlanEdit.css";

const PlanEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { username: currentUsername } = useOutletContext();

    const [plan, setPlan] = useState(null);
    const [form, setForm] = useState({
        title: "",
        summary: "",
        destination: "",
        capacity: 4,
        tags: "",
        participants: 1,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUsername) {
            alert("로그인이 필요한 서비스입니다.");
            navigate('/login');
            return;
        }

        fetch(`${process.env.REACT_APP_API_URL}/plan/${id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.username !== currentUsername) {
                    alert("수정 권한이 없습니다.");
                    navigate(`/plan/${id}`);
                    return;
                }
                
                setPlan(data);
                setForm({
                    title: data.title || "",
                    summary: data.summary || "",
                    destination: data.destination || "",
                    capacity: data.capacity || 4,
                    tags: data.tags || "",
                    participants: data.participants || 1,
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("데이터 로딩 실패:", err);
                alert("계획을 불러오는 데 실패했습니다.");
                navigate('/PlanList');
            });
    }, [id, currentUsername, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const payload = {
            ...form,
            capacity: Number(form.capacity),
            participants: Number(form.participants),
            tags: form.tags,
            itinerary: plan.itinerary || {},
            username: plan.username || "",
        };

        const res = await fetch(`${process.env.REACT_APP_API_URL}/plan/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            alert("✅ 수정이 완료되었습니다!");
            navigate(`/plan/${id}`);
        } else {
            const result = await res.json().catch(() => null);
            alert(result?.detail || "❌ 수정에 실패했습니다.");
        }
    };

    const handleCancel = () => {
        navigate(`/plan/${id}`);
    };
    
    if (loading) {
        return <div className="plan-detail-loading">불러오는 중...</div>;
    }

    return (
        <div className="plan-edit-page">
            <header className="plan-edit-header">
                <h2>여행 계획 수정</h2>
            </header>
            
            <div className="plan-edit-container">
                <form className="plan-edit-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-row">
                        <div className="form-field">
                            <label>제목</label>
                            <input name="title" value={form.title} onChange={handleChange} required />
                        </div>
                        <div className="form-field">
                            <label>목적지</label>
                            {/* --- 이 부분을 수정했습니다: readOnly 속성 추가 --- */}
                            <input name="destination" value={form.destination} readOnly />
                        </div>
                    </div>

                    {/* --- 이 부분을 수정했습니다: '모집 정원'과 '태그'를 위로 이동 --- */}
                    <div className="form-row">
                        <div className="form-field">
                            <label>모집 정원</label>
                            <input type="number" name="capacity" value={form.capacity} onChange={handleChange} min={1} />
                        </div>
                        <div className="form-field">
                             <label>태그</label>
                            <input name="tags" value={form.tags} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-field">
                        <label>요약 설명</label>
                        <textarea name="summary" value={form.summary} onChange={handleChange} />
                    </div>

                    <div className="plan-edit-buttons">
                        <button className="cancel-btn" onClick={handleCancel}>취소</button>
                        <button className="save-btn" onClick={handleSave}>저장</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlanEdit;