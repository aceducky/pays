import { useState } from "react";
import { useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../components/TextField.jsx";
import PasswordField from "../components/PasswordField.jsx";
import {
  userLoginSchema,
  userSignupSchema,
} from "../../../shared/zodSchemas/user.zodSchema.js";

export default function AuthForm() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") === "login");
  const schema = isLogin ? userLoginSchema : userSignupSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <>
      <main className="grid place-items-center h-screen">
        <div>
          <h2 className="text-2xl mb-2">
            {isLogin ? "Login" : "Sign up"} to Pays
          </h2>
          <form
            className="py-6 rounded-lg bg-base-300 w-sm grid place-items-center gap-2"
            onSubmit={handleSubmit(onSubmit)}
          >
            {!isLogin && (
              <>
                <TextField
                  label="Username"
                  hint="Start and end with a letter, and can contain underscores in between."
                  name="userName"
                  register={register}
                  placeholder="John"
                  error={errors.userName}
                />
                <TextField
                  label="Full Name"
                  hint="Only letters and spaces, no consecutive spaces."
                  name="fullName"
                  placeholder="John Doe"
                  register={register}
                  error={errors.fullName}
                />
              </>
            )}

            <TextField
              label="Email"
              name="email"
              type="email"
              register={register}
              placeholder="user@example.com"
              error={errors.email}
            />
            <PasswordField
              label="Password"
              name="password"
              hint="Must be 8-30 characters long."
              register={register}
              error={errors.password}
              isLogin={isLogin}
            />

            <button className="btn py-4 my-2 w-2/3 border-accent" type="submit">
              {isLogin ? "Login" : "Sign up"}
            </button>
            <div>
              {
                <span>
                  {isLogin
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <button
                    type="button"
                    className="underline cursor-pointer"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? "Sign up" : "Login"}
                  </button>
                </span>
              }
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
