import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyPage from "./pages/auth/VerifyPage";
import SlothuiInterface from "./pages/auth/HomePage";
import Profile from "./pages/components/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RequireAuth from "./features/auth/RequireAuth";

function App() {
  return (
    <>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <SlothuiInterface />
            </RequireAuth>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
