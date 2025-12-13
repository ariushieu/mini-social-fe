import axios from "./axiosConfig";

const API_URL = "http://localhost:8080/api/v1/follows";

// Follow user
export const followUser = async (followingId: number): Promise<void> => {
  await axios.post(`${API_URL}/${followingId}`);
};

// Unfollow user
export const unfollowUser = async (followingId: number): Promise<void> => {
  await axios.delete(`${API_URL}/${followingId}`);
};

// Check follow status
export const checkFollowStatus = async (
  targetUserId: number
): Promise<boolean> => {
  const response = await axios.get(`${API_URL}/check/${targetUserId}`);
  return response.data.isFollowing;
};

export interface FollowUser {
  id: number;
  username: string;
  fullName: string;
  profilePicture: string | null;
  bio?: string;
  isFollowing?: boolean;
  followedAt?: string;
}

// Get list of users that userId is following
export const getFollowing = async (
  userId: number,
  page = 0,
  size = 20
): Promise<FollowUser[]> => {
  const response = await axios.get(
    `${API_URL}/${userId}/following?page=${page}&size=${size}`
  );
  return response.data.content || [];
};

// Get list of followers of userId
export const getFollowers = async (
  userId: number,
  page = 0,
  size = 20
): Promise<FollowUser[]> => {
  const response = await axios.get(
    `${API_URL}/${userId}/followers?page=${page}&size=${size}`
  );
  return response.data.content || [];
};

export default {
  followUser,
  unfollowUser,
  checkFollowStatus,
  getFollowing,
  getFollowers,
};
