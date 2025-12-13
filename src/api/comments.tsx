import axios from "./axiosConfig";

const API_URL = "http://localhost:8080/api/v1/posts";

export interface CommentUser {
  id: number;
  username: string;
  fullName: string;
  profilePicture: string | null;
}

export interface Comment {
  id: number;
  postId: number;
  user: CommentUser;
  commentText: string;
  likeCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  replies: Comment[] | null;
}

// Get comments of a post
export const getComments = async (postId: number): Promise<Comment[]> => {
  const response = await axios.get(`${API_URL}/${postId}/comments`);
  return response.data;
};

// Create a comment
export const createComment = async (
  postId: number,
  commentText: string,
  userId: number,
  parentCommentId?: number | null
): Promise<Comment> => {
  const response = await axios.post(`${API_URL}/${postId}/comments`, {
    userId,
    postId,
    parentCommentId: parentCommentId || null,
    commentText,
  });
  return response.data;
};

// Update a comment
export const updateComment = async (
  postId: number,
  commentId: number,
  commentText: string
): Promise<Comment> => {
  const response = await axios.put(
    `${API_URL}/${postId}/comments/${commentId}`,
    { commentText }
  );
  return response.data;
};

// Delete a comment
export const deleteComment = async (
  postId: number,
  commentId: number
): Promise<void> => {
  await axios.delete(`${API_URL}/${postId}/comments/${commentId}`);
};

// Get replies of a comment
export const getReplies = async (
  postId: number,
  commentId: number
): Promise<Comment[]> => {
  const response = await axios.get(
    `${API_URL}/${postId}/comments/${commentId}/replies`
  );
  return response.data;
};

const LIKE_API_URL = "http://localhost:8080/api/v1/comments";

// Like a comment
export const likeComment = async (commentId: number): Promise<void> => {
  await axios.post(`${LIKE_API_URL}/${commentId}/likes`);
};

// Unlike a comment
export const unlikeComment = async (commentId: number): Promise<void> => {
  await axios.delete(`${LIKE_API_URL}/${commentId}/likes`);
};

// Check if user liked a comment
export const checkCommentLike = async (commentId: number): Promise<boolean> => {
  const response = await axios.get(`${LIKE_API_URL}/${commentId}/likes/check`);
  return response.data;
};

// Get users who liked a comment
export const getCommentLikes = async (
  commentId: number
): Promise<CommentUser[]> => {
  const response = await axios.get(`${LIKE_API_URL}/${commentId}/likes`);
  return response.data;
};

export default {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  getReplies,
  likeComment,
  unlikeComment,
  checkCommentLike,
  getCommentLikes,
};
