import { createBrowserRouter } from "react-router";
import Homepage from "./routes/Homepage.jsx";
import { lazy } from "react";

const Dashboard = lazy(() => import("./routes/Dashboard.jsx"));
const Signup = lazy(() => import("./routes/Signup.jsx"));
const Login = lazy(() => import("./routes/Login.jsx"));
const Payments = lazy(() => import("./routes/Payments.jsx"));
const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "payments",
        element: <Payments />,
      },
    ],
  },
]);

export default router;
