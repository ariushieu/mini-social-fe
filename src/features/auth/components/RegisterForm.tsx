import React, { useState } from "react";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import "../../../styles/auth/RegisterForm.css";
import { register } from "../../../api/auth";
import type { RegisterRequest } from "../../../types/auth/AuthRegister";

interface FormData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  bio: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  [key: string]: string | undefined;
}

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    fullName: "",
    bio: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

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

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "username":
        return validateUsername(value);
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
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
    };
  };

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
      fullName: "",
      bio: "",
    });
    setErrors({});
  } catch (error: any) {
  console.error("Register error:", error);

  const serverMessage =
    error.response?.data?.message ||
    JSON.stringify(error.response?.data) ||
    error.message ||
    "Có lỗi xảy ra.";
    
  setMessage(`${serverMessage}`);
}
 finally {
    setSubmitting(false);
  }
};


  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-left">
          <form
            className="register-form"
            onSubmit={(e: FormEvent<HTMLFormElement>) => e.preventDefault()}
          >
            <h2 className="form-title">Tạo tài khoản</h2>

            <p className="form-subtitle">
              Tham gia cùng chúng tôi! Điền thông tin để bắt đầu.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={errors.username ? "input-error" : ""}
                  aria-invalid={!!errors.username}
                  aria-describedby="username-error"
                  required
                />
                {errors.username && (
                  <span id="username-error" className="error-text">
                    {errors.username}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="fullName">Họ và tên:</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

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
                aria-describedby="password-error password-help"
                required
              />
              <small id="password-help" className="help-text">
                Tối thiểu 8 ký tự, gồm hoa, thường, số và ký tự đặc biệt.
              </small>
              {errors.password && (
                <span id="password-error" className="error-text">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="bio">Giới thiệu:</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <button type="submit" disabled={submitting} onClick={handleSubmit}>
              {submitting ? "Đang đăng ký..." : "Đăng ký"}
            </button>

            {message && (
              <div
                className={`message ${
                  message.startsWith("Đăng ký thành công") ? "success" : "error"
                }`}
              >
                {message}
              </div>
            )}
          </form>
        </div>

        {/* Right Side - Illustration */}
        <div className="register-right">
          <img
            src="/images/z7030137390264_0e9a1fba36897ba032cb4fe20d7883fe.jpg"
            alt="Register Illustration"
            className="illustration-image"
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
