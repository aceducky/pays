import { NavLink } from "react-router";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "src/components/ui/navigation-menu.jsx";

export default function Navbar() {
  return (
    <NavigationMenu>
      <NavigationMenuList className="grid grid-flow-col">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
