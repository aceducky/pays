import { NavLink } from "react-router";

export default function MenuLink({ to, label, icon }) {
  const handleClick = () => {
    const drawerToggle = document.getElementById("main-drawer");
    if (drawerToggle) {
      drawerToggle.checked = false;
    }
  };

  return (
    <NavLink
      to={to}
      role="menuitem"
      onClick={handleClick}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded hover:scale-105 transition-all ${
          isActive ? "menu-active font-semibold" : ""
        }`
      }
      aria-current={({ isActive }) => (isActive ? "page" : undefined)}
    >
      {icon && (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      )}
      <span>{label}</span>
    </NavLink>
  );
}
