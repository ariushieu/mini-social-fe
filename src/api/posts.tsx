import axios from "./axiosConfig";
import type {
  PostResponse,
  CreatePostRequest,
  NewsfeedResponse,
} from "../types/post/Post";

const API_URL = "http://localhost:8080/api/posts";
const API_V1_URL = "http://localhost:8080/api/v1";

export const createPost = async (
  data: CreatePostRequest
): Promise<PostResponse> => {
  const form = new FormData();
  form.append("content", data.content);
  if (data.mediaFiles) {
    data.mediaFiles.forEach((file) => form.append("mediaFiles", file));
  }

  // Controller expects POST /api/posts/create
  const response = await axios.post<PostResponse>(`${API_URL}/create`, form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getPosts = async (): Promise<PostResponse[]> => {
  const response = await axios.get<PostResponse[]>(`${API_URL}`);
  return response.data;
};

export const getPostsByUser = async (
  userId: number
): Promise<PostResponse[]> => {
  const response = await axios.get<PostResponse[]>(
    `${API_URL}/lists/${userId}`
  );
  return response.data;
};

export const getPost = async (id: number): Promise<PostResponse> => {
  const response = await axios.get<PostResponse>(`${API_URL}/${id}`);
  return response.data;
};

export const updatePost = async (
  id: number,
  data: CreatePostRequest
): Promise<PostResponse> => {
  const form = new FormData();
  form.append("content", data.content);
  if (data.mediaFiles) {
    data.mediaFiles.forEach((file) => form.append("mediaFiles", file));
  }

  const response = await axios.put<PostResponse>(`${API_URL}/${id}`, form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deletePost = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};

export const likePost = async (postId: number): Promise<void> => {
  await axios.post(`http://localhost:8080/api/v1/posts/${postId}/likes`, {});
};

export const unlikePost = async (postId: number): Promise<void> => {
  await axios.delete(`http://localhost:8080/api/v1/posts/${postId}/likes`);
};

export const checkLike = async (postId: number): Promise<boolean> => {
  const response = await axios.get<boolean>(
    `http://localhost:8080/api/v1/posts/${postId}/likes/check`
  );
  return response.data;
};

export interface LikeUser {
  id: number;
  username: string;
  fullName?: string;
  profilePicture?: string;
}

export const getLikes = async (postId: number): Promise<LikeUser[]> => {
  const response = await axios.get<LikeUser[]>(
    `http://localhost:8080/api/v1/posts/${postId}/likes`
  );
  return response.data;
};

// Get newsfeed from followed users
export const getFollowingFeed = async (
  page = 0,
  size = 20
): Promise<NewsfeedResponse> => {
  const response = await axios.get<NewsfeedResponse>(
    `${API_V1_URL}/newsfeed?page=${page}&size=${size}`
  );
  return response.data;
};

export default {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  checkLike,
  getLikes,
  getFollowingFeed,
};
