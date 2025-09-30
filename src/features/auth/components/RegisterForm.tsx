import React, { useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import "../../../styles/auth/RegisterForm.css";
import { register } from "../../../api/auth";
import type { RegisterRequest } from "../../../types/auth/AuthRegister";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // ====== Validation ======
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

    if (currentStep < 3) {
      nextStep();
      return;
    }

    const currentErrors = validateAll();
    setErrors(currentErrors);
    if (hasErrors(currentErrors)) {
      toast.error("Vui lòng kiểm tra lại các trường nhập!");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Vui lòng đồng ý với điều khoản dịch vụ");
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

      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
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

      toast.error(serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // ====== Render steps ======
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
        {/* Left side */}
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
