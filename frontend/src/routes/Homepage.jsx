import AuthButton from "@/src/components/AuthButton.jsx";
import { Button } from "@/src/components/ui/button.jsx";

export default function Homepage() {
  return (
    <>
      <main className="grid grid-rows-2">
        <section className="flex justify-end gap-3 mt-8 mr-10">
          <AuthButton to="/signup" label="Sign up" />
          <AuthButton to="/login" label="Log in" />
        </section>
        <section className="w-full grid justify-center gap-7">
          <h1 className="text-9xl text-center">Pays</h1>
          <p className="font-light">
            Virtual payment system. Transfer virtual money to your friends
          </p>
          <Button className="bg-white text-black text-2xl py-6 px-20 rounded-4xl hover:cursor-pointer">
            Get Started
          </Button>
        </section>
      </main>
    </>
  );
}
