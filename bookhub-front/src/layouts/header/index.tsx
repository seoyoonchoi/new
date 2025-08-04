import { logoutRequest } from "@/apis/auth/auth";
import { useEmployeeStore } from "@/stores/employee.store";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css"
import AlertIcon from "@/apis/constants/AlertIcon";


export default function Header(){

    const[cookies, ,removeCookies] = useCookies(["accessToken"]);
    const logout = useEmployeeStore((state) => state.setLogout);
    const employee  = useEmployeeStore((state) => state.employee);
    const navigate = useNavigate();


    const onLogoutClick = async () => {
        await logoutRequest();
        removeCookies("accessToken", {path : "/"});
        logout();
    };
    
    const onLogoClick = () => {
        navigate("/main");
    };

    return(
        <header className={styles.header}>
            <div className={styles.logo}>
                <img 
                src="/북허브_로고_배경제거_black.png" 
                alt="북허브 로고"
                onClick = {onLogoClick}
                className = {styles.logoImg}
                />
            </div >
            <div className={styles.headerInfo}>
                <div>
                <div className={styles.loginInfo}>
                    {employee?.branchName} {employee?.positionName} {""}
                    {employee?.employeeName}님
                </div>
                </div>
                <AlertIcon/>
                <button onClick={onLogoutClick} className={styles.logoutBtn}>Logout</button>
            </div>

        </header>
    );
}