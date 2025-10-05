import React from "react";
import "../styles/components/Loading.css";

interface LoadingProps {
  type?: "spinner" | "skeleton" | "pulse";
  size?: "small" | "medium" | "large";
  text?: string;
  fullscreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  type = "spinner",
  size = "medium",
  text = "Đang tải...",
  fullscreen = false,
}) => {
  const containerClass = fullscreen
    ? "loading-container loading-fullscreen"
    : "loading-container";

  if (type === "skeleton") {
    return (
      <div className={containerClass}>
        <div className={`loading-skeleton loading-${size}`}>
          <div className="skeleton-avatar"></div>
          <div className="skeleton-content">
            <div className="skeleton-line skeleton-line-title"></div>
            <div className="skeleton-line skeleton-line-subtitle"></div>
            <div className="skeleton-line skeleton-line-text"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "pulse") {
    return (
      <div className={containerClass}>
        <div className={`loading-pulse loading-${size}`}>
          <div className="pulse-dot"></div>
          <div className="pulse-dot"></div>
          <div className="pulse-dot"></div>
        </div>
        {text && <span className="loading-text">{text}</span>}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className={`loading-spinner loading-${size}`}>
        <div className="spinner-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
};

export default Loading;
