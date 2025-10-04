import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { toast } from "react-toastify";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const hasShownToast = useRef(false);

  useEffect(() => {
    // Reset toast flag when location changes
    hasShownToast.current = false;
  }, [location.pathname]);

  if (!isAuthenticated) {
    // Only show toast once and not when coming from logout
    if (!hasShownToast.current && !sessionStorage.getItem("isLoggingOut")) {
      hasShownToast.current = true;
      toast.info("Bạn cần đăng nhập để tiếp tục");
    }
    // Clear the logout flag
    sessionStorage.removeItem("isLoggingOut");
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
