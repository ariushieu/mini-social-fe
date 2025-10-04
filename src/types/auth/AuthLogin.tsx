export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  fullName: string;
  bio: string;
  role: string;
  profilePicture: string | null;
  followerCount: number;
  followingCount: number;
  joinDate: string;
  lastLogin: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserData;
}
