import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import './css/SurveyForm.css';

// 질문 목록
const domesticQuestions = [
  { id: 'travelDuration', label: '여행 기간', type: 'text', placeholder: '예: 3박 4일, 일주일' },
  { id: 'companion', label: '여행 동반자 유형', type: 'radio', options: ['가족', '친구', '연인', '혼자'] },
  { id: 'scenery', label: '보고 싶은 풍경', type: 'radio', options: ['탁 트인 바다', '푸른 산', '볼거리 많은 도시', '한적한 시골마을'] },
  { id: 'season', label: '어느 계절에 여행', type: 'radio', options: ['봄', '여름', '가을', '겨울'] },
  { id: 'keywords', label: '여행의 핵심 키워드', type: 'radio', options: ['힐링', '먹방', '관광지'] },
  { id: 'diningPreference', label: '선호하는 식사 장소', type: 'radio', options: ['유명 레스토랑', '저렴한 길거리 음식', '현지 맛집'] },
  { id: 'activityLevel', label: '활동량', type: 'radio', options: ['여유롭게', '적당히', '부지런히'] },
];

const internationalQuestions = [
    { id: 'travelDuration', label: '여행 기간', type: 'text', placeholder: '예: 3박 4일, 일주일' },
    { id: 'companion', label: '여행 동반자 유형', type: 'radio', options: ['가족', '친구', '연인', '혼자'] },
    { id: 'season', label: '어느 계절에 여행', type: 'radio', options: ['봄', '여름', '가을', '겨울'] },
    { id: 'region', label: '어떤 지역 선호', type: 'radio', options: ['동남아시아', '동북아시아(국내 제외)', '유럽' , '미주', '호주'] },
    { id: 'travelStyle', label: '여행 스타일', type: 'radio', options: ['한 도시를 깊게', '가볍게 여러 도시'] },
    { id: 'diningPreference', label: '선호하는 식사 장소', type: 'radio', options: ['유명 레스토랑', '저렴한 길거리 음식', '현지 맛집'] },
    { id: 'activityLevel', label: '활동량', type: 'radio', options: ['여유롭게', '적당히', '부지런히'] },
];


const SurveyForm = () => {
  const { username } = useOutletContext();
  const navigate = useNavigate();

  const [destinationType, setDestinationType] = useState("");
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const questions = destinationType === 'domestic' ? domesticQuestions : internationalQuestions;
  const totalSteps = destinationType ? questions.length + 1 : 1;

  useEffect(() => {
    if (!username) {
        alert("로그인이 필요한 서비스입니다.");
        navigate('/login');
    }
  }, [username, navigate]);

  const handleSubmit = () => {
    const interests = [
        formData.companion,
        formData.scenery,
        formData.season,
        formData.keywords,
        formData.diningPreference,
        formData.activityLevel,
        formData.travelStyle,
    ].filter(Boolean);

    let travelArea = "";
    if (destinationType === "domestic") {
        travelArea = "국내";
    } else if (destinationType === "international") {
        travelArea = formData.region;
    }
    
    const requestData = {
        travelArea: travelArea,
        travelDuration: formData.travelDuration,
        interests: interests,
        username: username,
    };
    
    console.log("✅ 최종 제출 데이터 (백엔드 전송용):", requestData);
    navigate('/ResultPage', { state: requestData });
  };

  useEffect(() => {
    setProgress(Math.round(((currentStep) / totalSteps) * 100));
    if (currentStep === totalSteps && destinationType) {
      setTimeout(() => {
        handleSubmit();
      }, 400);
    }
  }, [currentStep, totalSteps, destinationType]);


  const handleSelectDestination = (type) => {
    setDestinationType(type);
    setFormData({});
    setCurrentStep(1);
  };

  const handleNextStep = () => {
    if (questions[currentStep - 1]?.type === 'text' && !formData[questions[currentStep - 1].id]) {
        alert("여행 기간을 입력해주세요.");
        return;
    }
    setCurrentStep(prev => prev + 1);
  };
  
  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardSelection = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    setTimeout(() => handleNextStep(), 300);
  }

  if (!username) {
    return null;
  }

  const renderCurrentQuestion = () => {
    const questionIndex = currentStep - 1;
    if (questionIndex >= questions.length) return null;

    const question = questions[questionIndex];
    if (!question) return null;

    if (question.type === 'text') {
      return (
        <div className="question-fade-in" key={currentStep}>
          <div className="question-block">
            <label>{question.label}</label>
            <input type="text" name={question.id} value={formData[question.id] || ''} onChange={handleInputChange} placeholder={question.placeholder} />
          </div>
          <div className="navigation-buttons">
            {/* ✅ [수정됨] 조건을 >= 1 로 변경 */}
            {currentStep >= 1 ? (
              <button type="button" onClick={handlePreviousStep} className="previous-question-button">
                ← 이전
              </button>
            ) : (
              <div />
            )}
            <button type="button" onClick={handleNextStep} className="next-button">다음 →</button>
          </div>
        </div>
      );
    }

    return (
      <div className="question-fade-in" key={currentStep}>
        <div className="question-block card-question-picker">
          <label>{question.label}</label>
          <div className="question-card-container">
            {question.options.map(opt => (
              <div 
                key={opt}
                className={`question-card ${formData[question.id] === opt ? 'selected' : ''}`}
                onClick={() => handleCardSelection(question.id, opt)}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
         <div className="navigation-buttons">
            {/* ✅ [수정됨] 조건을 >= 1 로 변경 */}
            {currentStep >= 1 && (
              <button type="button" onClick={handlePreviousStep} className="previous-question-button">
                ← 이전
              </button>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="survey-form-background">
      <button onClick={() => navigate('/')} className="back-button">
        ← 홈으로
      </button>
      
      <div className="survey-form">
        <div className="progress-indicator">
          <span className="progress-label">진행도</span>
          <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${progress}%` }}></div></div>
          <span className="progress-percent">{progress > 100 ? 100 : progress}%</span>
        </div>

        {currentStep === 0 && (
          <div className="question-fade-in">
            <div className="question-block destination-picker">
              <label>여행지 선택</label>
              <div className="destination-card-container">
                <div className="destination-card" onClick={() => handleSelectDestination('domestic')}>국내</div>
                <div className="destination-card" onClick={() => handleSelectDestination('international')}>해외</div>
              </div>
            </div>
          </div>
        )}
        
        {currentStep > 0 && currentStep < totalSteps && renderCurrentQuestion()}
      </div>
    </div>
  );
};

export default SurveyForm;