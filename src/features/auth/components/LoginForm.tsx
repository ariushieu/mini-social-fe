import React, { useState } from "react";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import "../../../styles/auth/LoginForm.css";
import { login } from "../../../api/auth";
import type { LoginRequest } from "../../../types/auth/AuthLogin";
import { toast } from "react-toastify";

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
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

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
    const currentErrors = validateAll();
    setErrors(currentErrors);
    if (hasErrors(currentErrors)) return;

    if (!agreedToTerms) {
      toast.warning("Vui lòng đồng ý với điều khoản dịch vụ");
      return;
    }

    try {
      setSubmitting(true);
      const payload: LoginRequest = {
        email: formData.email,
        password: formData.password,
      };

      const response = await login(payload);
      console.log("Login response:", response);

      toast.success("Đăng nhập thành công");
      window.location.href = "/";
    } catch (error: any) {
      console.error("Login error:", error);

      let serverMessage = "Đăng nhập thất bại";

      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === "string") {
          serverMessage = data;
        } else if (typeof data.message === "string") {
          serverMessage = data.message;
        } else if (Array.isArray(data.message)) {
          serverMessage = data.message.join(", ");
        }
      }

      toast.error(serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left side - Branding */}
        <div className="login-left">
          <div>
            <h1 className="welcome-title">
              Welcome back <br /> to iSocial
            </h1>
            <p className="welcome-description">
              Log in to stay connected with your friends,
              <br />
              and discover new stories every day.
            </p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="login-right">
          <form
            className="login-form"
            onSubmit={(e: FormEvent) => e.preventDefault()}
          >
            <div className="form-header">
              <h2 className="form-title">ĐĂNG NHẬP</h2>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="username"
                placeholder="VD: email@domain.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
                aria-invalid={!!errors.email}
                aria-describedby="email-error"
              />
              {errors.email && (
                <span id="email-error" className="error-text">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                aria-invalid={!!errors.password}
                aria-describedby="password-error"
              />
              {errors.password && (
                <span id="password-error" className="error-text">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <label htmlFor="terms">
                I agree to the all statements in{" "}
                <a href="/terms">Terms of service</a>
              </label>
            </div>

            <button type="submit" disabled={submitting} onClick={handleSubmit}>
              {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="login-link">
              Don't have an account? <a href="/auth/register">Sign up</a>
            </div>

            <div className="footer-text">
              Copyright © iSocial 2025. All rights reserved.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
