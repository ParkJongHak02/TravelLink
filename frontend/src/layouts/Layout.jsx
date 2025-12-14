import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import '../pages/css/Home.css';

const Layout = () => {
  const [username, setUsername] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const hideLayoutForPath = ['/SurveyForm'];
  const shouldHideLayout = hideLayoutForPath.includes(location.pathname);
  const openLogin  = () => navigate('/login',  { state: { modal: true, backgroundLocation: location } });
  const openSignup = () => navigate('/signup', { state: { modal: true, backgroundLocation: location } });

  const isHome = location.pathname === '/' || location.pathname === '/home';

  useEffect(() => {
    if (location.state?.username) {
      setUsername(location.state.username);
      setIsAdmin(location.state.isAdmin);
      localStorage.setItem('username', location.state.username);
      localStorage.setItem('isAdmin', String(location.state.isAdmin));
      return;
    }
    const user = localStorage.getItem('username');
    const isAdminStored = localStorage.getItem('isAdmin') === 'true';

    if (user) {
      setUsername(user);
      setIsAdmin(isAdminStored);
    } else {
      fetch('http://localhost:8000/api/user', { credentials: 'include' })
        .then(r => r.json())
        .then(d => {
          if (d.loggedIn) {
            setUsername(d.username);
            setIsAdmin(d.is_admin);
            localStorage.setItem('username', d.username);
            localStorage.setItem('isAdmin', String(d.is_admin));
          } else {
            setUsername(null);
            setIsAdmin(false);
            localStorage.removeItem('username');
            localStorage.removeItem('isAdmin');
          }
        })
        .catch(e => console.error(e));
    }
  }, [location.state, location.pathname]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      localStorage.removeItem('username');
      localStorage.removeItem('isAdmin');
      setUsername(null);
      setIsAdmin(false);
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  const toggleMenu = () => setMenuOpen(v => !v);

  return (
    <>
      {/* shouldHideLayout이 false일 때만 헤더, 스페이서, 사이드바 렌더링 */}
      {!shouldHideLayout && (
        <>
          {/* 상단바 */}
          <header className={`site-top ${isHome ? 'home' : 'solid'} ${menuOpen ? 'is-behind' : ''}`}>
            <div className="top-inner">
              <Link to="/home" className="hero-brand" aria-label="홈으로">
                <span className="hero-brand-title">
                  <span className="accent">T</span>ravel <span className="accent">L</span>ink
                </span>
              </Link>
              <div className="hero-actions">
                {username ? (
                  <>
                    <span className="hero-hello">{username}님</span>
                    <span className="hero-auth-btn" onClick={handleLogout}>로그아웃</span>
                  </>
                ) : (
                  <>
                    <span className="hero-auth-btn" onClick={openLogin}>로그인</span>
                    <span className="hero-auth-btn" onClick={openSignup}>회원가입</span>
                  </>
                )}
                <span className="hero-auth-btn" onClick={toggleMenu}>MENU</span>
              </div>
            </div>
          </header>

          {/* 고정 상단바가 컨텐츠를 가리지 않도록 여백 주기 (홈 제외) */}
          {!isHome && <div className="top-spacer" />}

          {/* 사이드바 */}
          {menuOpen && (
            <>
              <div className="sidebar-overlay" onClick={toggleMenu} />
              <div className="sidebar">
                <button className="close-btn" onClick={toggleMenu}>✖</button>
                {username ? (
                  <div className="sidebar-user">
                    <span className="sidebar-welcome">{username}님</span>
                    {isAdmin && (
                      <div className="sidebar-link" onClick={() => { toggleMenu(); navigate('/admin', { state: { username, isAdmin } }); }}>
                        🛠️ 관리자 페이지
                      </div>
                    )}
                    <div className="sidebar-link" onClick={handleLogout}>로그아웃</div>
                  </div>
                ) : (
                  <div className="sidebar-user">
                    <div className="sidebar-link" onClick={() => { toggleMenu(); openLogin(); }}>로그인</div>
                    <div className="sidebar-link" onClick={() => { toggleMenu(); openSignup(); }}>회원가입</div>
                  </div>
                )}
                <Link to="/about" onClick={toggleMenu} className="sidebar-link">서비스 소개</Link>
                <Link to="/faq" onClick={toggleMenu} className="sidebar-link">자주 묻는 질문</Link>
                <Link to="/contact" onClick={toggleMenu} className="sidebar-link">문의하기</Link>
              </div>
            </>
          )}
        </>
      )}

      {/* <Outlet />은 항상 렌더링되어야 하므로 조건문 바깥에 둡니다. */}
      <Outlet context={{ username, isAdmin }} />
    </>
  );
};

export default Layout;