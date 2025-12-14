import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Home,
  Users,
  Settings,
  HelpCircle,
  Camera,
  Smile,
  Mic,
  X,
  Moon,
  Sun,
  Edit,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { toast } from "react-toastify";

import "../../styles/page/HomePage.css";
import {
  createPost,
  getFollowingFeed,
  getTrendingPosts,
  likePost,
  unlikePost,
  getLikes,
  type LikeUser,
} from "../../api/posts";
import {
  getComments,
  createComment,
  getReplies,
  likeComment,
  unlikeComment,
  checkCommentLike,
  type Comment as CommentType,
} from "../../api/comments";
import { useAuth } from "../../features/auth/AuthProvider";
import Loading from "../../components/Loading";

// Type definitions (Giữ nguyên)
interface User {
  id: string;
  username: string;
  displayName: string;
  location: string;
  avatar: string;
  stats: {
    posts: number;
    followers: string;
    following: number;
  };
  bio: string;
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  storyHighlights: {
    id: number;
    name: string;
    image: string;
  }[];
}

interface Post {
  id: number;
  user: {
    id: number; // numeric id to map to profile route
    name: string;
    role: string;
    avatar: string;
  };
  content: string;
  hashtags: string[];
  images?: string[];
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  timestamp: string;
}

// Mock API Data (Giữ nguyên)
const mockUser: User = {
  id: "x_ae_c_921",
  username: "@satthuduongbien",
  displayName: "Bắn Phát Chết",
  location: "Quê:36",
  avatar:
    "https://www.meme-arsenal.com/memes/4cdee02fbf6649b4e2c7b597f9d4d143.jpg",
  stats: {
    posts: 548,
    followers: "12.7K",
    following: 221,
  },
  bio: "👋 Hey, tôi là Sát Thủ Đường Biên. Điểm mạnh: biết bật máy tính .Điểm yếu: quên tắt máy tính .Sở thích: code dở nhưng vẫn tự tin up GitHub. Ước mơ: mỗi lần F5 web không báo lỗi.",
  contact: {
    phone: "+0363 6363636",
    email: "isocial@gmail.com",
    website: "www.isocial.com",
  },
  storyHighlights: [
    {
      id: 1,
      name: "France",
      image:
        "https://www.planetware.com/wpimages/2020/02/france-in-pictures-beautiful-places-to-photograph-eiffel-tower.jpg",
    },
    {
      id: 2,
      name: "Korea",
      image:
        "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=100&h=100&fit=crop",
    },
    {
      id: 3,
      name: "USA",
      image:
        "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=100&h=100&fit=crop",
    },
    {
      id: 4,
      name: "India",
      image:
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=100&h=100&fit=crop",
    },
  ],
};

// ⭐️ CẬP NHẬT: Thêm một bài đăng có 5 ảnh để test logic "Xem thêm"
const mockPosts: Post[] = [
  {
    id: 5,
    user: {
      id: 101,
      name: "Elon M. Sách",
      role: "CEO, X.com",
      avatar:
        "https://i.pinimg.com/originals/24/bd/d9/24bdd9ec59a9f8966722063fe7791183.jpg",
    },
    content:
      "Tập hợp 5 bức ảnh đẹp nhất tôi chụp bằng điện thoại. Ảnh thứ 5 là tuyệt nhất!",
    hashtags: ["#spacex", "#doge", "#tesla", "#life"],
    images: [
      "https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2024/02/anh-phong-canh-66-1.jpg",
      "https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2024/02/anh-phong-canh-66-1.jpg",
      "https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2024/02/anh-phong-canh-66-1.jpg",
      "https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2024/02/anh-phong-canh-66-1.jpg",
      "https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2024/02/anh-phong-canh-66-1.jpg",
      "https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2024/02/anh-phong-canh-66-1.jpg",
      "https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2024/02/anh-phong-canh-66-1.jpg",
      "https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2024/02/anh-phong-canh-66-1.jpg",
    ],
    stats: { likes: 12000, comments: 2500, shares: 1870 },
    timestamp: "1m",
  },
  {
    id: 1,
    user: {
      id: 102,
      name: "X_AE_A-13",
      role: "Product Designer, slothUI",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
    },
    content:
      "Habitant morbi tristique senectus et netus et. Suspendisse sed nisl lacus sed viverra. Dolor morbi non arcu risus quis varius.",
    hashtags: ["#amazing", "#great", "#lifetime", "#ux", "#machinelearning"],
    images: [
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop",
    ],
    stats: { likes: 12, comments: 25, shares: 187 },
    timestamp: "2h",
  },
  // ⭐️ BỔ SUNG: Bài đăng có 2 ảnh (sẽ hiển thị 2 cột)
  {
    id: 2,
    user: {
      id: 103,
      name: "Hongngoc_147",
      role: "Công chúa học bài",
      avatar:
        "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=50&h=50&fit=crop&crop=face",
    },
    content: "Công chúa học bài=)))",
    hashtags: ["#congchua", "#hocbai"],
    images: [
      "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=400&fit=crop",
    ],
    stats: { likes: 10900, comments: 104, shares: 256 },
    timestamp: "10h",
  },
  // ⭐️ BỔ SUNG: Bài đăng có 3 ảnh (sẽ hiển thị 3 cột hoặc layout tùy CSS)
  {
    id: 3,
    user: {
      id: 104,
      name: "Mai Sakurajima Senpai",
      role: "Product Designer, slothUI",
      avatar:
        "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=50&h=50&fit=crop&crop=face",
    },
    content:
      "Habitant morbi tristique senectus et netus et. Suspendisse sed nisl lacus sed viverra. Dolor morbi non arcu risus quis varius.",
    hashtags: ["#amazing", "#great", "#lifetime", "#ux", "#machinelearning"],
    images: [
      // ⭐️ CẬP NHẬT: dùng images[]
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1501785888041-af3ba58f8b1b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1534353438382-f544605963c6?w=600&h=400&fit=crop",
    ],
    stats: { likes: 12, comments: 25, shares: 187 },
    timestamp: "6h",
  },
  {
    id: 4,
    user: {
      id: 105,
      name: "Amanda D. Gray",
      role: "Product Designer, slothUI",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
    },
    content:
      "Habitant morbi tristique senectus et netus et. Suspendisse sed nisl lacus sed viverra. Dolor morbi non arcu risus quis varius.",
    hashtags: ["#amazing", "#great", "#lifetime", "#ux", "#machinelearning"],
    stats: { likes: 12, comments: 25, shares: 187 },
    timestamp: "4h",
  },
];

