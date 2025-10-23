import { AuthButton } from "../components/AuthButton.jsx";
import { Link } from "react-router";

export default function Homepage() {
  return (
    <main className="relative h-screen bg-base-100 text-base-content grid place-items-center">
      <section className="absolute top-5 right-5 flex gap-3">
        <AuthButton
          className="btn btn-accent btn-md shadow-md"
          to="/auth/signup"
          label="Sign up"
        />
        <AuthButton
          className="btn btn-outline btn-primary btn-md"
          to="/auth/login"
          label="Log in"
        />
      </section>

      <section className="flex flex-col items-center justify-center gap-7 text-center w-full">
        <h1 className="text-9xl font-semibold">Pays</h1>
        <p className="text-lg opacity-80 max-w-lg">
          Virtual payment system. Transfer virtual money to your friends.
        </p>
        <Link
          to="/auth/signup"
          className="btn w-3xs btn-primary text-2xl px-12 py-6 shadow-lg hover:scale-105 transition-all duration-300"
        >
          Get started
        </Link>
      </section>
    </main>
  );
}
