import { Outlet } from "react-router/internal/react-server-client";
import Navbar from "./Navbar.jsx";
const links = [
  {
    to: "/dashboard",
    label: "Dashboard",
  },
  {
    to: "/payments",
    label: "Payments",
  },
];
export default function SignedInRootLayout() {
  return (
    <>
      <Navbar links={links} />
      <main>
        <Outlet />
      </main>
    </>
  );
}
