import { useNavigate } from "react-router";
import AuthForm from "../components/AuthForm.jsx";
import { userLoginSchema } from "../../../shared/zodSchemas/user.zodSchema.js";
import { useAuth } from "../auth/hooks/useAuth.js";

export default function Login() {
  const navigate = useNavigate();
  const { loginAsync, isLoggingIn, loginError } = useAuth();

  const loginFields = [
    {
      label: "Email",
      name: "email",
      type: "email",
      placeholder: "user@example.com",
      autofocus: true,
    },
    {
      label: "Password",
      name: "password",
      type: "password",
      hint: "Must be 8-30 characters long.",
      isLogin: true,
    },
  ];

  const onSubmit = async (data) => {
    await loginAsync(data);
  };

  return (
    <AuthForm
      title="Login to Pays"
      schema={userLoginSchema}
      fields={loginFields}
      onSubmit={onSubmit}
      isSubmitting={isLoggingIn}
      submitButtonText={`${isLoggingIn ? "Logging in" : "Login"}`}
      footerText="Don't have an account?"
      footerLinkText="Signup"
      onFooterLinkClick={() => navigate("/auth/signup")}
      serverError={loginError}
    />
  );
}
