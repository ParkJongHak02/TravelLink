import React, { useState, useEffect } from 'react'; // useEffect 추가
import '../pages/css/Contact.css'; 
import { useNavigate, useOutletContext } from "react-router-dom"; // useOutletContext 추가

function Contact() {
  const navigate = useNavigate();
  // 🔽 부모(Layout)로부터 username과 isAdmin 상태를 직접 받아옵니다.
  const { username, isAdmin } = useOutletContext(); 

  const [form, setForm] = useState({
    name: '',
    title: '',
    message: ''
  });

  // 🔽 username이 변경될 때마다 form의 name 필드를 업데이트합니다.
  useEffect(() => {
    if (username) {
      setForm(prevForm => ({ ...prevForm, name: username }));
    }
  }, [username]);


  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔽 로그인되지 않은 사용자도 문의는 남길 수 있도록 하되, 이름은 필수로 입력하게 함
    if (!form.name) {
      alert("이름을 입력해주세요.");
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    })
      .then(res => {
        if (!res.ok) throw new Error("서버 오류");
        return res.json();
      })
      .then(() => {
        alert("문의가 등록되었습니다!");
        setForm({ name: username || "", title: "", message: "" }); // 성공 후 이름 필드는 로그인 상태에 따라 초기화

        if (isAdmin) {
          navigate("/admin/contact");
        } else {
          navigate("/contact-list");
        }
      })
      .catch(err => {
        alert("문의 등록 실패");
        console.error("문의 등록 에러:", err);
      });
  };

  return (
    <div className="contact-container">
      <h1 className="contact-title">문의하기</h1>
      <p className="contact-subtitle">궁금한 점이나 건의사항이 있다면 남겨주세요.</p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="name" 
          placeholder="이름" 
          value={form.name} 
          onChange={handleChange}
          readOnly={!!username} // 👈 로그인 상태이면 이름 수정을 막음
          required
        />
        
        <input 
          type="text" 
          name="title" 
          placeholder="문의 제목" 
          value={form.title} 
          onChange={handleChange}
          required
        />
        <textarea 
          name="message" 
          placeholder="문의 내용을 작성해주세요." 
          value={form.message} 
          onChange={handleChange}
          required
        ></textarea>

        <button type="submit" className="submit-button">문의하기</button>
      </form>
    </div>
  );
}

export default Contact;