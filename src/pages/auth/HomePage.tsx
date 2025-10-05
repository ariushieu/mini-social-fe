import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Home,
  Users,
  Settings,
  HelpCircle,
  MessageCircle,
  Heart,
  Share,
  Bookmark,
  Camera,
  Smile,
  Mic,
  MoreHorizontal,
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
import { createPost } from "../../api/posts";
import { useAuth } from "../../features/auth/AuthProvider";

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
          placeholder={`Bạn đang nghĩ gì, ${user.displayName}?`}
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

  // Load user data from auth context and mock posts
  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      // Use authenticated user from context when available
      if (auth.user) {
        setUser({
          id: String(auth.user.id ?? "x_ae_c_921"),
          username: auth.user.username ? `@${auth.user.username}` : "@user",
          displayName: auth.user.fullName || auth.user.username || "User",
          location: "Việt Nam", // Can be updated if backend provides location
          avatar:
            auth.user.profilePicture ||
            "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(
                auth.user.fullName || auth.user.username || "User"
              ) +
              "&background=6366f1&color=fff&size=200",
          stats: {
            posts: 0, // TODO: Get from backend when available
            followers: String(auth.user.followerCount || 0),
            following: auth.user.followingCount || 0,
          },
          bio: auth.user.bio || "No bio yet",
          contact: {
            phone: "+84 xxx xxx xxx", // TODO: Get from backend if available
            email: auth.user.email || "",
            website: "www.isocial.com",
          },
          storyHighlights: [], // TODO: Get from backend when available
        });
      } else {
        setUser(mockUser);
      }
      // Keep mock posts for now (until getPosts API is implemented)
      setPosts(mockPosts);
    }, 500);

    return () => clearTimeout(timer);
  }, [auth.user]); // Re-run when auth.user changes

  // Effect to update body class for dark mode and save to localStorage
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem("isDarkMode", isDark.toString());

    // Apply to body
    if (isDark) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    return () => {
      document.body.classList.remove("dark-mode");
    };
  }, [isDark]);

  const handleLike = (postId: number) => {
    if (!isAuthenticated) {
      toast.info("Bạn cần đăng nhập để thực hiện thao tác này");
      navigate("/auth/login");
      return;
    }
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, stats: { ...post.stats, likes: post.stats.likes + 1 } }
          : post
      )
    );
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
    return (
      <div className="loading-container">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return (
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
        <div className="user-profile-bottom">
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
              className={`feed-tab ${activeTab === "For You" ? "active" : ""}`}
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
                Bạn đang nghĩ gì?
              </div>
              <button className="composer-post-btn active">Post →</button>
            </div>
          </div>

          {/* Posts Feed (CẬP NHẬT: gắn onClick để mở ImageViewerModal) */}
          <div className="posts-feed">
            {posts.map((post) => (
              <div key={post.id} className="post">
                <div className="post-container">
                  <img
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="post-avatar"
                    onClick={() => navigate(`/profile/${post.user.id}`)}
                    style={{ cursor: "pointer" }}
                  />
                  <div className="post-content">
                    <div className="post-header">
                      <div
                        className="post-user-info"
                        onClick={() => navigate(`/profile/${post.user.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <h4>{post.user.name}</h4>
                        <p>{post.user.role}</p>
                      </div>
                      <div className="post-meta">
                        <span className="post-timestamp">{post.timestamp}</span>
                        <button className="post-menu">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    <div className="post-body">
                      <p className="post-text">{post.content}</p>
                      {post.hashtags.length > 0 && (
                        <div className="post-hashtags">
                          {post.hashtags.map((tag, index) => (
                            <span key={index} className="post-hashtag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* ⭐️ CẬP NHẬT: Logic hiển thị nhiều ảnh theo Grid (THÊM onClick) */}
                      {post.images &&
                        post.images.length > 0 &&
                        (post.images.length > 1 ? (
                          <div
                            className="post-images-grid"
                            data-count={Math.min(post.images.length, 4)}
                          >
                            {post.images.slice(0, 4).map((imageSrc, index) => (
                              <div
                                key={index}
                                className="post-image-item"
                                // ⭐️ THÊM: Gắn sự kiện onClick vào đây
                                onClick={() =>
                                  handleViewImage(post.images!, index)
                                }
                              >
                                <img
                                  src={imageSrc}
                                  alt={`Post content ${index + 1}`}
                                />
                                {/* Overlay cho ảnh thứ 4 nếu có nhiều hơn 4 ảnh */}
                                {post.images!.length > 4 && index === 3 && (
                                  <div className="post-image-overlay">
                                    + {post.images!.length - 4}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* Nếu chỉ có 1 ảnh, gắn sự kiện onClick */
                          <div
                            className="post-image"
                            onClick={() => handleViewImage(post.images!, 0)}
                          >
                            <img src={post.images[0]} alt="Post content" />
                          </div>
                        ))}
                    </div>

                    <div className="post-actions">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="post-action like-btn"
                      >
                        <Heart className="post-action-icon" />
                        <span>{post.stats.likes} Likes</span>
                      </button>

                      <button className="post-action comment-btn">
                        <MessageCircle className="post-action-icon" />
                        <span>{post.stats.comments} Comments</span>
                      </button>

                      <button className="post-action share-btn">
                        <Share className="post-action-icon" />
                        <span>{post.stats.shares} Share</span>
                      </button>

                      <button className="post-bookmark">
                        <Bookmark className="post-action-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

            {/* Story Highlights */}
            <div className="profile-highlights">
              <h3 className="profile-section-title">Tin Nổi Bật</h3>
              <div className="highlights-container">
                {user.storyHighlights.map((story) => (
                  <div key={story.id} className="highlight-item">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="highlight-image"
                    />
                    <span className="highlight-name">{story.name}</span>
                  </div>
                ))}
              </div>
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
    </div>
  );
};

export default SlothuiInterface;
