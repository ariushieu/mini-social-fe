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
  isLiked?: boolean;
};

// Newsfeed API response types
export type NewsfeedResponse = {
  content: PostResponse[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
};

export type CreatePostRequest = {
  content: string;
  mediaFiles?: File[];
};
