import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import router from "./router.jsx";
import {QueryClient,QueryClientProvider} from "@tanstack/react-query"

const queryClient = new QueryClient({
  defaultOptions:{
    queries:{
      retry:1,
      staleTime:5*60*1000, // 5 min
    }
  }
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
