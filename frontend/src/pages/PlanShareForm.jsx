import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import "./css/PlanShareForm.css";

const PlanShareForm = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { username } = useOutletContext();

    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState({ message: "", type: "" });

    const [form, setForm] = useState({
        title: "",
        username: "",
        destination: "",
        summary: "",
        participants: 1,
        capacity: 4,
        tags: "",
        startDate: "",
        endDate: ""
    });

    useEffect(() => {
        if (!username) {
            console.warn("로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.");
            navigate('/login', { replace: true });
        }
    }, [username, navigate]);

    useEffect(() => {
        if (username) {
            setForm((prev) => ({
                ...prev,
                username: username,
                destination: state?.planData?.recommendations?.[0] || "",
            }));
        }
    }, [username, state]);
    
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        const parsedValue = (name === "participants" || name === "capacity") && value !== "" ? parseInt(value, 10) : value;
        setForm((prev) => ({ ...prev, [name]: parsedValue }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { title, startDate, endDate, participants, capacity } = form;

        if (!title.trim()) {
            setFeedback({ message: "제목을 입력해주세요.", type: "error" });
            return;
        }
        if (!startDate || !endDate) {
            setFeedback({ message: "여행 기간을 모두 선택해주세요.", type: "error" });
            return;
        }
        if (participants > capacity) {
            setFeedback({ message: "현재 인원은 모집 정원보다 많을 수 없습니다.", type: "error" });
            return;
        }

        setIsLoading(true);
        setFeedback({ message: "", type: "" });
        
        const { startDate: formStartDate, endDate: formEndDate, ...restOfForm } = form;

        const payload = {
            ...restOfForm,
            itinerary: state?.planData?.itinerary || null,
            date: (formStartDate && formEndDate) ? `${formStartDate} ~ ${formEndDate}` : null,
        };

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/plans`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                navigate("/PlanList");
            } else {
                const data = await res.json();
                setFeedback({ message: `❌ 저장 실패: ${data?.detail || "알 수 없는 오류"}`, type: "error" });
            }
        } catch (error) {
            console.error("공유 요청 실패:", error);
            setFeedback({ message: "🚨 서버와의 연결에 실패했습니다.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!username) {
        return null;
    }

    return (
        <div className="plan-share-form-page">
            <header className="plan-share-form-header">
                <h1>계획 공유하기</h1>
            </header>
            
            <div className="plan-share-form-container">
                <form onSubmit={handleSubmit} className="plan-share-form__form" aria-busy={isLoading}>
                    {feedback.message && (
                        <div className={`plan-share-form__feedback ${feedback.type}`}>
                            {feedback.message}
                        </div>
                    )}
                    
                    <div className="plan-share-form__top-row">
                        <div className="plan-share-form__field-readonly">
                            <label htmlFor="username">작성자</label>
                            <input id="username" name="username" value={form.username} readOnly />
                        </div>
                        <div className="plan-share-form__field-readonly">
                            <label htmlFor="destination">목적지</label>
                            <input id="destination" name="destination" value={form.destination} readOnly />
                        </div>
                        <div className="plan-share-form__field">
                            <label>여행 기간</label>
                             <div className="date-range-picker">
                                <input
                                    type="date"
                                    name="startDate"
                                    value={form.startDate}
                                    onChange={handleChange}
                                    className="date-picker-input"
                                />
                                <span>~</span>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={form.endDate}
                                    onChange={handleChange}
                                    min={form.startDate} 
                                    className="date-picker-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="plan-share-form__field">
                        <label htmlFor="tags">태그 (쉼표 구분)</label>
                        <input
                            id="tags"
                            name="tags"
                            value={form.tags}
                            onChange={handleChange}
                            placeholder="예: 바다, 맛집, 여행"
                        />
                    </div>

                    <div className="plan-share-form__bottom-row">
                        <div className="plan-share-form__field-small">
                            <label htmlFor="participants">현재 인원</label>
                            <input
                                id="participants"
                                type="number"
                                name="participants"
                                value={form.participants}
                                onChange={handleChange}
                                min={1}
                            />
                        </div>
                        <div className="plan-share-form__field-small">
                            <label htmlFor="capacity">모집 정원</label>
                            <input
                                id="capacity"
                                type="number"
                                name="capacity"
                                value={form.capacity}
                                onChange={handleChange}
                                min={form.participants}
                            />
                        </div>
                    </div>

                    <div className="plan-share-form__field">
                        <label htmlFor="title">제목</label>
                        <input
                            id="title"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="제목을 입력하세요"
                        />
                    </div>

                    <div className="plan-share-form__field">
                        <label htmlFor="summary">요약 설명</label>
                        <textarea
                            id="summary"
                            name="summary"
                            value={form.summary}
                            onChange={handleChange}
                            rows={4}
                            placeholder="간단히 여행 계획을 설명해 주세요"
                        />
                    </div>

                    {/* --- 버튼을 별도의 div로 감쌌습니다 --- */}
                    <div className="plan-share-form__button-container">
                        <button type="submit" className="plan-share-form__button" disabled={isLoading}>
                            {isLoading ? "공유 중..." : "계획 공유하기"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlanShareForm;