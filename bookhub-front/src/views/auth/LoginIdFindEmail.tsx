import { loginIdFindSendEmailRequest } from "@/apis/auth/auth";
import { LoginIdFindSendEmailRequestDto } from "@/dtos/auth/request/Login-id-find-send-email.request.dto";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";

function LoginIdFindEmail() {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginIdFindSendEmailRequestDto>({
    email: "",
    phoneNumber: "",
  });
  const [message, setMessage] = useState("");
  const [sendEmailMessage, setSendEmailMessage] = useState("");
  const url = "/auth/login";

  useEffect(() => {
    setMessage("");
    return;
  }, [form]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const onSendEmailClick = async () => {
    if (!form.email || !form.phoneNumber) {
      setMessage("모든 항목을 입력해주세요");
      return;
    }

    setSendEmailMessage("이메일 전송 중입니다. 잠시만 기다려 주세요");

    const response = await loginIdFindSendEmailRequest(form);
    const { code, message } = response;

    if (code !== "SU") {
      setMessage("이메일 전송 실패: " + message);
      setSendEmailMessage("");
      return;
    } else {
      alert(message);
      navigate(url);
    }
  };

  const onLogoClick = () => {
    navigate(url);
  };

  return (
    <div className={styles.container}>
      <img
        src="/북허브_로그_로그인창.png"
        alt="BookHub 로고"
        onClick={onLogoClick}
        className={styles.logoImg}
      />
      <div className={styles.formBox}>
        <h1>아이디 찾기</h1>
        <input
          type="email"
          placeholder="이메일"
          name="email"
          value={form.email}
          onChange={onInputChange}
        />
        <input
          type="tel"
          placeholder="전화번호"
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={onInputChange}
        />
        {message && <p className={styles.failP}>{message}</p>}
        {sendEmailMessage && (
          <p className={styles.successP}>{sendEmailMessage}</p>
        )}
        <button onClick={onSendEmailClick}>이메일 전송</button>
      </div>
    </div>
  );
}

export default LoginIdFindEmail;
