import { LoginForm } from "../components/login-form";

export default function Login() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm signup={false} />
      </div>
    </div>
  );
}
