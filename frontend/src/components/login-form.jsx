import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { Link } from "react-router";
import Field from "./Field";

export function LoginForm({ className, signup = true }) {
  return (
    <div className={cn("flex flex-col gap-6 bg-zinc-900", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {signup
              ? "Signup to create a new account"
              : "Login to your account"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <Field
                className="grid gap-3"
                isRequired={true}
                label="Email"
                id="email"
                type="email"
                placeholder="m@example.com"
              />
              {signup && (
                <>
                  <Field
                    className="grid gap-3"
                    isRequired={true}
                    label="Username"
                    id="username"
                    type="text"
                    placeholder="acme"
                  />
                  <Field
                    className="grid gap-3"
                    isRequired={true}
                    label="Full name"
                    id="fullname"
                    type="text"
                    placeholder="John Doe"
                  />
                </>
              )}
              <Field
                className="grid gap-3"
                isRequired={true}
                label="Password"
                id="password"
                type="password"
                placeholder="********"
              />

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full border-2 border-black bg-white text-black hover:bg-zinc-200 text-lg hover:cursor-pointer "
                >
                  {signup ? "Sign up" : "Log in"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              {signup ? (
                <>Already have an account?</>
              ) : (
                <>Don&apos;t have an account?</>
              )}{" "}
              {signup ? (
                <Link to="/login" className="underline underline-offset-4">
                  Log in
                </Link>
              ) : (
                <Link to="/signup" className="underline underline-offset-4">
                  Sign up
                </Link>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
