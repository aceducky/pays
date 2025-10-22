import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect } from "react";
import {
  passwordChangeSchema,
  userFullNameChangeSchema,
} from "../../../shared/zodSchemas/user.zodSchema.js";
import useChangeFullName from "../hooks/useChangeFullName.jsx";
import { useAuth } from "../auth/hooks/useAuth.js";
import { usePasswordMutation } from "../auth/hooks/usePasswordMutation.js";
import { normalizeError } from "../utils/utils.js";

export default function ProfileModal({ open, onClose }) {
  const { user } = useAuth();
  const { changeFullNameAsync, isChangingFullName, changeFullNameError } =
    useChangeFullName();
  const passwordMutation = usePasswordMutation();

  const {
    register: registerName,
    handleSubmit: handleSubmitName,
    formState: { errors: nameErrors },
    reset: resetName,
  } = useForm({
    resolver: zodResolver(userFullNameChangeSchema),
    defaultValues: { fullName: user?.fullName || "" },
  });

  const {
    register: registerPass,
    handleSubmit: handleSubmitPass,
    formState: { errors: passErrors },
    reset: resetPass,
  } = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { oldPassword: "", newPassword: "" },
  });

  async function onSubmitName(data) {
    try {
      const response = await changeFullNameAsync(data);
      toast.success(response.message ?? "Name updated");
      resetName();
      onClose();
    } catch {
      toast.error(normalizeError(changeFullNameError));
    }
  }

  async function onSubmitPass(data) {
    try {
      await passwordMutation.mutateAsync(data);
      toast.success("Password updated!");
      resetPass();
      onClose();
    } catch {
      toast.error(normalizeError(passwordMutation.error));
    }
  }

  useEffect(() => {
    if (!open) {
      resetName();
      resetPass();
    }
  }, [open, resetName, resetPass]);

  if (!open) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-md">
        <form method="dialog">
          <button
            type="button"
            className="btn btn-sm btn-error absolute right-2 top-2"
            onClick={onClose}
          >
            close
          </button>
        </form>

        <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>

        {/* Full Name Form */}
        <form className="mb-6" onSubmit={handleSubmitName(onSubmitName)}>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Full Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              {...registerName("fullName")}
              placeholder="Full Name"
              disabled={isChangingFullName}
            />
            {nameErrors.fullName && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {nameErrors.fullName.message}
                </span>
              </label>
            )}
          </div>
          <button
            className="btn btn-primary w-full mt-4"
            type="submit"
            disabled={isChangingFullName}
          >
            {isChangingFullName ? "Updating..." : "Update Name"}
          </button>
        </form>

        <div className="divider">OR</div>

        {/* Password Form */}
        <form onSubmit={handleSubmitPass(onSubmitPass)}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-semibold">Current Password</span>
            </label>
            <input
              type="password"
              className="input input-bordered"
              {...registerPass("oldPassword")}
              placeholder="Current password"
            />
            {passErrors.oldPassword && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {passErrors.oldPassword.message}
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">New Password</span>
            </label>
            <input
              type="password"
              className="input input-bordered"
              {...registerPass("newPassword")}
              placeholder="New password"
            />
            {passErrors.newPassword && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {passErrors.newPassword.message}
                </span>
              </label>
            )}
          </div>

          <button
            className="btn btn-primary w-full mt-4"
            type="submit"
            disabled={passwordMutation.isPending}
          >
            {passwordMutation.isPending ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
