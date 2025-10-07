import { createBrowserRouter } from "react-router";
import Homepage from "./routes/Homepage.jsx";
import { lazy } from "react";
import { AutoPublicProtectedRoute } from "./routes/AutoPublicPrivateRoute.jsx";

const Dashboard = lazy(() => import("./routes/Dashboard.jsx"));
const Signup = lazy(() => import("./routes/Signup.jsx"));
const Login = lazy(() => import("./routes/Login.jsx"));
const Payments = lazy(() => import("./routes/Payments.jsx"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <AutoPublicProtectedRoute />,
    children: [
      {
        index:true,
        element: <Homepage />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "payments",
        element: <Payments />,
      },
    ],
  },
]);

export  {router};
