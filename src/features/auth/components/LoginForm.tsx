import React, { useState } from "react";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import "../../../styles/auth/LoginForm.css";
import { login } from "../../../api/auth";
import type { LoginRequest } from "../../../types/auth/AuthLogin";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  [key: string]: string | undefined;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const validateEmail = (value: string): string => {
    if (!value.trim()) return "Email không được để trống";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Email không hợp lệ";
    return "";
  };

  const validatePassword = (value: string): string => {
    if (!value) return "Mật khẩu không được để trống";
    if (value.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
    return "";
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      default:
        return "";
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    const errorMessage = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMessage }));
  };

  const validateAll = (): FormErrors => ({
    email: validateEmail(formData.email),
    password: validatePassword(formData.password),
  });

  const hasErrors = (errs: FormErrors): boolean =>
    Object.values(errs).some((msg) => !!msg);

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setMessage("");
    const currentErrors = validateAll();
    setErrors(currentErrors);
    if (hasErrors(currentErrors)) return;

    try {
      setSubmitting(true);
      const payload: LoginRequest = {
        email: formData.email,
        password: formData.password,
      };

      const response = await login(payload);
      console.log('Login response:', response);
      window.location.href = "/"; // Redirect to home page after successful login
    } catch (error: any) {
      console.error("Login error:", error);
      const serverMessage =
        error.response?.data?.message || "Đăng nhập thất bại";
      setMessage(serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-left">
          <form
            className="login-form"
            onSubmit={(e: FormEvent) => e.preventDefault()}
          >
            <h2 className="form-title">Đăng nhập</h2>
            <p className="form-subtitle">
              Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.
            </p>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
                aria-invalid={!!errors.email}
                aria-describedby="email-error"
                required
              />
              {errors.email && (
                <span id="email-error" className="error-text">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                aria-invalid={!!errors.password}
                aria-describedby="password-error"
                required
              />
              {errors.password && (
                <span id="password-error" className="error-text">
                  {errors.password}
                </span>
              )}
            </div>

            <button type="submit" disabled={submitting} onClick={handleSubmit}>
              {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            {message && <div className={`message error`}>{message}</div>}

            <div className="login-link">
              Chưa có tài khoản? <a href="/auth/register">Đăng ký</a>
            </div>
          </form>
        </div>

        <div className="login-right">
          <img
            src="/images/z7030137360453_5065d2d3a1347fe23f2e818ac0f58ed8.jpg"
            alt="Login Illustration"
            className="illustration-image"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
