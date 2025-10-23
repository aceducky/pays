import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="w-full h-full overflow-hidden grid place-items-center bg-base-100 text-base-content">
      <h1 className="text-6xl">Page Not found</h1>
      <Link to="/dashboard" className="underline">
        Back to Dashboard
      </Link>
    </div>
  );
}
