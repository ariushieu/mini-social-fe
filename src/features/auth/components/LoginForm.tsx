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
    setMessage("");
    const currentErrors = validateAll();
    setErrors(currentErrors);
    if (hasErrors(currentErrors)) return;

    if (!agreedToTerms) {
      setMessage("Vui lòng đồng ý với điều khoản dịch vụ");
      return;
    }

    try {
      setSubmitting(true);
      const payload: LoginRequest = {
        email: formData.email,
        password: formData.password,
      };

      const response = await login(payload);
      console.log('Login response:', response);
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

  setMessage(serverMessage);
}

 finally {
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
              Log in to stay connected with your friends,<br />
              and discover new stories every day.
            </p>
          </div>

          <div className="social-icons">
          <a href="#" className="social-icon" aria-label="Facebook">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="#" className="social-icon" aria-label="Google">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </a>
          <a href="#" className="social-icon" aria-label="Pinterest">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0a12 12 0 0 0-4.37 23.17c-.07-.65-.13-1.64.03-2.35l1.15-4.87s-.29-.59-.29-1.46c0-1.37.79-2.39 1.78-2.39.84 0 1.24.63 1.24 1.38 0 .84-.54 2.1-.81 3.26-.23.98.49 1.77 1.46 1.77 1.75 0 3.1-1.85 3.1-4.51 0-2.36-1.7-4.01-4.12-4.01-2.81 0-4.46 2.1-4.46 4.27 0 .85.33 1.76.74 2.25.08.1.09.19.07.29l-.27 1.12c-.04.18-.15.22-.34.13-1.23-.57-2-2.36-2-3.8 0-3.1 2.25-5.95 6.49-5.95 3.41 0 6.06 2.43 6.06 5.67 0 3.38-2.13 6.1-5.09 6.1-.99 0-1.93-.52-2.25-1.13l-.61 2.33c-.22.86-.82 1.94-1.22 2.6A12 12 0 1 0 12 0z"/>
            </svg>
          </a>
          <a href="#" className="social-icon" aria-label="GitHub">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
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

            {message && <div className="message error">{message}</div>}

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