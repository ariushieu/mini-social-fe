import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../styles/components/Profile.css";
import { getPostsByUser } from "../../api/posts";
import type { PostResponse } from "../../types/post/Post";
const Profile: React.FC = () => {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId ? Number(params.userId) : undefined;
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!userId) {
      setError("Invalid user ID");
      toast.error("Invalid user ID");
      return;
    }
    setLoading(true);
    setError(null);
    getPostsByUser(userId)
      .then((data) => {
        setPosts(data);
      })
      .catch((err) => {
        console.error("Failed to fetch posts:", err);
        setError("Failed to load posts");
        toast.error("Failed to load posts. Please try again.");
        setPosts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);
  const userInfo = posts.length > 0 ? posts[0].user : null;
  return (
    <div className="profile-container">
      <div className="main-content">
        <div className="header-card card">
          <div className="cover-photo" />
          <div className="profile-info">
            <div className="profile-picture">
              <img
                src={
                  userInfo?.profilePicture || "https://via.placeholder.com/150"
                }
                alt="Profile"
              />
            </div>
            <div className="details">
              <h1>
                {userInfo?.fullName ||
                  userInfo?.username ||
                  `User ${userId ?? "Unknown"}`}
              </h1>
              <p className="title">@{userInfo?.username || "username"}</p>
              <p className="location">
                <i className="fas fa-map-marker-alt"></i> Location Unknown
              </p>
              <div className="tags">
                <span>Member</span>
                <span>Active</span>
              </div>
            </div>
            <button className="send-message-btn" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left"></i> Back
            </button>
          </div>
        </div>
        <div className="about-card card">
          <h2>
            <i className="fas fa-stream"></i> Posts
          </h2>
          {loading && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p>Loading posts...</p>
            </div>
          )}
          {error && (
            <div
              style={{ textAlign: "center", padding: "20px", color: "#dc3545" }}
            >
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && posts.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p>No posts found.</p>
            </div>
          )}
          {!loading && !error && posts.length > 0 && (
            <div className="activity-card">
              {posts.map((post) => (
                <div key={post.id} className="post-item">
                  <div className="post-header">
                    <div className="post-user">
                      <div className="avatar-small">
                        <img
                          src={
                            post.user.profilePicture ||
                            "https://via.placeholder.com/40"
                          }
                          alt="avatar"
                        />
                      </div>
                      <div>
                        <span className="post-author">
                          {post.user.fullName ||
                            post.user.username ||
                            `User ${post.user.id}`}
                        </span>
                        <span className="post-time">
                          {" "}
                          • {post.createdAt || "now"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="post-content">
                    <p>{post.content}</p>
                  </div>
                  {post.media && post.media.length > 0 && (
                    <div className="post-media">
                      {post.media.length === 1 ? (
                        <div className="post-image-wrapper">
                          <img
                            src={post.media[0].mediaUrl}
                            alt="media"
                            className="post-image"
                          />
                        </div>
                      ) : (
                        <div
                          className="post-images-grid"
                          data-count={Math.min(post.media.length, 4)}
                        >
                          {post.media.slice(0, 4).map((m, idx) => (
                            <div key={idx} className="post-image-item">
                              <img src={m.mediaUrl} alt={`media-${idx}`} />
                              {post.media &&
                                post.media.length > 4 &&
                                idx === 3 && (
                                  <div className="post-image-overlay">
                                    +{post.media.length - 4}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="post-actions">
                    <span className="action-item">
                      <i className="far fa-heart"></i> {post.likeCount || 0}{" "}
                      Likes
                    </span>
                    <span className="action-item">
                      <i className="far fa-comment-dots"></i>{" "}
                      {post.commentCount || 0} Comments
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {}
      <div className="sidebar">
        <div className="location-card card">
          <h3>
            <i className="fas fa-globe-americas"></i> Location
          </h3>
          <p>Unknown</p>
        </div>
        {userInfo && (
          <div className="connect-card card">
            <h3>
              <i className="fas fa-link"></i> Profile Info
            </h3>
            <div className="links">
              <p>
                <i className="fas fa-user"></i>
                <span>{userInfo.fullName || "N/A"}</span>
              </p>
              <p>
                <i className="fas fa-at"></i>
                <span>@{userInfo.username || "N/A"}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Profile;
