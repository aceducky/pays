import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userFullNameChangeSchema, passwordChangeSchema } from "../../../shared/zodSchemas/user.zodSchema.js";
import useChangeFullName from "../../hooks/useChangeFullName.jsx";
import { usePasswordMutation } from "../auth/hooks/usePasswordMutation.js";
import { useAuth } from "../auth/hooks/useAuth.js";
import { toast } from "sonner";

export default function ProfileModal({ open, onClose }) {
  const { user } = useAuth();
  const { changeFullNameAsync, isChangingFullName } = useChangeFullName();
  const passwordMutation = usePasswordMutation();

  // Full name form
  const {
    register: registerName,
    handleSubmit: handleSubmitName,
    formState: { errors: nameErrors },
    reset: resetName,
  } = useForm({
    resolver: zodResolver(userFullNameChangeSchema),
    defaultValues: { fullName: user?.fullName || "" },
  });

  // Password form
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
      await changeFullNameAsync(data);
      toast.success("Name updated!");
      resetName();
      onClose();
    } catch (e) {
      toast.error(e?.message || "Failed to update name");
    }
  }

  async function onSubmitPass(data) {
    try {
      await passwordMutation.mutateAsync(data);
      toast.success("Password updated!");
      resetPass();
      onClose();
    } catch (e) {
      toast.error(e?.message || "Failed to update password");
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-8 relative" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Profile Settings</h2>
          <button type="button" className="btn btn-ghost btn-circle text-xl" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form className="mb-6" onSubmit={handleSubmitName(onSubmitName)}>
          <div className="form-control mb-2">
            <label className="label font-semibold">Full Name</label>
            <input
              className="input input-bordered"
              {...registerName("fullName")}
              placeholder="Full Name"
              defaultValue={user?.fullName || ""}
              disabled={isChangingFullName}
            />
            {nameErrors.fullName && <span className="text-error text-xs mt-1">{nameErrors.fullName.message}</span>}
          </div>
          <button className="btn btn-dark w-full mt-2" type="submit" disabled={isChangingFullName}>Update Name</button>
        </form>
        <form onSubmit={handleSubmitPass(onSubmitPass)}>
          <div className="form-control mb-2">
            <label className="label font-semibold">Change Password</label>
            <input
              className="input input-bordered mb-2"
              type="password"
              {...registerPass("oldPassword")}
              placeholder="Current password"
            />
            {passErrors.oldPassword && <span className="text-error text-xs mt-1">{passErrors.oldPassword.message}</span>}
            <input
              className="input input-bordered"
              type="password"
              {...registerPass("newPassword")}
              placeholder="New password"
            />
            {passErrors.newPassword && <span className="text-error text-xs mt-1">{passErrors.newPassword.message}</span>}
          </div>
          <button className="btn btn-dark w-full mt-2" type="submit" disabled={passwordMutation.isPending}>Update Password</button>
        </form>
      </div>
    </div>
  );
}
