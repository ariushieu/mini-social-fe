import React, { useState } from "react";
// import { login } from "../../../api/auth";
import { type LoginRequest } from "../../../types/auth/AuthLogin";
import "../../../styles/auth/LoginForm.css";

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      //   const response = await login(formData);
      setMessage("Đăng nhập thành công! Chuyển hướng...");
    } catch (error: any) {
      setMessage(
        `Đăng nhập thất bại: ${
          error.message || "Email hoặc mật khẩu không đúng."
        }`
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
      </div>

      <button type="submit">Đăng nhập</button>
      {message && <p className="message">{message}</p>}
    </form>
  );
};

export default LoginForm;
