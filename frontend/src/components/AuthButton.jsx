import { Link } from "react-router";

export function AuthButton({ className, to, label }) {
  return (
    <Link role="button" to={to} className={`btn ${className}`}>
      {label}
    </Link>
  );
}
