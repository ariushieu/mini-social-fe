import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../styles/components/Profile.css";
import { getProfile } from "../../api/profile";
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
    industry: "Industry",
    avatar:
      "https://media.vov.vn/sites/default/files/styles/large/public/2022-12/messi.jpg",
  },
  {
    id: 2,
    name: "Marc Brooks",
    industry: "Industry",
    avatar:
      "https://media.vov.vn/sites/default/files/styles/large/public/2022-12/messi.jpg",
  },
  {
    id: 3,
    name: "Ronald Bailey",
    industry: "Industry",
    avatar:
      "https://media.vov.vn/sites/default/files/styles/large/public/2022-12/messi.jpg",
  },
  {
    id: 4,
    name: "Fannie Waters",
    industry: "Industry",
    avatar:
      "https://media.vov.vn/sites/default/files/styles/large/public/2022-12/messi.jpg",
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
        const mappedPosts: Post[] = profileData.posts.map((post) => ({
          id: post.id,
          author:
            post.user.fullName || post.user.username || `User ${post.user.id}`,
          avatar: post.user.profilePicture || "https://via.placeholder.com/50",
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
        }));

        setPosts(mappedPosts);

        // Set user profile data from API response
        setUser({
          id: String(profileData.id),
          name: profileData.fullName || profileData.username || "User",
          title: "Member",
          location: "Việt Nam",
          avatar:
            profileData.profilePicture || "https://via.placeholder.com/200",
          tags: ["Member"],
          about: {
            intro: `Xin chào, tôi là ${
              profileData.fullName || profileData.username
            }!`,
            description: [profileData.bio || "Chưa có thông tin giới thiệu."],
          },
          locationInfo: `Tham gia: ${new Date(
            profileData.joinDate
          ).toLocaleDateString("vi-VN")} • Đăng nhập lần cuối: ${new Date(
            profileData.lastLogin
          ).toLocaleDateString("vi-VN")}`,
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

  const handleLike = (postId: number) => {
    console.log("Like post:", postId);
    toast.info("Tính năng like đang được phát triển");
  };

  const handleComment = (postId: number) => {
    console.log("Comment on post:", postId);
    toast.info("Tính năng comment đang được phát triển");
  };

  const handleShare = (postId: number) => {
    console.log("Share post:", postId);
    toast.info("Tính năng share đang được phát triển");
  };

  if (loading) {
    return (
      <Loading
        type="skeleton"
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
      <button
        onClick={() => navigate("/")}
        className="profile-page-back-button"
        title="Quay lại trang chủ"
      >
        <i className="fas fa-chevron-left"></i>
        <span>Trang chủ</span>
      </button>

      <div className="profile-page-container">
        <div className="profile-page-main-content">
          {/* Header Card with Cover Photo and Profile Info */}
          <div className="profile-page-header-card">
            <div className="profile-page-cover-photo">
              <div className="profile-page-cover-overlay"></div>
            </div>
            <div className="profile-page-header-content">
              <div className="profile-page-avatar-section">
                <div className="profile-page-avatar-wrapper">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="profile-page-avatar-img"
                  />
                </div>
              </div>
              <div className="profile-page-header-info">
                <div className="profile-page-user-details">
                  <h1 className="profile-page-user-name">{user.name}</h1>
                  <p className="profile-page-user-username">@{user.id}</p>
                  <p className="profile-page-user-location">
                    <i className="fas fa-map-marker-alt"></i> {user.location}
                  </p>
                  {(user.followerCount !== undefined ||
                    user.followingCount !== undefined) && (
                    <div className="profile-page-stats">
                      {user.followerCount !== undefined && (
                        <div className="profile-page-stat-item">
                          <strong>{user.followerCount.toLocaleString()}</strong>
                          <span>Người theo dõi</span>
                        </div>
                      )}
                      {user.followingCount !== undefined && (
                        <div className="profile-page-stat-item">
                          <strong>
                            {user.followingCount.toLocaleString()}
                          </strong>
                          <span>Đang theo dõi</span>
                        </div>
                      )}
                      <div className="profile-page-stat-item">
                        <strong>{posts.length}</strong>
                        <span>Bài viết</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="profile-page-actions">
                  <button
                    className="profile-page-send-message-btn"
                    onClick={handleSendMessage}
                  >
                    <i className="fas fa-paper-plane"></i>
                    <span>Nhắn tin</span>
                  </button>
                  <button className="profile-page-follow-btn">
                    <i className="fas fa-user-plus"></i>
                    <span>Theo dõi</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* About Card */}
          <div className="profile-page-about-card">
            <h2 className="profile-page-about-title">
              <i className="fas fa-user"></i> Giới thiệu
            </h2>
            <p className="profile-page-about-text">
              {user.about.description[0]}
            </p>
            <div className="profile-page-info-grid">
              <div className="profile-page-info-item">
                <i className="fas fa-calendar-alt"></i>
                <span>{user.locationInfo}</span>
              </div>
            </div>
          </div>

          {/* Activity Card */}
          <div className="profile-page-activity-card">
            <h2 className="profile-page-activity-title">
              <i className="fas fa-th-large"></i> Bài viết ({posts.length})
            </h2>

            {posts.length === 0 ? (
              <div className="profile-page-no-posts">
                <i className="fas fa-inbox profile-page-no-posts-icon"></i>
                <p className="profile-page-no-posts-text">
                  Người dùng này chưa có bài viết nào.
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="profile-page-post-item">
                  <div className="profile-page-post-header">
                    <div className="profile-page-post-user-info">
                      <div className="profile-page-post-avatar-wrapper">
                        <img
                          src={post.avatar}
                          alt="Avatar"
                          className="profile-page-post-avatar"
                        />
                      </div>
                      <div className="profile-page-post-user-text">
                        <span className="profile-page-post-author">
                          {post.author}
                        </span>{" "}
                        <span className="profile-page-post-action">
                          {post.action}
                        </span>
                        <span className="profile-page-post-time">
                          {" "}
                          • {post.time}
                        </span>
                      </div>
                    </div>
                    <i className="fas fa-ellipsis-h profile-page-post-options"></i>
                  </div>

                  <div className="profile-page-post-content">
                    <p className="profile-page-post-text">{post.content}</p>
                  </div>

                  {post.images && post.images.length > 0 && (
                    <div className="profile-page-post-media-container">
                      {post.images.length === 1 ? (
                        <img
                          src={post.images[0]}
                          alt="Ảnh bài đăng"
                          className="profile-page-post-single-image"
                        />
                      ) : (
                        <div
                          className={`profile-page-post-images-grid profile-page-post-images-grid-${
                            post.images.length === 2 ? "2" : "3"
                          }`}
                        >
                          {post.images.slice(0, 6).map((imgUrl, idx) => (
                            <div
                              key={idx}
                              className="profile-page-post-image-item"
                            >
                              <img
                                src={imgUrl}
                                alt={`Ảnh ${idx + 1}`}
                                className="profile-page-post-grid-image"
                              />
                              {idx === 5 && post.images!.length > 6 && (
                                <div className="profile-page-post-image-overlay">
                                  +{post.images!.length - 6}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {post.linkPreview && (
                    <div className="profile-page-link-preview">
                      <img
                        src={post.linkPreview.image}
                        alt="Link Preview"
                        className="profile-page-link-preview-image"
                      />
                      <div className="profile-page-link-preview-content">
                        <span className="profile-page-link-preview-title">
                          {post.linkPreview.title}
                        </span>
                        <span className="profile-page-link-preview-url">
                          {post.linkPreview.url}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="profile-page-post-actions">
                    <span
                      className="profile-page-action-item"
                      onClick={() => handleLike(post.id)}
                    >
                      <i className="far fa-heart"></i> {post.stats.likes} Thích
                    </span>
                    <span
                      className="profile-page-action-item"
                      onClick={() => handleComment(post.id)}
                    >
                      <i className="far fa-comment-dots"></i>{" "}
                      {post.stats.comments} Bình luận
                    </span>
                    {post.stats.shares !== undefined && (
                      <span
                        className="profile-page-action-item"
                        onClick={() => handleShare(post.id)}
                      >
                        <i className="far fa-share-square"></i> Chia sẻ
                      </span>
                    )}
                  </div>

                  {post.commentsList && post.commentsList.length > 0 && (
                    <div className="profile-page-comments-section">
                      {post.commentsList.map((comment) => (
                        <div
                          key={comment.id}
                          className="profile-page-comment-item"
                        >
                          <div className="profile-page-comment-avatar-wrapper">
                            <img
                              src={comment.avatar}
                              alt="Avatar"
                              className="profile-page-comment-avatar"
                            />
                          </div>
                          <div className="profile-page-comment-body-wrapper">
                            <div className="profile-page-comment-body">
                              <span className="profile-page-comment-author">
                                {comment.author}
                              </span>
                              <span className="profile-page-comment-text">
                                {comment.text}
                              </span>
                              <span className="profile-page-comment-time">
                                {" "}
                                • {comment.time}
                              </span>
                            </div>
                            {comment.image && (
                              <div className="profile-page-comment-media">
                                <img
                                  src={comment.image}
                                  alt="Ảnh bình luận"
                                  className="profile-page-comment-image"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {post.totalComments &&
                        post.totalComments > post.commentsList.length && (
                          <a
                            href="#"
                            className="profile-page-view-more-comments"
                          >
                            Xem tất cả {post.totalComments} bình luận...
                          </a>
                        )}
                    </div>
                  )}
                </div>
              ))
            )}

            {posts.length > 0 && (
              <a href="#" className="profile-page-view-all-activity">
                Xem tất cả hoạt động
              </a>
            )}
          </div>
        </div>

        <div className="profile-page-sidebar">
          <div className="profile-page-location-card">
            <h3 className="profile-page-sidebar-title">
              <i className="fas fa-globe-americas"></i> Location
            </h3>
            <p className="profile-page-sidebar-text">{user.locationInfo}</p>
          </div>

          <div className="profile-page-connect-card">
            <h3 className="profile-page-sidebar-title">
              <i className="fas fa-link"></i> Connect
            </h3>
            <div className="profile-page-connect-links">
              {user.socialLinks.website && (
                <p className="profile-page-connect-item">
                  <i className="fas fa-globe"></i>{" "}
                  <a href="#" className="profile-page-connect-link">
                    {user.socialLinks.website}
                  </a>
                </p>
              )}
              {user.socialLinks.facebook && (
                <p className="profile-page-connect-item">
                  <i className="fab fa-facebook"></i>{" "}
                  <a href="#" className="profile-page-connect-link">
                    {user.socialLinks.facebook}
                  </a>
                </p>
              )}
              {user.socialLinks.instagram && (
                <p className="profile-page-connect-item">
                  <i className="fab fa-instagram"></i>{" "}
                  <a href="#" className="profile-page-connect-link">
                    {user.socialLinks.instagram}
                  </a>
                </p>
              )}
            </div>
          </div>

          <div className="profile-page-similar-profiles-card">
            <h3 className="profile-page-sidebar-title">
              <i className="fas fa-users"></i> Similar profiles
            </h3>
            {similarProfiles.map((profile) => (
              <div
                key={profile.id}
                className="profile-page-similar-profile-item"
              >
                <div className="profile-page-similar-profile-avatar-wrapper">
                  <img
                    src={profile.avatar}
                    alt="Avatar"
                    className="profile-page-similar-profile-avatar"
                  />
                </div>
                <div className="profile-page-similar-profile-info">
                  <p className="profile-page-similar-profile-name">
                    {profile.name}
                  </p>
                  <p className="profile-page-similar-profile-industry">
                    {profile.industry}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
