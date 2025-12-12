import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../styles/components/Profile.css";
import { getProfile } from "../../api/profile";
import {
  likePost,
  unlikePost,
  checkLike,
  getLikes,
  type LikeUser,
} from "../../api/posts";
import { useAuth } from "../../features/auth/AuthProvider";
import Loading from "../../components/Loading";

interface ProfileUser {
  id: string;
  name: string;
  title: string;
  location: string;
  avatar: string;
  coverPhoto?: string;
  tags: string[];
  about: {
    intro: string;
    description: string[];
  };
  locationInfo: string;
  joinDate?: string;
  lastLogin?: string;
  socialLinks: {
    website?: string;
    facebook?: string;
    instagram?: string;
  };
  followerCount?: number;
  followingCount?: number;
}

interface Comment {
  id: number;
  author: string;
  avatar: string;
  text: string;
  time: string;
  image?: string;
}

interface Post {
  id: number;
  author: string;
  avatar: string;
  action: string;
  time: string;
  content: string;
  image?: string;
  images?: string[]; // Support multiple images
  linkPreview?: {
    image: string;
    title: string;
    url: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares?: number;
  };
  commentsList?: Comment[];
  totalComments?: number;
}

interface SimilarProfile {
  id: number;
  name: string;
  industry: string;
  avatar: string;
}

