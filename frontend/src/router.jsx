import { createBrowserRouter } from "react-router";
import Homepage from "./routes/Homepage.jsx";
import { lazy } from "react";
import AutoPublicProtectedRoute from "./routes/AutoPublicPrivateRoute.jsx";

const Signup = lazy(() => import("./routes/Signup.jsx"));
const Login = lazy(() => import("./routes/Login.jsx"));
const SignedInRootLayout = lazy(() =>
  import("./components/SignedInRootLayout.jsx")
);
const NotFound = lazy(() => import("./components/NotFound.jsx"));
const ErrorElement = lazy(() => import("./components/ErrorElement.jsx"));
const Dashboard = lazy(() => import("./routes/Dashboard.jsx"));
const Payments = lazy(() => import("./routes/Payments.jsx"));
const PaymentReceipt = lazy(() => import("./routes/PaymentReceipt.jsx"));
const Profile = lazy(() => import("./routes/Profile.jsx"));
const UserBulkSearch = lazy(() => import("./components/UserBulkSearch.jsx"));
const Payment = lazy(() => import("./routes/Payment.jsx"));

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
      {
        path: "*",
        element: <NotFound />,
      },
    ],
    errorElement: <ErrorElement />,
  },
]);

export { router };
