import { createBrowserRouter } from "react-router";
import Homepage from "./routes/Homepage.jsx";
import { lazy } from "react";
import { PublicOnlyRoute } from "./auth/PublicOnlyRoute.jsx";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AutoPublicPrivateRoute } from "./routes/AutoPublicPrivateRoute.jsx";

const Dashboard = lazy(() => import("./routes/Dashboard.jsx"));
const Signup = lazy(() => import("./routes/Signup.jsx"));
const Login = lazy(() => import("./routes/Login.jsx"));
const Payments = lazy(() => import("./routes/Payments.jsx"));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AutoPublicPrivateRoute>
        <Homepage />
      </AutoPublicPrivateRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <AutoPublicPrivateRoute>
        <Signup />
      </AutoPublicPrivateRoute>
    ),
  },
  {
    path: "login",
    element: (
      <AutoPublicPrivateRoute>
        <Login />
      </AutoPublicPrivateRoute>
    ),
  },
  {
    path: "/dashboard",
    children: [
      {
        index: true,
        element: (
          <AutoPublicPrivateRoute>
            <Dashboard />
          </AutoPublicPrivateRoute>
        ),
      },
      {
        path: "payments",
        element: (
          <AutoPublicPrivateRoute>
            <Payments />
          </AutoPublicPrivateRoute>
        ),
      },
    ],
  },
]);

export default router;