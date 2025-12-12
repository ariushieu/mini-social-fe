import axios from "./axiosConfig";
import { type LoginRequest, type LoginResponse } from "../types/auth/AuthLogin";
import {type RegisterRequest, type RegisterResponse } from "../types/auth/AuthRegister";

import '../../public/images/background.jpg'

const API_URL = 'http://localhost:8080/api/auth';

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await axios.post<RegisterResponse>(`${API_URL}/register`, data);
  return response.data;
};

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(`${API_URL}/login`, data);
  
  localStorage.setItem('accessToken', response.data.accessToken);
  localStorage.setItem('refreshToken', response.data.refreshToken);
  return response.data;
};