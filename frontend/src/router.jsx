import { createBrowserRouter } from "react-router";
import RootLayout from "./routes/RootLayout.jsx";
import { lazy } from "react";

const Home = lazy(() => import("./routes/Home.jsx"));
const Dashboard = lazy(() => import("./routes/Dashboard.jsx"));
const Signup = lazy(() => import("./routes/Signup.jsx"));
const Login = lazy(() => import("./routes/Login.jsx"));
const Payments = lazy(() => import("./routes/Payments.jsx"));
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "payments",
        element: <Payments />,
      },
    ],
  },
]);

export default router;
