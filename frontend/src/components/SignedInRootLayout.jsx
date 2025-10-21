import { Outlet, useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "../auth/hooks/useAuth.js";
import Navbar from "./Navbar.jsx";
import BottomNav from "./BottomNav.jsx";
import ProfileModal from "./ProfileModal.jsx";
import { toast } from "sonner";
import { normalize } from "zod";

export default function SignedInRootLayout() {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { logoutAsync } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutAsync();
    } catch (e) {
      toast.error(normalize(e));
    }
    navigate("/auth/login");
  };

  return (
    <>
      <Navbar
        onProfileClick={() => setProfileOpen(true)}
        onLogout={handleLogout}
      />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <main className="container mx-auto px-2 pb-24">
        <Outlet />
      </main>
      <BottomNav onProfileClick={() => setProfileOpen(true)} />
    </>
  );
}
