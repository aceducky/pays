import { Button } from "@/src/components/ui/button.jsx";
import { Link } from "react-router";

const AuthButton = ({ label, to }) => (
  <Button
    asChild
    className="bg-white text-black rounded-2xl w-20 hover:bg-gray-600 hover:text-zinc-100"
  >
    <Link className="text-[1.05rem]" to={to}>
      {label}
    </Link>
  </Button>
);

export default AuthButton;
