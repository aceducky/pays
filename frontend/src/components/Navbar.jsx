import { Link } from "react-router";
import { Menu, User, LogOut } from "lucide-react"; // Added Menu and LogOut
import { useAuth } from "../auth/hooks/useAuth.jsx";
import { toast } from "sonner";

export default function Navbar() {
  const { logoutAsync, logoutError } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutAsync();
    } catch {
      toast.error(logoutError);
    }
  };

  return (
    <header className="bg-base-100 rounded-2xl shadow p-4 mb-6">
      <div className="flex items-center justify-between">
        <label htmlFor="main-drawer" className="btn btn-ghost lg:hidden">
          <Menu className="w-5 h-5" />
        </label>

        <div className="flex items-center gap-12 flex-1 justify-center lg:justify-start">
          <Link to="/dashboard" className="text-3xl font-semibold">
            Pays
          </Link>
        </div>

      </div>
    </header>
  );
}
