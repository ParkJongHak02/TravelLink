// src/App.jsx
import { useEffect } from 'react';
import axios from 'axios';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import Layout from './layouts/Layout';
import Home from './pages/Home';
import About from './pages/About';
import SurveyForm from './pages/SurveyForm';
import PlanList from './pages/PlanList';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResultPage from './pages/ResultPage';
import LocationMenuPage from './pages/LocationMenuPage';
import PlanShareForm from './pages/PlanShareForm';
import PlanDetail from './pages/PlanDetail';
import PlanEdit from './pages/PlanEdit';
import Admin from './pages/Admin';
import Contact from './pages/Contact';
import ContactAdmin from './pages/ContactAdmin';
import PlanApply from './pages/PlanApply';
import PlanApplications from './pages/PlanApplications';
import PlanParticipantsPage from './pages/PlanParticipantsPage';
import Faq from './pages/Faq';
import ContactListUser from './pages/ContactListUser';
import FindUsername from './pages/FindUsername';

import Modal from './pages/Modal'; // ⬅️ pages 폴더에 Modal.jsx 만든 경우

// ✅ 쿠키 포함 요청 허용
axios.defaults.withCredentials = true;

// ----------------------------------------------------
// 모달 라우트 적용 버전(AppInner)
// ----------------------------------------------------
function AppInner() {
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/user`, { withCredentials: true })
      .then((res) => {
        if (res.data.loggedIn) {
          localStorage.setItem('username', res.data.username);
        } else {
          localStorage.removeItem('username');
        }
      })
      .catch((err) => {
        console.error('로그인 상태 확인 실패:', err);
        localStorage.removeItem('username');
      });
  }, []);

  // 🔑 모달 라우팅 핵심: backgroundLocation 사용
  const location = useLocation();
  const state = location.state && location.state.modal ? location.state : null;

  return (
    <>
      {/* 1) 배경(원래) 페이지를 먼저 렌더 */}
      <Routes location={state?.backgroundLocation || location}>
        {/* '/'로 접속하면 /home으로 이동 */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* 공통 레이아웃 아래의 일반 페이지들 */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/SurveyForm" element={<SurveyForm />} />
          <Route path="/PlanList" element={<PlanList />} />
          <Route path="/login" element={<Login />} />       {/* 직접 진입 시: 풀페이지 */}
          <Route path="/signup" element={<Modal extraClass="modal-signup-wide">
          <div className="modal-body">
          <Signup />
          </div>
          </Modal>
          }
          />     
{/* 직접 진입 시: 풀페이지 */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/ResultPage" element={<ResultPage />} />
          <Route path="/menu" element={<LocationMenuPage />} />
          <Route path="/share" element={<PlanShareForm />} />
          <Route path="/plan/:id" element={<PlanDetail />} />
          <Route path="/edit/:id" element={<PlanEdit />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/contact" element={<ContactAdmin />} />
          <Route path="/plans/:id/apply" element={<PlanApply />} />
          <Route path="/plans/:id/applications" element={<PlanApplications />} />
          <Route path="/plan/:id/participants" element={<PlanParticipantsPage />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact-list" element={<ContactListUser />} />
              <Route
      path="/findusername"
      element={
        <Modal>
          <div className="modal-body">
            <FindUsername />
          </div>
        </Modal>
      }
    />
        </Route>
      </Routes>

      {/* 2) 모달 플래그가 있을 때만, 오버레이로 로그인/회원가입 렌더 */}
      {state?.modal && (
        <Routes>
          <Route
            path="/login"
            element={
              <Modal>
                <div className="modal-body">
                  <Login />
                </div>
              </Modal>
            }
          />
          <Route
            path="/signup"
            element={
              <Modal>
                <div className="modal-body">
                  <Signup />
                </div>
              </Modal>
            }
          />
              <Route
      path="/forgot-password"
      element={
        <Modal>
          <div className="modal-body">
            <ForgotPassword />
          </div>
        </Modal>
      }
    />
          <Route
      path="/findusername"
      element={
        <Modal>
          <div className="modal-body">
            <FindUsername />
          </div>
        </Modal>
      }
    />
        </Routes>
      )}
    </>
  );
}

// Router는 한 번만 감싸고, 내부에서 useLocation을 쓰기 위해 분리
export default function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}
