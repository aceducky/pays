import { Suspense } from "react";
import { Outlet } from "react-router";
import Navbar from "@/src/components/Navbar.jsx";
import Loading from "@/src/components/Loading.jsx";

export default function RootLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
    </>
  );
}
