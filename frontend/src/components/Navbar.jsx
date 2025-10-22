import { Link } from "react-router";
import { User } from "lucide-react";
import NavigationLink from "./NavigationLink.jsx";

export default function Navbar({ onProfileClick, onLogout }) {
  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/payments", label: "Payments" },
  ];

  return (
    <header className="bg-base-100 rounded-2xl shadow p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/dashboard" className="text-3xl font-semibold">
            Pays
          </Link>
          <nav className="hidden md:flex gap-8">
            {links.map((link) => (
              <NavigationLink key={link.to} to={link.to} label={link.label} />
            ))}
          </nav>
        </div>

        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            className="btn btn-ghost btn-circle"
            aria-label="User menu"
          >
            <User className="w-6 h-6" />
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow-lg border border-base-200 mt-3"
          >
            <li>
              <button onClick={onProfileClick}>Profile</button>
            </li>
            <li>
              <button onClick={onLogout} className="text-error">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
