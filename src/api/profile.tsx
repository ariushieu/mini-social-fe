import axios from "./axiosConfig"; // Import axios đã config interceptor

const API_URL = "http://localhost:8080/api/profile";

export interface ProfileMedia {
  id: number;
  mediaUrl: string;
  mediaType: string;
}

export interface ProfilePost {
  id: number;
  content: string;
  user: {
    id: number;
    username: string;
    fullName: string;
    profilePicture: string;
  };
  likeCount: number;
  commentCount: number;
  createdAt: string;
  media: ProfileMedia[];
}

export interface ProfileResponse {
  id: number;
  username: string;
  fullName: string;
  bio: string;
  profilePicture: string;
  followerCount: number;
  followingCount: number;
  joinDate: string;
  lastLogin: string;
  email: string | null;
  posts: ProfilePost[];
}

export const getProfile = async (userId: number): Promise<ProfileResponse> => {
  try {
    console.log(`Fetching profile for userId: ${userId}`);
    const response = await axios.post<ProfileResponse>(`${API_URL}/${userId}`);
    console.log("Profile data received:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error in getProfile:", error);
    console.error("Error response:", error.response);
    throw error;
  }
};

export default {
  getProfile,
};
