import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";
import { RouterProvider } from "react-router";
import LoadingBars from "./components/LoadingBars.jsx";
import { router } from "./router.jsx";
import { queryClient } from "./utils/queryClient.js";
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
