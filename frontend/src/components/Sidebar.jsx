import { Home, Users, CreditCard, User, LogOut } from "lucide-react";
import { useAuth } from "../auth/hooks/useAuth.js";
import { toast } from "sonner";
import MenuLink from "./MenuLink.jsx";

export default function Sidebar() {
  const { logoutAsync, logoutError } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutAsync();
    } catch {
      toast.error(logoutError);
    }
  };

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
    },
    {
      to: "/users",
      label: "Users",
    },
    {
      to: "/payments",
      label: "Payments",
    },
    {
      to: "/profile",
      label: "Profile",
    },
  ];

  return (
    <ul className="menu bg-base-200 min-h-full w-60 p-4 flex flex-col text-lg">
      {navItems.map((link) => (
        <li key={link.to}>
          <MenuLink to={link.to} label={link.label} icon={link.icon} />
        </li>
      ))}
      <li className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded menu-item text-error text-lg hover:scale-105 transition-all"
          role="menuitem"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </li>
    </ul>
  );
}
