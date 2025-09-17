import { LocalDateTime } from "@js-joda/core";

export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  bio: string;
  role: string;
  profilePicture: string;
  followerCount: number;
  followingCount: number;
  joinDate: LocalDateTime;
  lastLogin: LocalDateTime;
  accessToken: string;
  refreshToken: string;
}
