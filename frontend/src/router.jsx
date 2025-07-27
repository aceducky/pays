import { createBrowserRouter } from "react-router";
import Homepage from "./routes/Homepage.jsx";
import { lazy } from "react";
import { ProtectedRoute, PublicOnlyRoute } from "./auth/ProtectedRoute";

const Dashboard = lazy(() => import("./routes/Dashboard.jsx"));
const Signup = lazy(() => import("./routes/Signup.jsx"));
const Login = lazy(() => import("./routes/Login.jsx"));
const Payments = lazy(() => import("./routes/Payments.jsx"));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicOnlyRoute>
        <Homepage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicOnlyRoute>
        <Signup />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "login",
    element: (
      <PublicOnlyRoute>
        <Login />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/dashboard",
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "payments",
        element: (
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
