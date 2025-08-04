import { loginIdFindRequest } from "@/apis/auth/auth";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./Auth.module.css";

function LoginIdGet() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [loginId, setLoginId] = useState("");
  const [message, setMessage] = useState("");

  const fetchLoginId = async () => {
    if (!token) {
      setMessage("유효하지 않은 토큰입니다.");
      return;
    }

    const response = await loginIdFindRequest(token);
    const { code, message, data } = response;

    if (code === "SU" && data) {
      setLoginId(data);
      setMessage("");
      return;
    } else {
      setMessage(message);
      return;
    }
  };

  useEffect(() => {
    fetchLoginId();
  }, [token]);

  const onCloseButtonClick = () => {
    alert("창을 닫습니다.");
    window.close();

    if (!closed) {
      alert("창이 닫히지 않았습니다. 창을 닫아주세요.");
    }
  };

  return (
    <div className={styles.container}>
      <img src="/북허브_로그_로그인창.png" alt="BookHub 로고" className={styles.logoImg}/>
      <div className={styles.formBox}>
        <h1>아이디 찾기</h1>
        {message ? (
          <p className={styles.failP}>{message}</p>
        ) : (
          <p className={styles.getP}>
            사원의 아이디는 <strong>{loginId}</strong> 입니다.
          </p>
        )}
        <button onClick={onCloseButtonClick}>확인</button>
      </div>
    </div>
  );
}

export default LoginIdGet;
