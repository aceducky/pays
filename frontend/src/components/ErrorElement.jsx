import { Link, useRouteError } from "react-router";
import { AlertCircle } from "lucide-react";

export default function ErrorElement() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="w-full h-full overflow-hidden grid place-items-center bg-base-100 text-base-content">
      <div className="flex flex-col items-center gap-6 max-w-md text-center px-4">
        <AlertCircle className="w-20 h-20 text-error" />

        <div className="flex flex-col gap-2">
          <h1 className="text-6xl font-bold">Oops!</h1>
          <p className="text-2xl">Something went wrong</p>
        </div>

        <div className="text-base-content/70">An unexpected error occurred</div>

        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
