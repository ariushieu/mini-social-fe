import axios from "axios";
import type { PostResponse, CreatePostRequest } from "../types/post/Post";

const API_URL = "http://localhost:8080/api/posts";

function authHeaders() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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
      ...authHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getPosts = async (): Promise<PostResponse[]> => {
  const response = await axios.get<PostResponse[]>(`${API_URL}`, {
    headers: authHeaders(),
  });
  return response.data;
};

export const getPostsByUser = async (
  userId: number
): Promise<PostResponse[]> => {
  const response = await axios.get<PostResponse[]>(
    `${API_URL}/lists/${userId}`,
    {
      headers: authHeaders(),
    }
  );
  return response.data;
};

export const getPost = async (id: number): Promise<PostResponse> => {
  const response = await axios.get<PostResponse>(`${API_URL}/${id}`, {
    headers: authHeaders(),
  });
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
      ...authHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deletePost = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`, {
    headers: authHeaders(),
  });
};

export default {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
};
