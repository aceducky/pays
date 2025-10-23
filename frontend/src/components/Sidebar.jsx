import { Home, Users, CreditCard, User, LogOut } from "lucide-react";
import { useAuth } from "../auth/hooks/useAuth.jsx";
import { toast } from "sonner";
import NavigationLink from "./NavigationLink.jsx";

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
      icon: <Home className="w-4 h-4" />,
    },
    { to: "/users", label: "Users", icon: <Users className="w-4 h-4" /> },
    {
      to: "/payments",
      label: "Payments",
      icon: <CreditCard className="w-4 h-4" />,
    },
    { to: "/profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <ul className="menu bg-base-200 min-h-full w-60 p-4 flex flex-col text-lg">
      {navItems.map((link) => (
        <li key={link.to}>
          <NavigationLink to={link.to} label={link.label} icon={link.icon} />
        </li>
      ))}
      <li className="mt-auto">
        <button
          onClick={handleLogout}
          className="text-error text-lg flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </li>
    </ul>
  );
}
