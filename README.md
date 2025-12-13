# ✈️ Travel Link

**Travel Link**는 사용자의 여행 준비를 더 쉽고 즐겁게 만들기 위해 제작한 **여행 정보/계획 서비스**입니다.  
여행지 탐색부터 일정 구성까지 이어지는 흐름을 웹으로 구현했으며, 프론트엔드/백엔드를 분리해 개발하고  
데이터베이스와 API 연동을 통해 실제 서비스 형태에 가깝게 구성했습니다.

---

## ✨ 프로젝트 한눈에 보기
- 📅 **기간**: (예: 2024.xx ~ 2024.xx)
- 👥 **형태**: 팀 프로젝트 / 개인 프로젝트 (선택해서 적으시면 됩니다)
- 🎯 **목표**: 여행 서비스를 구성하는 핵심 기능(탐색/저장/계획/추천)을 웹으로 구현

---

## 🛠 Tech Stack
- 🎨 **Frontend**: React, CSS3, Axios  
- ⚙️ **Backend**: Python, FastAPI, SQLAlchemy, Pydantic  
- 🗄️ **Database**: MySQL (AWS RDS)  
- ☁️ **Infra & DevOps**: AWS (EC2, S3, RDS), Nginx, Gunicorn, Git/GitHub  
- 🤖 **AI / API**: Google Gemini API *(사용하셨다면 유지)*

---

## ✅ Key Features
- 🔎 **여행지/장소 탐색**: 여행지 관련 정보 조회 및 화면 구성
- 🧭 **여행 일정 구성**: 일정 생성/수정/저장 등 플래닝 기능
- 👤 **사용자 기능**: 로그인/사용자별 데이터 관리 *(구현 여부에 따라 수정 가능)*
- 💾 **DB 기반 CRUD**: 여행 일정/저장 목록 등 데이터 생성·조회·수정·삭제
- 🌐 **API 연동**: 프론트(React) ↔ 백엔드(FastAPI) 통신으로 데이터 처리
- 🤖 **AI 추천(선택)**: Gemini API 기반 추천/요약/도움 기능 *(구현 여부에 따라 수정)*

---

## 🧱 Architecture (구성)
- 🖥️ **Frontend**: 사용자 화면(UI) 및 API 호출(Axios)
- 🧩 **Backend**: FastAPI 라우터 기반 REST API 제공
- 🗃️ **DB**: RDS(MySQL)에 데이터 저장 및 조회
- 🚪 **Web Server**: Nginx 리버스 프록시 구성 *(사용 시)*

---

## 🚀 실행 방법 (예시)
> 실제 구조에 맞게 아래는 필요 없는 부분 삭제/수정하셔도 됩니다.

### 1) Backend
1. 가상환경 생성 & 패키지 설치
2. `.env` 또는 DB 설정 값 세팅 (RDS 접속 정보 등)
3. 서버 실행  
   - 예: `uvicorn main:app --reload`

### 2) Frontend
1. 패키지 설치
2. 실행  
   - 예: `npm install`  
   - 예: `npm run dev` 또는 `npm start`

---

## 📸 Screenshots
> 갤러리(주인님이 만든 TravelLink/index.html) 링크나 대표 이미지 추가 추천!
- 🖼️ 메인 화면
- 🖼️ 여행지 탐색 화면
- 🖼️ 일정 생성/편집 화면
- 🖼️ 결과/저장 목록 화면

---

## 🙋‍♂️ About
- 📌 **기획 의도**: 여행 서비스의 핵심 사용자 흐름(탐색 → 계획 → 저장)을 실제 서비스처럼 구현
- 💡 **배운 점**
  - React ↔ FastAPI API 통신 및 데이터 흐름 설계
  - DB(RDS) 연동 및 CRUD 구현
  - 배포 환경(AWS, Nginx/Gunicorn) 구성 경험 *(사용 시)*

---

© 2025 Park Jong Hak. All rights reserved.
