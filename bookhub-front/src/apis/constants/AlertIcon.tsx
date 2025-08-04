import { useEmployeeStore } from "@/stores/employee.store";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { getUnreadAlerts } from "../alert/alert";
import { Bell } from "lucide-react";
import styles from "../../views/alert/AlertIcon.module.css";

export default function AlertIcon() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [cookies] = useCookies(["accessToken"]);
  const employeeId = useEmployeeStore((state) => state.employee?.employeeId);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnread = async () => {
      const token = cookies.accessToken;
      if (!employeeId || !token) return;

      const res = await getUnreadAlerts(employeeId, token);
      if (res.code === "SU" && res.data) {
        setUnreadCount(res.data.content.length);
      }
    };

    fetchUnread();
  }, [employeeId]);

  return (
    <div className={styles.alertContainer} onClick={() => navigate("/alerts")}>
      <Bell size={30} stroke="black" fill="orange" />
      {unreadCount > 0 && (
        <div className={styles.badge}>
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      )}
    </div>
  );
}