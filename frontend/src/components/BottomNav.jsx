import { Link, useLocation } from "react-router";
import { Home, CreditCard, User } from "lucide-react";

export default function BottomNav({ onProfileClick }) {
  const location = useLocation();
  const navs = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <Home className="w-6 h-6" />,
    },
    {
      to: "/payments",
      label: "Payments",
      icon: <CreditCard className="w-6 h-6" />,
    },
    {
      to: "#profile",
      label: "Profile",
      icon: <User className="w-6 h-6" />,
      onClick: onProfileClick,
    },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-200 p-2 z-40 md:hidden">
      <div className="grid grid-cols-3 gap-1">
        {navs.map((nav) =>
          nav.to === "#profile" ? (
            <button
              key={nav.label}
              type="button"
              className="flex flex-col items-center py-2 text-base-content/70 hover:text-primary transition"
              onClick={nav.onClick}
            >
              {nav.icon}
              <span className="text-xs font-medium mt-1">{nav.label}</span>
            </button>
          ) : (
            <Link
              key={nav.to}
              to={nav.to}
              className={`flex flex-col items-center py-2 transition ${
                location.pathname === nav.to
                  ? "text-primary"
                  : "text-base-content/70 hover:text-primary"
              }`}
            >
              {nav.icon}
              <span className="text-xs font-medium mt-1">{nav.label}</span>
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
