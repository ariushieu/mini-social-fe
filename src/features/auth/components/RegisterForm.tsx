import React, { useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import "../../../styles/auth/RegisterForm.css";
import { register } from "../../../api/auth";
import type { RegisterRequest } from "../../../types/auth/AuthRegister";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  bio: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  [key: string]: string | undefined;
}

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    bio: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const validateUsername = (value: string): string => {
    if (!value.trim()) return "Username cannot be empty";
    if (value.length < 5 || value.length > 12)
      return "Username must be 5-12 characters";
    return "";
  };

  const validateEmail = (value: string): string => {
    if (!value.trim()) return "Email cannot be empty";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Invalid email format";
    return "";
  };

  const validatePassword = (value: string): string => {
    if (!value) return "Password cannot be empty";
    if (value.length < 8) return "Password must be at least 8 characters";
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_=+{};:'"<>,.?\/~`]).{8,}$/;
    if (!strongRegex.test(value))
      return "Password must include upper, lower, number, special";
    return "";
  };

  const validateConfirmPassword = (value: string): string => {
    if (!value) return "Confirm password cannot be empty";
    if (value !== formData.password) return "Passwords do not match";
    return "";
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "username":
        return validateUsername(value);
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      case "confirmPassword":
        return validateConfirmPassword(value);
      default:
        return "";
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const errorMessage = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMessage }));
  };

  const validateAll = (): FormErrors => {
    return {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword),
    };
  };

  const validateCurrentStep = (): FormErrors => {
    const stepErrors: FormErrors = {};

    switch (currentStep) {
      case 1:
        stepErrors.email = validateEmail(formData.email);
        stepErrors.username = validateUsername(formData.username);
        break;
      case 2:
        stepErrors.password = validatePassword(formData.password);
        stepErrors.confirmPassword = validateConfirmPassword(
          formData.confirmPassword
        );
        break;
      case 3:
        // Step 3 chỉ có fullName và bio, không cần validation đặc biệt
        break;
    }

    return stepErrors;
  };

  const hasErrors = (errs: FormErrors): boolean =>
    Object.values(errs).some((msg) => !!msg);

  const nextStep = () => {
    const currentErrors = validateCurrentStep();
    setErrors(currentErrors);

    if (!hasErrors(currentErrors) && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setMessage("");

    if (currentStep < 3) {
      nextStep();
      return;
    }

    const currentErrors = validateAll();
    setErrors(currentErrors);
    if (hasErrors(currentErrors)) return;

    if (!agreedToTerms) {
      setMessage("Vui lòng đồng ý với điều khoản dịch vụ");
      return;
    }

    try {
      setSubmitting(true);

      const payload: RegisterRequest = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        bio: formData.bio,
      };

      await register(payload);

      setMessage("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        bio: "",
      });
      setErrors({});
      setAgreedToTerms(false);
      setCurrentStep(1);
    } catch (error: any) {
      console.error("Register error:", error);

      const serverMessage =
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        error.message ||
        "Có lỗi xảy ra.";

      setMessage(`${serverMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="VD: email@domain.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Nhập username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? "input-error" : ""}
              />
              {errors.username && (
                <span className="error-text">{errors.username}</span>
              )}
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="new-password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
              />
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "input-error" : ""}
              />
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="form-group">
              <label htmlFor="fullName">Họ và tên</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Nhập họ và tên"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Giới thiệu</label>
              <textarea
                id="bio"
                name="bio"
                placeholder="Viết vài dòng về bạn..."
                value={formData.bio}
                onChange={handleChange}
                rows={3}
              />
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
                <a href="/terms" className="terms-link">
                  Terms of service
                </a>
              </label>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        {/* Left side - Branding */}
        <div className="register-left">
          <div>
            <h1 className="welcome-title">
              Welcome to <br /> iSocial
            </h1>
            <p className="welcome-description">
              Sign up to connect with your friends,
              <br />
              and discover new stories every day.
            </p>
          </div>

          <div className="social-icons">
            <a href="#" className="social-icon" aria-label="Facebook">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="Google">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="Pinterest">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0a12 12 0 0 0-4.37 23.17c-.07-.65-.13-1.64.03-2.35l1.15-4.87s-.29-.59-.29-1.46c0-1.37.79-2.39 1.78-2.39.84 0 1.24.63 1.24 1.38 0 .84-.54 2.1-.81 3.26-.23.98.49 1.77 1.46 1.77 1.75 0 3.1-1.85 3.1-4.51 0-2.36-1.7-4.01-4.12-4.01-2.81 0-4.46 2.1-4.46 4.27 0 .85.33 1.76.74 2.25.08.1.09.19.07.29l-.27 1.12c-.04.18-.15.22-.34.13-1.23-.57-2-2.36-2-3.8 0-3.1 2.25-5.95 6.49-5.95 3.41 0 6.06 2.43 6.06 5.67 0 3.38-2.13 6.1-5.09 6.1-.99 0-1.93-.52-2.25-1.13l-.61 2.33c-.22.86-.82 1.94-1.22 2.6A12 12 0 1 0 12 0z" />
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="GitHub">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Right side - Register Form */}
        <div className="register-right">
          <form className="register-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-header">
              <h2 className="form-title">ĐĂNG KÝ</h2>
              <div className="step-indicator">
                <span className="step-text">Bước {currentStep} / 3</span>
                <div className="step-progress">
                  <div
                    className="step-bar"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {renderStepContent()}

            <div className="form-actions">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={prevStep}
                >
                  Quay lại
                </button>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting
                  ? "Đang đăng ký..."
                  : currentStep < 3
                  ? "Tiếp theo"
                  : "Đăng ký"}
                <span className="arrow">→</span>
              </button>
            </div>

            {message && (
              <div
                className={`message ${
                  message.startsWith("Đăng ký thành công") ? "success" : "error"
                }`}
              >
                {message}
              </div>
            )}

            <div className="login-link">
              Already have an account? <a href="/auth/login">Sign in</a>
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

export default RegisterForm;
