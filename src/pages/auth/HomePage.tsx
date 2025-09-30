import { useState, useEffect } from "react";
import {
  Search,
  Home,
  CheckSquare,
  Users,
  Wifi,
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
} from "lucide-react";

// Import file CSS đã được cung cấp.
import "../../styles/page/HomePage.css";

// Type definitions
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
    name: string;
    role: string;
    avatar: string;
  };
  content: string;
  hashtags: string[];
  image?: string;
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  timestamp: string;
}

// Mock API Data
const mockUser: User = {
  id: "x_ae_c_921",
  username: "@xtheobliterator",
  displayName: "X_AE_C-921",
  location: "Osaka, Japan",
  avatar:
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  stats: {
    posts: 548,
    followers: "12.7K",
    following: 221,
  },
  bio: "Hi there! 👋 I'm X_AE_A-19, an AI enthusiast and fitness aficionado. When I'm not crunching numbers or optimizing algorithms, you can find me hitting the gym.",
  contact: {
    phone: "+123 456 789 000",
    email: "hello@slothui.com",
    website: "www.slothui.com",
  },
  storyHighlights: [
    {
      id: 1,
      name: "France",
      image:
        "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=100&h=100&fit=crop",
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

const mockPosts: Post[] = [
  {
    id: 1,
    user: {
      name: "X_AE_A-13",
      role: "Product Designer, slothUI",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
    },
    content:
      "Habitant morbi tristique senectus et netus et. Suspendisse sed nisl lacus sed viverra. Dolor morbi non arcu risus quis varius.",
    hashtags: ["#amazing", "#great", "#lifetime", "#ux", "#machinelearning"],
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop",
    stats: { likes: 12, comments: 25, shares: 187 },
    timestamp: "2h",
  },
  {
    id: 2,
    user: {
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
  {
    id: 3,
    user: {
      name: "Mai Sakurajima Senpai",
      role: "Product Designer, slothUI",
      avatar:
        "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=50&h=50&fit=crop&crop=face",
    },
    content:
      "Habitant morbi tristique senectus et netus et. Suspendisse sed nisl lacus sed viverra. Dolor morbi non arcu risus quis varius.",
    hashtags: ["#amazing", "#great", "#lifetime", "#ux", "#machinelearning"],
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    stats: { likes: 12, comments: 25, shares: 187 },
    timestamp: "6h",
  },
];

const SlothuiInterface = () => {
  const [activeTab, setActiveTab] = useState<string>("For You");
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showProModal, setShowProModal] = useState<boolean>(true);
  const [newPostText, setNewPostText] = useState<string>("");
  const [isDark, setIsDark] = useState<boolean>(false);

  // Mock API calls
  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setUser(mockUser);
      setPosts(mockPosts);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleLike = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, stats: { ...post.stats, likes: post.stats.likes + 1 } }
          : post
      )
    );
  };

  const handlePost = () => {
    if (newPostText.trim() && user) {
      const newPost: Post = {
        id: Date.now(),
        user: {
          name: user.displayName,
          role: "AI Enthusiast",
          avatar: user.avatar,
        },
        content: newPostText,
        hashtags: [],
        stats: { likes: 0, comments: 0, shares: 0 },
        timestamp: "now",
      };
      setPosts((prev) => [newPost, ...prev]);
      setNewPostText("");
    }
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
      <button
        className="theme-toggle"
        aria-label="Toggle dark mode"
        onClick={() => setIsDark((prev) => !prev)}
      >
        {isDark ? (
          <Sun className="theme-toggle-icon" />
        ) : (
          <Moon className="theme-toggle-icon" />
        )}
      </button>
      {/* Sidebar */}
      <div className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-container">
            <div className="logo-icon">
              <span className="logo-text">S</span>
            </div>
            <span className="logo-title">slothui</span>
          </div>
        </div>

        {/* Search */}
        <div className="search-container">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
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

            <div className="nav-item">
              <div className="nav-item-content">
                <CheckSquare className="nav-icon" />
                <span className="nav-text">Tasks</span>
              </div>
            </div>

            <div className="nav-item">
              <div className="nav-item-content">
                <Users className="nav-icon" />
                <span className="nav-text">Users</span>
              </div>
              <span className="nav-badge">2</span>
            </div>

            <div className="nav-item">
              <div className="nav-item-content">
                <Wifi className="nav-icon" />
                <span className="nav-text">APIs</span>
              </div>
            </div>

            <div className="nav-item">
              <div className="nav-item-content">
                <div className="nav-icon border-2 border-current rounded"></div>
                <span className="nav-text">Subscription</span>
              </div>
            </div>

            <div className="nav-item">
              <div className="nav-item-content">
                <Settings className="nav-icon" />
                <span className="nav-text">Settings</span>
              </div>
            </div>

            <div className="nav-item">
              <div className="nav-item-content">
                <HelpCircle className="nav-icon" />
                <span className="nav-text">Help & Support</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Pro Modal */}
        {showProModal && (
          <div className="pro-modal">
            <div className="pro-modal-content">
              <button
                onClick={() => setShowProModal(false)}
                className="pro-modal-close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="pro-modal-icon">⚠️</div>
              <p className="pro-modal-text">
                Enjoy unlimited access to our app with only a small price
                monthly.
              </p>
              <div className="pro-modal-actions">
                <button className="pro-modal-dismiss">Dismiss</button>
                <button className="pro-modal-upgrade">Go Pro</button>
              </div>
            </div>
          </div>
        )}

        {/* User Profile at bottom */}
        <div className="user-profile-bottom">
          <div className="user-profile-info">
            <img src={user.avatar} alt="User" className="user-avatar-small" />
            <div className="flex-1">
              <div className="user-name">Azunyan U. Wu</div>
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

          {/* Post Composer */}
          <div className="post-composer">
            <div className="composer-container">
              <img
                src={user.avatar}
                alt="Your avatar"
                className="composer-avatar"
              />
              <div className="composer-content">
                <textarea
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="What's on your mind right now?"
                  className="composer-textarea"
                  rows={3}
                />
                <div className="composer-actions">
                  <div className="composer-tools">
                    <Camera className="composer-tool" />
                    <Smile className="composer-tool" />
                    <Mic className="composer-tool" />
                  </div>
                  <button onClick={handlePost} className="composer-post-btn">
                    Post →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="posts-feed">
            {posts.map((post) => (
              <div key={post.id} className="post">
                <div className="post-container">
                  <img
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="post-avatar"
                  />
                  <div className="post-content">
                    <div className="post-header">
                      <div className="post-user-info">
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

                      {post.image && (
                        <div className="post-image">
                          <img src={post.image} alt="Post content" />
                        </div>
                      )}
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

        {/* Right Profile Panel */}
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
              <h3 className="profile-section-title">About Me</h3>
              <p className="profile-bio">{user.bio}</p>
              <button className="profile-read-more">Read More</button>
            </div>

            {/* Story Highlights */}
            <div className="profile-highlights">
              <h3 className="profile-section-title">My Story Highlights</h3>
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
              <h3 className="profile-section-title">Contact Information</h3>
              <div className="contact-list">
                <div className="contact-item">
                  <div className="contact-info">
                    <div className="contact-icon phone">
                      <span role="img" aria-label="phone">
                        📞
                      </span>
                    </div>
                    <div className="contact-details">
                      <h4>Phone Number</h4>
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
                      <h4>Email Address</h4>
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
  );
};

export default SlothuiInterface;
