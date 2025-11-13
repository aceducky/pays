import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./utils/queryClient.js";
import { router } from "./router.jsx";
import { RouterProvider } from "react-router";
import { Suspense } from "react";
import LoadingBars from "./components/LoadingBars.jsx";
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoadingBars />}>
        <RouterProvider router={router} />
      </Suspense>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
