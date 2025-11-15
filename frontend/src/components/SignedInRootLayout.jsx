import { Outlet } from "react-router";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function SignedInRootLayout() {
  return (
    <div className="drawer lg:drawer-open min-h-screen">
      <input id="main-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Navbar />
        <main className="container mx-auto px-2 flex-1">
          <Outlet />
        </main>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="main-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        />
        <Sidebar />
      </div>
    </div>
  );
}
