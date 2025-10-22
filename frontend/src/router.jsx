import { createBrowserRouter } from "react-router";
import Homepage from "./routes/Homepage.jsx";
import { lazy } from "react";
import AutoPublicProtectedRoute from "./routes/AutoPublicPrivateRoute.jsx";
import UserBulkSearch from "./components/UserBulkSearch.jsx";
import Profile from "./routes/Profile.jsx";
import Payment from "./routes/Payment.jsx";

const Dashboard = lazy(() => import("./routes/Dashboard.jsx"));
const Payments = lazy(() => import("./routes/Payments.jsx"));
const Signup = lazy(() => import("./routes/Signup.jsx"));
const Login = lazy(() => import("./routes/Login.jsx"));
const PaymentReceipt = lazy(() => import("./routes/PaymentReceipt.jsx"));
const SignedInRootLayout = lazy(() =>
  import("./components/SignedInRootLayout.jsx")
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <AutoPublicProtectedRoute />,
    children: [
      {
        index: true,
        element: <Homepage />,
      },
      {
        path: "/auth",
        children: [
          {
            path: "signup",
            element: <Signup />,
          },
          {
            path: "login",
            element: <Login />,
          },
        ],
      },
      {
        element: <SignedInRootLayout />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "payments",
            element: <Payments />,
          },
          {
            path: "payments/:id",
            element: <PaymentReceipt />,
          },
          {
            path: "users",
            element: <UserBulkSearch />,
          },
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "payment",
            element: <Payment />,
          },
        ],
      },
    ],
  },
]);

export { router };
