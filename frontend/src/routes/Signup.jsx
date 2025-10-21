import { useNavigate } from "react-router";
import AuthForm from "../components/AuthForm.jsx";
import { userSignupSchema } from "../../../shared/zodSchemas/user.zodSchema.js";
import { useAuth } from "../auth/hooks/useAuth.js";

export default function Signup() {
  const navigate = useNavigate();
  const { signupAsync, isSigningUp, signupError } = useAuth();

  const signupFields = [
    {
      label: "Username",
      name: "userName",
      placeholder: "John",
      hint: "Start and end with a letter, and can contain underscores in between.",
    },
    {
      label: "Full Name",
      name: "fullName",
      placeholder: "John Doe",
      hint: "Only letters and spaces, no consecutive spaces.",
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      placeholder: "user@example.com",
    },
    {
      label: "Password",
      name: "password",
      type: "password",
      hint: "Must be 8-30 characters long.",
      isLogin: false,
    },
  ];

  const onSubmit = async (data) => {
    await signupAsync(data);
  };

  return (
    <AuthForm
      title="Sign up to Pays"
      schema={userSignupSchema}
      fields={signupFields}
      onSubmit={onSubmit}
      isSubmitting={isSigningUp}
      submitButtonText={`Sign${isSigningUp ? "ing " : " "}up`}
      footerText="Already have an account?"
      footerLinkText="Login"
      onFooterLinkClick={() =>
        navigate("/auth/login")
      }
      serverError={signupError}
    />
  );
}
