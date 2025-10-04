export type PostMedia = {
  id?: number;
  mediaUrl: string;
  mediaType: string; // 'image' | 'video'
};

export type AuthorResponse = {
  id: number;
  username: string;
  fullName?: string;
  profilePicture?: string;
};

export type PostResponse = {
  id: number;
  content: string;
  user: AuthorResponse;
  likeCount?: number;
  commentCount?: number;
  createdAt?: string;
  media?: PostMedia[];
};

export type CreatePostRequest = {
  content: string;
  mediaFiles?: File[];
};
