import { NavLink } from "react-router";

export default function NavigationLink({ to, text }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded hover:bg-base-200 ${
          isActive ? "underline font-semibold" : ""
        }`
      }
    >
      {text}
    </NavLink>
  );
}
