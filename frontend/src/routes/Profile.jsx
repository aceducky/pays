import { zodResolver } from "@hookform/resolvers/zod";
import { CircleX } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router/internal/react-server-client";
import { toast } from "sonner";
import {
  passwordChangeSchema,
  userFullNameChangeSchema,
} from "../../../shared/zodSchemas/index.js";
import { useAuth } from "../auth/hooks/useAuth.js";
import { usePasswordMutation } from "../auth/hooks/usePasswordMutation.js";
import PasswordField from "../components/PasswordField.jsx";
import TextField from "../components/TextField.jsx";
import useChangeFullName from "../hooks/useChangeFullName.js";

export default function Profile() {
  "use no memo"
  const { user } = useAuth();
  const navigate = useNavigate();
  const { changeFullNameAsync, isChangingFullName, changeFullNameError } =
    useChangeFullName();

  const { passwordMutationAsync, isChangingPassword, passwordError } =
    usePasswordMutation();

  const {
    register: registerName,
    handleSubmit: handleNameSubmit,
    formState: { errors: nameErrors },
    reset: resetNameForm,
  } = useForm({
    resolver: zodResolver(userFullNameChangeSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
    },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    formState: { errors: pwdErrors },
    reset: resetPwdForm,
  } = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const onSubmitFullName = async (data) => {
    try {
      const response = await changeFullNameAsync({ fullName: data.fullName });
      resetNameForm({ fullName: data.fullName });
      toast.success(response.message);
      navigate("/dashboard");
    } catch {
      console.log("Failed updating full name");
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      const response = await passwordMutationAsync({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      resetPwdForm({ oldPassword: "", newPassword: "" });
      toast.success(response.message);
      navigate("/dashboard");
    } catch {
      console.log("Failed changing password");
    }
  };

  return (
    <main className="h-full flex items-center justify-center bg-base-100">
      <div className="w-full max-w-md bg-base-200 rounded-2xl shadow-lg p-6 flex flex-col justify-center items-center">
        <div className="flex items-center gap-3 mb-6 self-start">
          <h2 className="text-2xl font-semibold">Profile</h2>
        </div>

        <div className="w-full mb-6">
          <h3 className="text-lg font-medium mb-3">Change full name</h3>
          <form
            onSubmit={handleNameSubmit(onSubmitFullName)}
            className="flex flex-col gap-4"
          >
            <div>
              <TextField
                label="Full name"
                name="fullName"
                type="text"
                hint="Your display name"
                error={nameErrors.fullName}
                placeholder="Full name"
                disabled={isChangingFullName || isChangingPassword}
                registration={registerName("fullName")}
              />
            </div>

            {changeFullNameError && (
              <div className="alert alert-error flex items-center gap-2">
                <CircleX size={18} />
                <span>{changeFullNameError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isChangingFullName || isChangingPassword}
              className="btn btn-accent w-full py-3 text-lg font-semibold hover:shadow-lg transition"
            >
              {isChangingFullName ? "Updating..." : "Update name"}
            </button>
          </form>
        </div>

        <hr className="w-full border-base-300 mb-6" />

        <div className="w-full mb-2">
          <h3 className="text-lg font-medium mb-3">Change password</h3>
          <form
            onSubmit={handlePwdSubmit(onSubmitPassword)}
            className="flex flex-col gap-4"
          >
            <div>
              <PasswordField
                label="Old password"
                name="oldPassword"
                hint="Enter your current password"
                error={pwdErrors.oldPassword}
                registration={registerPwd("oldPassword")}
              />
            </div>

            <div>
              <PasswordField
                label="New password"
                name="newPassword"
                hint="Choose a strong password"
                error={pwdErrors.newPassword}
                registration={registerPwd("newPassword")}
              />
            </div>

            {passwordError && (
              <div className="alert alert-error flex items-center gap-2">
                <CircleX size={18} />
                <span>{passwordError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isChangingPassword || isChangingFullName}
              className="btn btn-accent w-full py-3 text-lg font-semibold hover:shadow-lg transition"
            >
              {isChangingPassword ? "Processing..." : "Change password"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
