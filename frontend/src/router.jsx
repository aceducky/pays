import { createBrowserRouter } from "react-router";
import Homepage from "./routes/Homepage.jsx";
import { lazy } from "react";
import { AutoPublicProtectedRoute } from "./routes/AutoPublicPrivateRoute.jsx";

const Dashboard = lazy(() => import("./routes/Dashboard.jsx"));
const Payments = lazy(() => import("./routes/Payments.jsx"));
const AuthForm = lazy(() => import("./routes/AuthForm.jsx"));

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
        path:"/auth",
        element:<AuthForm/>,
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
