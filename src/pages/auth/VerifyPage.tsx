import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const hasVerified = useRef(false); // Flag để tránh gọi API nhiều lần

  useEffect(() => {
    // Nếu đã xác thực rồi thì không làm gì nữa
    if (hasVerified.current) return;

    const code = searchParams.get("code");
    if (!code) {
      setStatus("Thiếu mã xác thực.");
      return;
    }

    // Đánh dấu đã bắt đầu xác thực
    hasVerified.current = true;
    setStatus("Đang xác thực...");

    axios
      .get(`http://localhost:8080/api/auth/verify?code=${code}`)
      .then((res) => {
        setStatus(res.data.message);

        if (res.data.success) {
          setTimeout(() => {
            navigate("/auth/login");
          }, 5000);
        }
      })
      .catch(() => {
        setStatus("Xác thực thất bại hoặc mã không hợp lệ.");
        hasVerified.current = false;
      });
  }, [searchParams, navigate]);

  return <div>{status}</div>;
};

export default VerifyPage;