// --- ⭐️ BỔ SUNG: COMPONENT MODAL XEM ẢNH TOÀN MÀN HÌNH ---
interface ImageViewerModalProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  images,
  startIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [imageLoading, setImageLoading] = useState(true);

  const goToNext = () => {
    setImageLoading(true);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToPrev = () => {
    setImageLoading(true);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Xử lý đóng modal khi click ra ngoài overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    // Ngăn cuộn trang chính khi modal mở
    document.body.style.overflow = "hidden";

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowLeft") {
        goToPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, images.length]);

  return (
    <div className="image-viewer-modal-overlay" onClick={handleOverlayClick}>
      <div className="image-viewer-modal-content">
        <button
          className="viewer-close-btn"
          onClick={onClose}
          title="Đóng (Esc)"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="viewer-main-image">
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1} of ${images.length}`}
            onLoad={() => setImageLoading(false)}
            style={{ opacity: imageLoading ? 0.5 : 1 }}
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              className="viewer-nav-btn prev"
              onClick={goToPrev}
              title="Ảnh trước (←)"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              className="viewer-nav-btn next"
              onClick={goToNext}
              title="Ảnh tiếp (→)"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        <div className="viewer-caption">
          Ảnh {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

interface CreatePostModalProps {
  user: User;
  onClose: () => void;
  onPost: (content: string, files?: File[]) => Promise<void>;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  user,
  onClose,
  onPost,
}) => {
  const [postText, setPostText] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPostDisabled = !postText.trim() && selectedFiles.length === 0;

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

      setSelectedFiles((prev) => [...prev, ...newFiles]);
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
    event.target.value = "";
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setPreviewUrls((prev) => {
      const newUrls = prev.filter((_, index) => index !== indexToRemove);
      // Revoke URL to free memory
      URL.revokeObjectURL(prev[indexToRemove]);
      return newUrls;
    });
  };

  const handlePostSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onPost(postText, selectedFiles);
      setPostText("");
      setSelectedFiles([]);
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      onClose();
      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="create-post-modal-overlay" onClick={handleOverlayClick}>
      <div className="create-post-modal">
        {/* Header */}
        <div className="modal-header">
          <h3>Tạo bài viết</h3>
          <button
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="modal-user-info">
          <img src={user.avatar} alt="Avatar" className="modal-user-avatar" />
          <div className="user-details">
            <span className="modal-user-name">{user.displayName}</span>
          </div>
        </div>

        {/* Content Input */}
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder={`${user.displayName} ơi, bạn muốn chia sẻ điều gì?`}
          className="modal-textarea"
          rows={6}
          disabled={isSubmitting}
        />

        {/* ⭐️ CẬP NHẬT: Hiển thị nhiều ảnh Preview */}
        {previewUrls.length > 0 && (
          <div className="modal-images-preview-grid">
            {previewUrls.map((url, index) => (
              <div key={index} className="modal-image-preview-item">
                <img
                  src={url}
                  alt={`Image preview ${index + 1}`}
                  className="modal-image-preview"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="modal-remove-image-btn"
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action Bar */}
        <div className="modal-action-bar">
          <span className="action-bar-title">Thêm vào bài viết</span>
          <div className="action-bar-tools">
            <input
              type="file"
              id="modal-image-upload"
              accept="image/*,video/*"
              multiple
              onChange={handleImageSelect}
              style={{ display: "none" }}
              ref={fileInputRef}
              disabled={isSubmitting}
            />
            <label
              htmlFor="modal-image-upload"
              className={`modal-tool-btn ${isSubmitting ? "disabled" : ""}`}
              title="Thêm ảnh/video"
            >
              <Camera className="w-5 h-5" />
            </label>
            <button
              className="modal-tool-btn"
              disabled={isSubmitting}
              title="Thêm emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              className="modal-tool-btn"
              disabled={isSubmitting}
              title="Ghi âm"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Post Button */}
        <button
          onClick={handlePostSubmit}
          className={`modal-post-btn ${
            isPostDisabled || isSubmitting ? "disabled" : ""
          }`}
          disabled={isPostDisabled || isSubmitting}
        >
          {isSubmitting ? "Đang đăng..." : "Đăng bài"}
        </button>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH ---
const SlothuiInterface = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { isAuthenticated } = auth;
  const [activeTab, setActiveTab] = useState<string>("For You");
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem("isDarkMode");
    return saved === "true";
  });

  // State để mở/đóng Pop-up Đăng bài
  const [showCreatePostModal, setShowCreatePostModal] =
    useState<boolean>(false);

  // State để quản lý việc chỉnh sửa avatar
  const [isEditingAvatar, setIsEditingAvatar] = useState<boolean>(false);

  // State cho loading posts
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [followingPosts, setFollowingPosts] = useState<Post[]>([]);
  const [followingLoaded, setFollowingLoaded] = useState<boolean>(false);

  // State cho like và comment
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [likesModal, setLikesModal] = useState<{
    postId: number;
    users: LikeUser[];
  } | null>(null);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [commentsModal, setCommentsModal] = useState<{
    postId: number;
    comments: CommentType[];
  } | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(
    new Set()
  );
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());

  // ⭐️ BỔ SUNG: State và hàm cho Modal xem ảnh toàn màn hình
  const [viewerState, setViewerState] = useState<{
    images: string[];
    startIndex: number;
  } | null>(null);

  // Hàm mở Modal xem ảnh
  const handleViewImage = (images: string[], index: number) => {
    setViewerState({ images, startIndex: index });
  };

  // Hàm đóng Modal xem ảnh
  const handleCloseViewer = () => {
    setViewerState(null);
  };
  // ⭐️ KẾT THÚC BỔ SUNG: State và hàm cho Modal xem ảnh

  // Load user data from auth context
  useEffect(() => {
    if (auth.user) {
      setUser({
        id: String(auth.user.id ?? "x_ae_c_921"),
        username: auth.user.username ? `@${auth.user.username}` : "@user",
        displayName: auth.user.fullName || auth.user.username || "User",
        location: "Việt Nam",
        avatar:
          auth.user.profilePicture ||
          "https://ui-avatars.com/api/?name=" +
            encodeURIComponent(
              auth.user.fullName || auth.user.username || "User"
            ) +
            "&background=6366f1&color=fff&size=200",
        stats: {
          posts: 0,
          followers: String(auth.user.followerCount || 0),
          following: auth.user.followingCount || 0,
        },
        bio: auth.user.bio || "No bio yet",
        contact: {
          phone: "+84 xxx xxx xxx",
          email: auth.user.email || "",
          website: "www.isocial.com",
        },
        storyHighlights: [],
      });
    } else {
      setUser(mockUser);
    }
  }, [auth.user]);

  // Fetch trending posts for "For You" tab
  const [forYouLoaded, setForYouLoaded] = useState<boolean>(false);

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      if (forYouLoaded) return;

      setLoadingPosts(true);
      try {
        const response = await getTrendingPosts(0, 10);

        const likedSet = new Set<number>();

        const mappedPosts: Post[] = response.content.map((post) => {
          const postAuthor =
            post.user.fullName || post.user.username || `User ${post.user.id}`;
          const postAvatar =
            post.user.profilePicture && post.user.profilePicture.trim() !== ""
              ? post.user.profilePicture
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  postAuthor
                )}&background=1877f2&color=fff&size=50`;

          if (post.isLiked) {
            likedSet.add(post.id);
          }

          return {
            id: post.id,
            user: {
              id: post.user.id,
              name: postAuthor,
              role: "Member",
              avatar: postAvatar,
            },
            content: post.content,
            hashtags: [],
            images: post.media?.map((m) => m.mediaUrl) || [],
            stats: {
              likes: post.likeCount || 0,
              comments: post.commentCount || 0,
              shares: 0,
            },
            timestamp: post.createdAt
              ? new Date(post.createdAt).toLocaleDateString("vi-VN")
              : "recently",
          };
        });

        setLikedPosts((prev) => new Set([...prev, ...likedSet]));
        setPosts(mappedPosts);
        setForYouLoaded(true);
      } catch (error) {
        console.error("Error fetching trending posts:", error);
        // Fallback to mock posts if API fails
        setPosts(mockPosts);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchTrendingPosts();
  }, [forYouLoaded]);

  // Persist dark mode setting (scoped to component container via className)
  useEffect(() => {
    localStorage.setItem("isDarkMode", isDark.toString());
  }, [isDark]);

  // Fetch following feed when tab changes to "Following"
  useEffect(() => {
    const fetchFollowingFeed = async () => {
      if (activeTab !== "Following" || followingLoaded) return;

      setLoadingPosts(true);
      try {
        const response = await getFollowingFeed(0, 20);

        // Sử dụng isLiked từ response, không cần gọi checkLike riêng
        const likedSet = new Set<number>();

        const mappedPosts: Post[] = response.content.map((post) => {
          const postAuthor =
            post.user.fullName || post.user.username || `User ${post.user.id}`;
          const postAvatar =
            post.user.profilePicture && post.user.profilePicture.trim() !== ""
              ? post.user.profilePicture
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  postAuthor
                )}&background=1877f2&color=fff&size=50`;

          // Sử dụng isLiked từ API response
          if (post.isLiked) {
            likedSet.add(post.id);
          }

          return {
            id: post.id,
            user: {
              id: post.user.id,
              name: postAuthor,
              role: "Member",
              avatar: postAvatar,
            },
            content: post.content,
            hashtags: [],
            images: post.media?.map((m) => m.mediaUrl) || [],
            stats: {
              likes: post.likeCount || 0,
              comments: post.commentCount || 0,
              shares: 0,
            },
            timestamp: post.createdAt
              ? new Date(post.createdAt).toLocaleDateString("vi-VN")
              : "recently",
          };
        });

        // Cập nhật likedPosts với các post đã like từ following feed
        setLikedPosts((prev) => new Set([...prev, ...likedSet]));
        setFollowingPosts(mappedPosts);
        setFollowingLoaded(true);
      } catch (error) {
        console.error("Error fetching following feed:", error);
        toast.error("Không thể tải bài viết từ người bạn theo dõi");
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchFollowingFeed();
  }, [activeTab, followingLoaded]);

  const handleLike = async (postId: number) => {
    if (!isAuthenticated) {
      toast.info("Bạn cần đăng nhập để thực hiện thao tác này");
      navigate("/auth/login");
      return;
    }

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
        // Update both For You and Following posts
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
        setFollowingPosts((prevPosts) =>
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
        setFollowingPosts((prevPosts) =>
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

  const handleComment = async (postId: number) => {
    try {
      setLoadingComments(true);
      const comments = await getComments(postId);
      setCommentsModal({ postId, comments });

      // Check like status for all comments
      const likedSet = new Set<number>();
      const checkLikes = async (commentList: CommentType[]) => {
        for (const c of commentList) {
          try {
            const isLiked = await checkCommentLike(c.id);
            if (isLiked) likedSet.add(c.id);
          } catch {
            // Ignore
          }
          if (c.replies) await checkLikes(c.replies);
        }
      };
      await checkLikes(comments);
      setLikedComments(likedSet);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Không thể tải bình luận");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentsModal || !newComment.trim()) return;
    const currentUserId = Number(auth.user?.id);
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập");
      return;
    }
    try {
      const comment = await createComment(
        commentsModal.postId,
        newComment,
        currentUserId
      );
      setCommentsModal({
        ...commentsModal,
        comments: [comment, ...commentsModal.comments],
      });
      setNewComment("");
      // Update comment count in both lists
      setPosts((prev) =>
        prev.map((p) =>
          p.id === commentsModal.postId
            ? { ...p, stats: { ...p.stats, comments: p.stats.comments + 1 } }
            : p
        )
      );
      setFollowingPosts((prev) =>
        prev.map((p) =>
          p.id === commentsModal.postId
            ? { ...p, stats: { ...p.stats, comments: p.stats.comments + 1 } }
            : p
        )
      );
      toast.success("Đã bình luận");
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("Không thể gửi bình luận");
    }
  };

  const handleSubmitReply = async (commentId: number) => {
    if (!commentsModal || !replyText.trim()) return;
    const currentUserId = Number(auth.user?.id);
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập");
      return;
    }
    try {
      await createComment(
        commentsModal.postId,
        replyText,
        currentUserId,
        commentId
      );
      const replies = await getReplies(commentsModal.postId, commentId);
      setCommentsModal({
        ...commentsModal,
        comments: commentsModal.comments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                replyCount: replies.length,
                replies,
              }
            : c
        ),
      });
      // Cập nhật comment count (+1 vì reply cũng được backend tính là comment)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === commentsModal.postId
            ? { ...p, stats: { ...p.stats, comments: p.stats.comments + 1 } }
            : p
        )
      );
      setFollowingPosts((prev) =>
        prev.map((p) =>
          p.id === commentsModal.postId
            ? { ...p, stats: { ...p.stats, comments: p.stats.comments + 1 } }
            : p
        )
      );
      setReplyText("");
      setReplyingTo(null);
      toast.success("Đã trả lời");
    } catch (error) {
      console.error("Error creating reply:", error);
      toast.error("Không thể gửi trả lời");
    }
  };

  const handleLoadReplies = async (commentId: number) => {
    if (!commentsModal) return;
    try {
      const replies = await getReplies(commentsModal.postId, commentId);
      setCommentsModal({
        ...commentsModal,
        comments: commentsModal.comments.map((c) =>
          c.id === commentId ? { ...c, replies } : c
        ),
      });
      setExpandedReplies((prev) => new Set(prev).add(commentId));
    } catch (error) {
      console.error("Error fetching replies:", error);
      toast.error("Không thể tải trả lời");
    }
  };

  const closeCommentsModal = () => {
    setCommentsModal(null);
    setNewComment("");
    setReplyingTo(null);
    setReplyText("");
    setExpandedReplies(new Set());
    setLikedComments(new Set());
  };

  const handleLikeComment = async (commentId: number) => {
    const isLiked = likedComments.has(commentId);
    try {
      if (isLiked) {
        await unlikeComment(commentId);
        setLikedComments((prev) => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
      } else {
        await likeComment(commentId);
        setLikedComments((prev) => new Set(prev).add(commentId));
      }
      if (commentsModal) {
        const updateLikeCount = (c: CommentType): CommentType => ({
          ...c,
          likeCount:
            c.id === commentId ? c.likeCount + (isLiked ? -1 : 1) : c.likeCount,
          replies: c.replies?.map(updateLikeCount) || null,
        });
        setCommentsModal({
          ...commentsModal,
          comments: commentsModal.comments.map(updateLikeCount),
        });
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
      toast.error("Không thể thực hiện thao tác");
    }
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

  const handleShare = () => {
    toast.info("Tính năng share đang được phát triển");
  };

  // Hàm xử lý chọn ảnh đại diện (Giữ nguyên)
  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUser((prevUser) =>
        prevUser ? { ...prevUser, avatar: imageUrl } : null
      );
      setIsEditingAvatar(false);
    }
    event.target.value = "";
  };

  // ⭐️ CẬP NHẬT: Hàm đăng bài mới gọi API thật
  const handlePost = async (content: string, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0)) return;

    try {
      const response = await createPost({
        content,
        mediaFiles: files,
      });

      // Map API response to local Post type
      const newPost: Post = {
        id: response.id,
        user: {
          id: response.user.id,
          name:
            response.user.fullName ||
            response.user.username ||
            `User ${response.user.id}`,
          role: "Member",
          avatar:
            response.user.profilePicture ||
            user?.avatar ||
            "https://via.placeholder.com/50",
        },
        content: response.content,
        hashtags: [],
        images: response.media?.map((m) => m.mediaUrl) || [],
        stats: {
          likes: response.likeCount || 0,
          comments: response.commentCount || 0,
          shares: 0,
        },
        timestamp: "now",
      };

      setPosts((prev) => [newPost, ...prev]);
    } catch (error) {
      console.error("Create post failed:", error);
      throw error; // Re-throw để modal xử lý
    }
  };

  // Hàm chỉ để mở Modal
  const handleOpenPostModal = () => {
    if (!isAuthenticated) {
      toast.info("Bạn cần đăng nhập để tạo bài viết");
      navigate("/auth/login");
      return;
    }
    setShowCreatePostModal(true);
  };

  // Hàm chỉ để đóng Modal
  const handleClosePostModal = () => {
    setShowCreatePostModal(false);
  };

  if (!user) {
    return <Loading type="spinner" fullscreen text="Đang tải..." />;
  }

  return (
    <div className={`home-page ${isDark ? "dark-mode" : ""}`}>
      <div className={`slothui-container ${isDark ? "dark" : ""}`}>
        {/* Sidebar (Giữ nguyên) */}
        <div className="sidebar">
          {/* ... (Logo, Search, Navigation, User Profile Bottom giữ nguyên) ... */}
          <div className="sidebar-logo">
            <div className="logo-container">
              <div className="logo-icon">
                <img className="picture-logo" src="/public/images/logo.jpg" />
              </div>
              <span className="logo-title">iSocial</span>
            </div>
          </div>

          {/* Search */}
          <div className="search-container">
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Tìm Kiếm..."
                className="search-input"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="nav-container">
            <div className="nav-list">
              <div className="nav-item active">
                <div className="nav-item-content">
                  <Home className="nav-icon" />
                  <span className="nav-text">Home</span>
                </div>
                <span className="nav-badge active">10</span>
              </div>

              {/* <div className="nav-item">
              <div className="nav-item-content">
                <CheckSquare className="nav-icon" />
                <span className="nav-text">Tasks</span>
              </div>
            </div> */}

              <div className="nav-item">
                <div className="nav-item-content">
                  <Users className="nav-icon" />
                  <span className="nav-text">Users</span>
                </div>
                <span className="nav-badge">2</span>
              </div>

              {/* <div className="nav-item">
              <div className="nav-item-content">
                <Wifi className="nav-icon" />
                <span className="nav-text">APIs</span>
              </div>
            </div> */}

              {/* <div className="nav-item">
              <div className="nav-item-content">
                <div className="nav-icon border-2 border-current rounded"></div>
                <span className="nav-text">Subscription</span>
              </div>
            </div> */}

              <div className="nav-item">
                <div className="nav-item-content">
                  <Settings className="nav-icon" />
                  <span className="nav-text">Settings</span>
                </div>
                <button
                  onClick={() => setIsDark((prev) => !prev)}
                  className="nav-dark-toggle"
                  aria-label="Toggle dark mode"
                >
                  {isDark ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="nav-item">
                <div className="nav-item-content">
                  <HelpCircle className="nav-icon" />
                  <span className="nav-text">Help & Support</span>
                </div>
              </div>

              <div
                className="nav-item"
                onClick={auth.logout}
                style={{ cursor: "pointer" }}
              >
                <div className="nav-item-content">
                  <LogOut className="nav-icon" />
                  <span className="nav-text">Đăng xuất</span>
                </div>
              </div>
            </div>
          </nav>

          {/* User Profile at bottom */}
          <div
            className="user-profile-bottom"
            onClick={() => navigate(`/profile/${auth.user?.id}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="user-profile-info">
              <img src={user.avatar} alt="User" className="user-avatar-small" />
              <div className="flex-1">
                <div className="user-name">{user.displayName}</div>
                <div className="user-role">Basic Member</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Feed */}
          <div className="feed-container">
            {/* Header */}
            <div className="feed-header">
              <button
                onClick={() => setActiveTab("For You")}
                className={`feed-tab ${
                  activeTab === "For You" ? "active" : ""
                }`}
              >
                For You
              </button>
              <button
                onClick={() => setActiveTab("Following")}
                className={`feed-tab ${
                  activeTab === "Following" ? "active" : ""
                }`}
              >
                Following
              </button>
            </div>

            {/* Post Composer - Nút mở Pop-up */}
            <div className="post-composer" onClick={handleOpenPostModal}>
              <div className="composer-container">
                <img
                  src={user.avatar}
                  alt="Your avatar"
                  className="composer-avatar"
                />
                <div className="composer-input-placeholder">
                  Hãy chia sẻ điều gì đó thú vị...
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="posts-feed">
              {loadingPosts ? (
                <div className="loading-posts">Đang tải bài viết...</div>
              ) : activeTab === "Following" &&
                followingPosts.length === 0 &&
                followingLoaded ? (
                <div className="no-posts">
                  <p>Chưa có bài viết nào từ người bạn theo dõi.</p>
                  <p>Hãy theo dõi thêm người dùng để xem bài viết của họ!</p>
                </div>
              ) : activeTab === "For You" &&
                posts.length === 0 &&
                forYouLoaded ? (
                <div className="no-posts">
                  <p>Chưa có bài viết trending nào.</p>
                </div>
              ) : null}
              {(activeTab === "For You" ? posts : followingPosts).map(
                (post) => (
                  <div key={post.id} className="post-item">
                    <div className="post-header">
                      <img
                        src={post.user.avatar}
                        alt=""
                        className="post-avatar"
                        onClick={() => navigate(`/profile/${post.user.id}`)}
                        style={{ cursor: "pointer" }}
                      />
                      <div className="post-meta">
                        <span
                          className="post-author"
                          onClick={() => navigate(`/profile/${post.user.id}`)}
                          style={{ cursor: "pointer" }}
                        >
                          {post.user.name}
                        </span>
                        <span className="post-time">{post.timestamp}</span>
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
                          <div
                            key={idx}
                            className="post-image-item"
                            onClick={() => handleViewImage(post.images!, idx)}
                            style={{ cursor: "pointer" }}
                          >
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
                      <button className="post-action" onClick={handleShare}>
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
                )
              )}
            </div>
          </div>

          {/* Right Profile Panel (Giữ nguyên) */}
          <div className="profile-panel">
            <div className="profile-card">
              {/* Profile Header */}
              <div className="profile-header">
                <div className="profile-avatar-container">
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="profile-avatar"
                  />
                  {/* Nút chỉnh sửa avatar */}
                  <button
                    onClick={() => setIsEditingAvatar(true)}
                    className="edit-avatar-btn"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <div className="profile-status"></div>
                </div>
                <h2 className="profile-name">{user.displayName}</h2>
                <p className="profile-username">{user.username}</p>
                <p className="profile-location">{user.location} ✈️</p>
              </div>

              {/* Stats */}
              <div className="profile-stats">
                <div className="profile-stat">
                  <h3>{user.stats.posts}</h3>
                  <p>Posts</p>
                </div>
                <div className="profile-stat">
                  <h3>{user.stats.followers}</h3>
                  <p>Followers</p>
                </div>
                <div className="profile-stat">
                  <h3>{user.stats.following}</h3>
                  <p>Following</p>
                </div>
              </div>

              {/* About */}
              <div className="profile-about">
                <h3 className="profile-section-title">Giới Thiệu</h3>
                <p className="profile-bio">{user.bio}</p>
                <button className="profile-read-more">Xem Thêm</button>
              </div>

              {/* ⭐️ CẬP NHẬT: Thay thế Tin Nổi Bật bằng Ảnh Gần Đây */}
              <div className="profile-highlights">
                <h3 className="profile-section-title">Ảnh Gần Đây</h3>
                {posts.filter((p) => p.images && p.images.length > 0).length >
                0 ? (
                  <div className="profile-photos-grid">
                    {posts
                      .filter((p) => p.images && p.images.length > 0)
                      .flatMap((p) => p.images || [])
                      .slice(0, 9) // Lấy tối đa 9 ảnh
                      .map((img, idx) => (
                        <div
                          key={idx}
                          className="profile-photo-item"
                          onClick={() => handleViewImage([img], 0)}
                        >
                          <img src={img} alt="Recent" />
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="profile-empty-text">Chưa có ảnh nào.</p>
                )}
              </div>

              {/* Contact Info */}
              <div className="profile-contact">
                <h3 className="profile-section-title">Thông Tin Liên Hệ</h3>
                <div className="contact-list">
                  <div className="contact-item">
                    <div className="contact-info">
                      <div className="contact-icon phone">
                        <span role="img" aria-label="phone">
                          📞
                        </span>
                      </div>
                      <div className="contact-details">
                        <h4>Số Điện Thoại</h4>
                        <p>{user.contact.phone}</p>
                      </div>
                    </div>
                    <span className="contact-arrow">↗</span>
                  </div>

                  <div className="contact-item">
                    <div className="contact-info">
                      <div className="contact-icon email">
                        <span role="img" aria-label="email">
                          📧
                        </span>
                      </div>
                      <div className="contact-details">
                        <h4>Email </h4>
                        <p>{user.contact.email}</p>
                      </div>
                    </div>
                    <span className="contact-arrow">↗</span>
                  </div>

                  <div className="contact-item">
                    <div className="contact-info">
                      <div className="contact-icon website">
                        <span role="img" aria-label="website">
                          🌐
                        </span>
                      </div>
                      <div className="contact-details">
                        <h4>Website</h4>
                        <p>{user.contact.website}</p>
                      </div>
                    </div>
                    <span className="contact-arrow">↗</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal chọn ảnh đại diện */}
      {isEditingAvatar && (
        <div className="avatar-edit-modal-overlay">
          <div className="avatar-edit-modal">
            <h3>Change Profile Picture</h3>
            <button
              onClick={() => setIsEditingAvatar(false)}
              className="modal-close-btn"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="modal-actions">
              {/* Input file ẩn */}
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarSelect}
                style={{ display: "none" }}
              />
              <label htmlFor="avatar-upload" className="modal-upload-btn">
                Upload Photo
              </label>
              <button
                className="modal-cancel-btn"
                onClick={() => setIsEditingAvatar(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showCreatePostModal && (
        <CreatePostModal
          user={user}
          onClose={handleClosePostModal}
          onPost={handlePost}
        />
      )}

      {viewerState && (
        <ImageViewerModal
          images={viewerState.images}
          startIndex={viewerState.startIndex}
          onClose={handleCloseViewer}
        />
      )}

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
                        )}&background=1877f2&color=fff&size=50`
                      }
                      alt={likeUser.username}
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

      {/* Comments Modal */}
      {commentsModal && (
        <div className="likes-modal-overlay" onClick={closeCommentsModal}>
          <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
            <div className="likes-modal-header">
              <h3>Bình luận</h3>
              <button
                className="likes-modal-close"
                onClick={closeCommentsModal}
              >
                ✕
              </button>
            </div>
            <div className="comments-modal-body">
              {loadingComments ? (
                <div className="likes-modal-loading">Đang tải...</div>
              ) : (
                <>
                  <div className="comment-input-wrapper">
                    <input
                      type="text"
                      placeholder="Viết bình luận..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSubmitComment()
                      }
                    />
                    <button onClick={handleSubmitComment}>Gửi</button>
                  </div>
                  {commentsModal.comments.length === 0 ? (
                    <div className="likes-modal-empty">Chưa có bình luận</div>
                  ) : (
                    commentsModal.comments.map((comment) => (
                      <div key={comment.id} className="comment-item">
                        <img
                          src={
                            comment.user.profilePicture ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              comment.user.fullName || comment.user.username
                            )}&background=1877f2&color=fff&size=40`
                          }
                          alt=""
                          className="comment-avatar"
                          onClick={() => {
                            closeCommentsModal();
                            navigate(`/profile/${comment.user.id}`);
                          }}
                        />
                        <div className="comment-content">
                          <div className="comment-bubble">
                            <span
                              className="comment-author"
                              onClick={() => {
                                closeCommentsModal();
                                navigate(`/profile/${comment.user.id}`);
                              }}
                            >
                              {comment.user.fullName || comment.user.username}
                            </span>
                            <p className="comment-text">
                              {comment.commentText}
                            </p>
                          </div>
                          <div className="comment-actions">
                            <button
                              className={`comment-like-btn ${
                                likedComments.has(comment.id) ? "liked" : ""
                              }`}
                              onClick={() => handleLikeComment(comment.id)}
                            >
                              {likedComments.has(comment.id) ? "❤️" : "🤍"}{" "}
                              {comment.likeCount > 0 && comment.likeCount}
                            </button>
                            <span className="comment-time">
                              {new Date(comment.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                            <button
                              className="comment-reply-btn"
                              onClick={() =>
                                setReplyingTo(
                                  replyingTo === comment.id ? null : comment.id
                                )
                              }
                            >
                              Trả lời
                            </button>
                            {comment.replyCount > 0 &&
                              !expandedReplies.has(comment.id) && (
                                <button
                                  className="comment-view-replies"
                                  onClick={() => handleLoadReplies(comment.id)}
                                >
                                  Xem {comment.replyCount} trả lời
                                </button>
                              )}
                          </div>
                          {replyingTo === comment.id && (
                            <div className="reply-input-wrapper">
                              <input
                                type="text"
                                placeholder="Viết trả lời..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) =>
                                  e.key === "Enter" &&
                                  handleSubmitReply(comment.id)
                                }
                                autoFocus
                              />
                              <button
                                onClick={() => handleSubmitReply(comment.id)}
                              >
                                Gửi
                              </button>
                            </div>
                          )}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="replies-list">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="reply-item">
                                  <img
                                    src={
                                      reply.user.profilePicture ||
                                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        reply.user.fullName ||
                                          reply.user.username
                                      )}&background=1877f2&color=fff&size=32`
                                    }
                                    alt=""
                                    className="reply-avatar"
                                    onClick={() => {
                                      closeCommentsModal();
                                      navigate(`/profile/${reply.user.id}`);
                                    }}
                                  />
                                  <div className="reply-content">
                                    <div className="comment-bubble">
                                      <span
                                        className="comment-author"
                                        onClick={() => {
                                          closeCommentsModal();
                                          navigate(`/profile/${reply.user.id}`);
                                        }}
                                      >
                                        {reply.user.fullName ||
                                          reply.user.username}
                                      </span>
                                      <p className="comment-text">
                                        {reply.commentText}
                                      </p>
                                    </div>
                                    <div className="comment-actions">
                                      <button
                                        className={`comment-like-btn ${
                                          likedComments.has(reply.id)
                                            ? "liked"
                                            : ""
                                        }`}
                                        onClick={() =>
                                          handleLikeComment(reply.id)
                                        }
                                      >
                                        {likedComments.has(reply.id)
                                          ? "❤️"
                                          : "🤍"}{" "}
                                        {reply.likeCount > 0 && reply.likeCount}
                                      </button>
                                      <span className="comment-time">
                                        {new Date(
                                          reply.createdAt
                                        ).toLocaleDateString("vi-VN")}
                                      </span>
                                      <button
                                        className="comment-reply-btn"
                                        onClick={() =>
                                          setReplyingTo(
                                            replyingTo === reply.id
                                              ? null
                                              : reply.id
                                          )
                                        }
                                      >
                                        Trả lời
                                      </button>
                                    </div>
                                    {replyingTo === reply.id && (
                                      <div className="reply-input-wrapper">
                                        <input
                                          type="text"
                                          placeholder="Viết trả lời..."
                                          value={replyText}
                                          onChange={(e) =>
                                            setReplyText(e.target.value)
                                          }
                                          onKeyDown={(e) =>
                                            e.key === "Enter" &&
                                            handleSubmitReply(comment.id)
                                          }
                                          autoFocus
                                        />
                                        <button
                                          onClick={() =>
                                            handleSubmitReply(comment.id)
                                          }
                                        >
                                          Gửi
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlothuiInterface;
