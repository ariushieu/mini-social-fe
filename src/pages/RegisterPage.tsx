import React from 'react';
import RegisterForm from '../features/auth/components/RegisterForm';

const RegisterPage: React.FC = () => (
  <div style={{ maxWidth: '4030px', margin: '0 auto', padding: '20px' }}>
    <h1>Đăng ký</h1>
    <RegisterForm />
  </div>
);

export default RegisterPage;