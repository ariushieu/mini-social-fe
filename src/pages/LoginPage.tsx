import React from 'react';
import LoginForm from '../features/auth/components/LoginForm';
import '../styles/auth/LoginPage.css';

const LoginPage: React.FC = () => (
  <div className="login-page">
    <div className="login-container">
      <h1 className="login-title">Đăng nhập</h1>
      <LoginForm />
    </div>
  </div>
);

export default LoginPage;