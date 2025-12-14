import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContactAdmin from "./ContactAdmin";
import "./css/Admin.css"; 

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('users'); 
  const [selectedUsernames, setSelectedUsernames] = useState(new Set()); 
  const [isAdmin, setIsAdmin] = useState(false);

  // 1. 사용자 목록 가져오기 함수
  const fetchUsers = (search = "") => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/api/users${search ? `?search=${search}` : ""}`, {
      credentials: "include" // ✅ [필수] 세션 쿠키 전송
    })
      .then(res => res.json())
      .then(usersData => {
        let finalUsersArray = usersData;
        
        if (!Array.isArray(usersData) && usersData && Array.isArray(usersData.data)) {
            finalUsersArray = usersData.data;
        }

        if (Array.isArray(finalUsersArray)) {
          setUsers(finalUsersArray);
          const currentValidUsernames = new Set(finalUsersArray.map(u => u.username));
          setSelectedUsernames(prev => new Set([...prev].filter(username => currentValidUsernames.has(username))));
        } else {
          console.error("서버 데이터 형식 오류:", usersData);
          setUsers([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("사용자 목록 로드 오류:", err);
        setUsers([]);
        setLoading(false);
      });
  };

  // 2. 관리자 인증 체크 (디버깅 로그 포함)
  useEffect(() => {
    console.log("관리자 페이지 진입 - 인증 체크 시작");

    const localIsAdmin = localStorage.getItem("isAdmin");
    console.log("LocalStorage isAdmin:", localIsAdmin);

    fetch(`${process.env.REACT_APP_API_URL}/api/user`, {
      credentials: "include" // ✅ [필수] 세션 쿠키를 서버로 보냄
    })
      .then(res => res.json())
      .then(data => {
        console.log("🔍 서버 인증 응답:", data); // ✅ [디버깅] F12 콘솔 확인용

        if (!data.loggedIn || !data.is_admin) {
          alert("관리자만 접근 가능합니다.");
          navigate("/");
        } else {
          console.log("✅ 관리자 인증 성공");
          setIsAdmin(true);
          fetchUsers();
        }
      })
      .catch(err => {
          console.error("관리자 인증 오류:", err);
          alert("서버 연결 실패");
          navigate("/");
      });
  }, [navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(searchTerm);
  };

  // 3. 로그아웃 함수 (복구됨)
  // 현재 UI에는 연결된 버튼이 없지만, 원본 보존을 위해 남겨둡니다.
  const handleLogout = () => {
    fetch(`${process.env.REACT_APP_API_URL}/api/logout`, {
      method: "POST",
      credentials: "include"
    })
      .then(() => {
        // 로그아웃 후 필요한 처리가 있다면 여기에 추가
        navigate("/"); // 예시: 홈으로 이동
      });
  };

  const handleSelectUser = (username, isChecked) => {
    setSelectedUsernames(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(username);
      } else {
        newSet.delete(username);
      }
      return newSet;
    });
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allUsernames = new Set(users.map(u => u.username));
      setSelectedUsernames(allUsernames);
    } else {
      setSelectedUsernames(new Set());
    }
  };

  // 4. 일괄 권한 변경 (credentials 추가됨)
  const handleBulkRoleChange = (makeAdmin) => {
    const usernames = Array.from(selectedUsernames);
    if (usernames.length === 0) {
      alert("관리할 사용자를 선택해주세요.");
      return;
    }
    const action = makeAdmin ? "부여" : "해제";
    
    if (window.confirm(`선택된 ${usernames.length}명에게 관리자 권한을 ${action}하시겠습니까?`)) {
        fetch(`${process.env.REACT_APP_API_URL}/api/admin/bulk/role-update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // ✅ [필수] 세션 유지
          body: JSON.stringify({ 
              is_admin: makeAdmin,
              usernames: usernames 
          })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP 오류! 상태 코드: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            alert(`선택된 사용자 ${data.count}명의 관리자 권한 ${action}이 완료되었습니다.`);
            setSelectedUsernames(new Set()); 
            fetchUsers(searchTerm); 
        })
        .catch(err => {
            console.error(`관리자 권한 일괄 ${action} 오류:`, err);
            alert(`관리자 권한 일괄 ${action} 중 오류가 발생했습니다. 콘솔을 확인해주세요.`);
        });
    }
  };

  // 5. 일괄 삭제 (credentials 추가됨)
  const handleBulkDelete = () => {
    const usernames = Array.from(selectedUsernames);
    if (usernames.length === 0) {
      alert("삭제할 사용자를 선택해주세요.");
      return;
    }
    
    if (window.confirm(`정말로 선택된 ${usernames.length}명의 사용자를 삭제하시겠습니까?`)) {
         fetch(`${process.env.REACT_APP_API_URL}/api/users/bulk/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // ✅ [필수] 세션 유지
          body: JSON.stringify({ 
              usernames: usernames 
          })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP 오류! 상태 코드: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            alert(`선택된 사용자 ${data.count}명이 삭제되었습니다.`);
            setSelectedUsernames(new Set()); 
            fetchUsers(searchTerm); 
        })
        .catch(err => {
            console.error("사용자 일괄 삭제 오류:", err);
            alert("사용자 일괄 삭제 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
        });
    }
  };


  if (loading) return <div className="loading-spinner">관리자 인증 및 사용자 목록 로드 중...</div>;

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>관리자</h1>
      </header>
      
      {/* 탭 메뉴 UI */}
      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          사용자 관리
        </button>
        <button
          className={`tab-button ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          문의글 관리
        </button>
      </div>

      <section className="admin-content">
        {activeTab === 'users' && (
          // 탭 1: 사용자 관리
          <>
            {/* 검색 바 */}
            <div className="search-bar-container">

              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  className="search-input"
                  placeholder="아이디 또는 이메일로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="search-button">
                  검색
                </button>
              </form>
            </div>
            
            {/* 일괄 처리 액션 버튼 */}
            <div className="top-actions-container">
                <button 
                    onClick={() => handleBulkRoleChange(true)} 
                    className="action-button toggle-role"
                >
                    관리자 부여
                </button>
                <button 
                    onClick={() => handleBulkRoleChange(false)} 
                    className="action-button toggle-role"
                >
                    관리자 해제
                </button>
                <button 
                    onClick={handleBulkDelete} 
                    className="action-button delete"
                >
                    사용자 삭제
                </button>
            </div>


            <div className="table-container">
              <table className="user-table">
                <thead>
                  <tr>
                    {/* 전체 선택 체크박스 열 */}
                    <th>
                        <input
                            type="checkbox"
                            checked={selectedUsernames.size === users.length && users.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            title="전체 선택/해제"
                        />
                    </th>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.username}>
                        {/* 개별 선택 체크박스 열 */}
                        <td>
                            <input
                                type="checkbox"
                                checked={selectedUsernames.has(user.username)}
                                onChange={(e) => handleSelectUser(user.username, e.target.checked)}
                                title="사용자 선택"
                            />
                        </td>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.is_admin ? 'admin' : 'user'}`}>
                            {user.is_admin ? "관리자" : "사용자"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">사용자가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'contacts' && (
          // 탭 2: 문의글 관리 (ContactAdmin 컴포넌트 렌더링)
          <ContactAdmin isAdmin={isAdmin} /> 
        )}
      </section>
    </div>
  );
};

export default Admin;