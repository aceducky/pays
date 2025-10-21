
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { User } from "lucide-react";

export default function Navbar({ onProfileClick, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/payments", label: "Payments" },
  ];

  return (
    <header className="bg-base-100 rounded-2xl shadow p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/dashboard" className="text-2xl font-bold text-neutral">Pays</Link>
          <nav className="hidden md:flex gap-8">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`pb-1 border-b-2 transition-colors font-medium ${location.pathname === link.to ? "text-primary border-primary" : "text-base-content border-transparent hover:text-neutral"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="relative hidden md:flex" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 bg-base-200 rounded-full px-4 py-2 hover:bg-base-300 transition"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-label="User menu"
          >
            <User className="w-6 h-6" />
            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 bg-base-100 rounded-xl shadow-lg border border-base-200 min-w-[180px] z-50 animate-fadeIn">
              <button
                className="block w-full text-left px-4 py-3 hover:bg-base-200 rounded-t-xl"
                onClick={() => {
                  setDropdownOpen(false);
                  onProfileClick && onProfileClick();
                }}
              >
                Profile
              </button>
              <button
                className="block w-full text-left px-4 py-3 text-error hover:bg-error/10 rounded-b-xl"
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout && onLogout();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
