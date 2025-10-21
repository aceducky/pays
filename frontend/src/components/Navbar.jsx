import { User } from "lucide-react";
import NavigationLink from "./NavLink.jsx";

export default function Navbar({ links }) {
  return (
    <header className="flex items-baseline border-b border-b-white pt-2">
      <h3 className="mx-4 text-2xl font-semibold">Pays</h3>
      <ul className="menu menu-horizontal">
        {links.map((link) => {
          return (
            <li key={link.to}>
              <NavigationLink to={link.to} label={link.label} />
            </li>
          );
        })}
      </ul>
      <User />
    </header>
  );
}