const mockSimilarProfiles: SimilarProfile[] = [
  {
    id: 1,
    name: "Vicente Reyes",
    industry: "Designer",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: 2,
    name: "Marc Brooks",
    industry: "Developer",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: 3,
    name: "Ronald Bailey",
    industry: "Marketing",
    avatar: "https://i.pravatar.cc/150?img=13",
  },
  {
    id: 4,
    name: "Fannie Waters",
    industry: "Product Manager",
    avatar: "https://i.pravatar.cc/150?img=14",
  },
];

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const auth = useAuth();

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [similarProfiles] = useState<SimilarProfile[]>(mockSimilarProfiles);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [likesModal, setLikesModal] = useState<{
    postId: number;
    users: LikeUser[];
  } | null>(null);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const hasShownErrorToast = React.useRef(false);

  // Check for dark mode from localStorage and apply to body
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("isDarkMode");
    const isDark = savedDarkMode === "true";

    setIsDarkMode(isDark);

    // Apply dark mode to body
    if (isDark) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    // Listen for storage changes (when other tabs change dark mode)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "isDarkMode") {
        const newDarkMode = e.newValue === "true";
        setIsDarkMode(newDarkMode);

        if (newDarkMode) {
          document.body.classList.add("dark-mode");
        } else {
          document.body.classList.remove("dark-mode");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Fetch user profile and posts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        toast.error("User ID không hợp lệ");
        navigate("/");
        return;
      }

      try {
        setLoading(true);

        // Debug: Check if we have tokens
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        console.log("Has access token:", !!accessToken);
        console.log("Has refresh token:", !!refreshToken);

        // Fetch profile data with posts from profile API
        const profileData = await getProfile(Number(userId));

        // Map API posts to local Post interface
        const mappedPosts: Post[] = profileData.posts.map((post) => {
          const postAuthor =
            post.user.fullName || post.user.username || `User ${post.user.id}`;
          const postAvatar =
            post.user.profilePicture && post.user.profilePicture.trim() !== ""
              ? post.user.profilePicture
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  postAuthor
                )}&background=1877f2&color=fff&size=50`;

          return {
            id: post.id,
            author: postAuthor,
            avatar: postAvatar,
            action: "đã đăng một bài viết",
            time: post.createdAt
              ? new Date(post.createdAt).toLocaleDateString("vi-VN")
              : "recently",
            content: post.content,
            images: post.media?.map((m) => m.mediaUrl) || [], // Map all media
            image:
              post.media && post.media.length > 0
                ? post.media[0].mediaUrl
                : undefined,
            stats: {
              likes: post.likeCount || 0,
              comments: post.commentCount || 0,
              shares: 0,
            },
          };
        });

        const reversedPosts = mappedPosts.reverse();
        setPosts(reversedPosts);

        // Check like status for each post
        const likedSet = new Set<number>();
        await Promise.all(
          reversedPosts.map(async (post) => {
            try {
              const isLiked = await checkLike(post.id);
              if (isLiked) {
                likedSet.add(post.id);
              }
            } catch {
              // Ignore errors for individual like checks
            }
          })
        );
        setLikedPosts(likedSet);

        // Set user profile data from API response
        console.log(
          "DEBUG profileData.profilePicture:",
          profileData.profilePicture
        );
        const avatarUrl =
          profileData.profilePicture && profileData.profilePicture.trim() !== ""
            ? profileData.profilePicture
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                profileData.fullName || profileData.username || "User"
              )}&background=1877f2&color=fff&size=200`;
        console.log("DEBUG avatarUrl:", avatarUrl);

        setUser({
          id: String(profileData.id),
          name: profileData.fullName || profileData.username || "User",
          title: "Member",
          location: "Việt Nam",
          avatar: avatarUrl,
          tags: ["Member"],
          about: {
            intro: `Xin chào, tôi là ${
              profileData.fullName || profileData.username
            }!`,
            description: [profileData.bio || "Chưa có thông tin giới thiệu."],
          },
          joinDate: new Date(profileData.joinDate).toLocaleDateString("vi-VN"),
          lastLogin: new Date(profileData.lastLogin).toLocaleDateString(
            "vi-VN"
          ),
          locationInfo: "",
          socialLinks: {
            website: undefined,
            facebook: undefined,
            instagram: undefined,
          },
          followerCount: profileData.followerCount,
          followingCount: profileData.followingCount,
        });
      } catch (error: any) {
        console.error("Error fetching user data:", error);

        // Handle different error cases - only show toast once using ref
        if (!hasShownErrorToast.current) {
          hasShownErrorToast.current = true;

          if (error.response?.status === 401) {
            // axiosConfig will handle redirect to login, no need for toast here
            console.log("Token expired, will be redirected to login");
          } else if (error.response?.status === 404) {
            toast.error("Không tìm thấy người dùng này");
          } else if (error.response) {
            // Other HTTP errors
            toast.error(
              `Lỗi: ${error.response.status} - Không thể tải thông tin người dùng`
            );
          } else if (error.request) {
            // Network error
            toast.error(
              "Lỗi kết nối. Vui lòng kiểm tra kết nối mạng hoặc server backend."
            );
          } else {
            // Other errors
            toast.error("Đã xảy ra lỗi không xác định");
          }
        }

        setUser(null);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    // Reset toast flag when userId changes
    hasShownErrorToast.current = false;
    fetchUserData();
  }, [userId, navigate, auth.user]);

  const handleSendMessage = () => {
    if (!user) return;
    console.log("Send message to:", user.name);
    toast.info("Tính năng nhắn tin đang được phát triển");
  };

  const handleLike = async (postId: number) => {
    const isLiked = likedPosts.has(postId);

    try {
      if (isLiked) {
        // Unlike
        await unlikePost(postId);
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  stats: { ...post.stats, likes: post.stats.likes - 1 },
                }
              : post
          )
        );
      } else {
        // Like
        await likePost(postId);
        setLikedPosts((prev) => new Set(prev).add(postId));
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  stats: { ...post.stats, likes: post.stats.likes + 1 },
                }
              : post
          )
        );
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      toast.error("Không thể thực hiện thao tác");
    }
  };

  const handleComment = (postId: number) => {
    console.log("Comment on post:", postId);
    toast.info("Tính năng comment đang được phát triển");
  };

  const handleShare = (postId: number) => {
    console.log("Share post:", postId);
    toast.info("Tính năng share đang được phát triển");
  };

  const handleShowLikes = async (postId: number) => {
    try {
      setLoadingLikes(true);
      const users = await getLikes(postId);
      setLikesModal({ postId, users });
    } catch (error) {
      console.error("Error fetching likes:", error);
      toast.error("Không thể tải danh sách người thích");
    } finally {
      setLoadingLikes(false);
    }
  };

  const closeLikesModal = () => {
    setLikesModal(null);
  };

  if (loading) {
    return (
      <Loading
        type="spinner"
        fullscreen
        text="Đang tải thông tin người dùng..."
      />
    );
  }

  if (!user) {
    return (
      <div className="profile-page-error-container">
        Không tìm thấy người dùng này hoặc họ chưa có bài đăng nào.
      </div>
    );
  }

  return (
    <div className={`profile-page-wrapper ${isDarkMode ? "dark-mode" : ""}`}>
      {/* Cover + Profile Header - Full Width */}
      <div className="profile-header-section">
        <div className="profile-cover">
          <button onClick={() => navigate("/")} className="profile-back-btn">
            ← Trang chủ
          </button>
        </div>
        <div className="profile-header-container">
          <div className="profile-header-row">
            <div className="profile-avatar-wrapper">
              <img
                src={user.avatar}
                alt={user.name}
                className="profile-avatar-img"
              />
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-friends">
                {user.followerCount?.toLocaleString() || 0} người theo dõi ·{" "}
                {user.followingCount?.toLocaleString() || 0} đang theo dõi
              </p>
            </div>
            <div className="profile-actions">
              <button
                className="profile-btn-primary"
                onClick={handleSendMessage}
              >
                Nhắn tin
              </button>
              <button className="profile-btn-secondary">Theo dõi</button>
            </div>
          </div>
          <div className="profile-tabs">
            <span className="profile-tab active">Bài viết</span>
            <span className="profile-tab">Giới thiệu</span>
            <span className="profile-tab">Ảnh</span>
          </div>
        </div>
      </div>

      {/* Content Area - 2 columns */}
      <div className="profile-content">
        {/* Left Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-card">
            <h3 className="profile-card-title">Giới thiệu</h3>
            <p className="profile-bio">{user.about.description[0]}</p>
            <div className="profile-info-list">
              <div className="profile-info-row">
                <span className="profile-info-icon">📍</span>
                <span className="profile-info-text">
                  Sống tại <strong>{user.location}</strong>
                </span>
              </div>
              {user.joinDate && (
                <div className="profile-info-row">
                  <span className="profile-info-icon">📅</span>
                  <span className="profile-info-text">
                    Tham gia <strong>{user.joinDate}</strong>
                  </span>
                </div>
              )}
              {user.lastLogin && (
                <div className="profile-info-row">
                  <span className="profile-info-icon">🕐</span>
                  <span className="profile-info-text">
                    Đăng nhập lần cuối <strong>{user.lastLogin}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="profile-card">
            <h3 className="profile-card-title">Gợi ý theo dõi</h3>
            {similarProfiles.map((profile) => (
              <div key={profile.id} className="profile-suggest-item">
                <img
                  src={profile.avatar}
                  alt=""
                  className="profile-suggest-avatar"
                />
                <div className="profile-suggest-info">
                  <span className="profile-suggest-name">{profile.name}</span>
                  <span className="profile-suggest-role">
                    {profile.industry}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Posts */}
        <div className="profile-main">
          <div className="profile-card">
            <h3 className="profile-card-title">Bài viết</h3>
            {posts.length === 0 ? (
              <p className="profile-no-posts">Chưa có bài viết nào.</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="post-item">
                  <div className="post-header">
                    <img src={post.avatar} alt="" className="post-avatar" />
                    <div className="post-meta">
                      <span className="post-author">{post.author}</span>
                      <span className="post-time">{post.time}</span>
                    </div>
                  </div>
                  <p className="post-text">{post.content}</p>
                  {post.images && post.images.length > 0 && (
                    <div
                      className={`post-images post-images-${Math.min(
                        post.images.length,
                        4
                      )}`}
                    >
                      {post.images.slice(0, 4).map((img, idx) => (
                        <div key={idx} className="post-image-item">
                          <img src={img} alt="" />
                          {idx === 3 && post.images!.length > 4 && (
                            <div className="post-image-more">
                              +{post.images!.length - 4}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="post-stats">
                    <span
                      className="post-stats-likes"
                      onClick={() => handleShowLikes(post.id)}
                    >
                      {post.stats.likes} lượt thích
                    </span>
                    <span>{post.stats.comments} bình luận</span>
                  </div>
                  <div className="post-actions">
                    <button
                      className={`post-action ${
                        likedPosts.has(post.id) ? "liked" : ""
                      }`}
                      onClick={() => handleLike(post.id)}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={likedPosts.has(post.id) ? "#e74c3c" : "none"}
                        stroke={
                          likedPosts.has(post.id) ? "#e74c3c" : "currentColor"
                        }
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {likedPosts.has(post.id) ? "Đã thích" : "Thích"}
                    </button>
                    <button
                      className="post-action"
                      onClick={() => handleComment(post.id)}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                      Bình luận
                    </button>
                    <button
                      className="post-action"
                      onClick={() => handleShare(post.id)}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                      Chia sẻ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Likes Modal */}
      {likesModal && (
        <div className="likes-modal-overlay" onClick={closeLikesModal}>
          <div className="likes-modal" onClick={(e) => e.stopPropagation()}>
            <div className="likes-modal-header">
              <h3>Người đã thích</h3>
              <button className="likes-modal-close" onClick={closeLikesModal}>
                ✕
              </button>
            </div>
            <div className="likes-modal-body">
              {loadingLikes ? (
                <div className="likes-modal-loading">Đang tải...</div>
              ) : likesModal.users.length === 0 ? (
                <div className="likes-modal-empty">
                  Chưa có ai thích bài viết này
                </div>
              ) : (
                likesModal.users.map((likeUser) => (
                  <div
                    key={likeUser.id}
                    className="likes-modal-user"
                    onClick={() => {
                      closeLikesModal();
                      navigate(`/profile/${likeUser.id}`);
                    }}
                  >
                    <img
                      src={
                        likeUser.profilePicture ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          likeUser.fullName || likeUser.username
                        )}&background=1877f2&color=fff&size=40`
                      }
                      alt=""
                      className="likes-modal-avatar"
                    />
                    <div className="likes-modal-info">
                      <span className="likes-modal-name">
                        {likeUser.fullName || likeUser.username}
                      </span>
                      <span className="likes-modal-username">
                        @{likeUser.username}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
