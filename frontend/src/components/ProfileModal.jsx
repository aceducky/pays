import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { CircleX, X } from "lucide-react";
import {
    passwordChangeSchema,
    userFullNameChangeSchema,
} from "../../../shared/zodSchemas/index.js";
import useChangeFullName from "../hooks/useChangeFullName.jsx";
import { useAuth } from "../auth/hooks/useAuth.js";
import { usePasswordMutation } from "../auth/hooks/usePasswordMutation.js";
import { normalizeError } from "../utils/utils.js";
import PasswordField from "./PasswordField.jsx";
import TextField from "./TextField.jsx";

export default function ProfileModal({ open, onClose }) {
    const { user } = useAuth();
    const modalRef = useRef(null);
    const { changeFullNameAsync, isChangingFullName, changeFullNameError } =
        useChangeFullName();
    const passwordMutation = usePasswordMutation();

    // Full Name Form
    const {
        register: registerName,
        handleSubmit: handleSubmitName,
        formState: { errors: nameErrors },
        reset: resetName,
    } = useForm({
        resolver: zodResolver(userFullNameChangeSchema),
        defaultValues: { fullName: user?.fullName || "" },
        resetOptions: { keepDirtyValues: false, keepErrors: false },
        mode: "onBlur",
        reValidateMode: "onChange",
    });

    // Password Form
    const {
        register: registerPass,
        handleSubmit: handleSubmitPass,
        formState: { errors: passErrors },
        reset: resetPass,
        clearErrors: clearPassErrors,
    } = useForm({
        resolver: zodResolver(passwordChangeSchema),
        defaultValues: { oldPassword: "", newPassword: "" },
        resetOptions: { keepDirtyValues: false, keepErrors: false },
        mode: "onBlur",
        reValidateMode: "onChange",
    });

    // Reset forms when modal opens
    useEffect(() => {
        if (open) {
            resetName({ fullName: user?.fullName || "" });
            resetPass({ oldPassword: "", newPassword: "" });
            // Clear any lingering errors
            clearPassErrors();
        }
    }, [open, user, resetName, resetPass, clearPassErrors]);

    // Reset password form and clear errors when modal closes
    useEffect(() => {
        if (!open) {
            // Use setTimeout to ensure the reset happens after the modal is fully closed
            setTimeout(() => {
                resetPass({ oldPassword: "", newPassword: "" }, {
                    keepErrors: false,
                    keepDirty: false,
                    keepIsSubmitted: false,
                    keepTouched: false,
                    keepIsValid: false,
                    keepSubmitCount: false
                });
                clearPassErrors();
            }, 100);
        }
    }, [open, resetPass, clearPassErrors]);

    // Modal open/close handling
    useEffect(() => {
        if (!modalRef.current) return;

        if (open) modalRef.current.showModal();
        else modalRef.current.close();
    }, [open]);

    async function onSubmitName(data) {
        try {
            const response = await changeFullNameAsync(data);
            toast.success(response.message ?? "Name updated");
            onClose();
        } catch {
            toast.error(normalizeError(changeFullNameError));
        }
    }

    async function onSubmitPass(data) {
        try {
            const response = await passwordMutation.mutateAsync(data);
            toast.success(response.message ?? "Password updated!");
            // Reset the password form on successful submission
            resetPass({ oldPassword: "", newPassword: "" });
            clearPassErrors();
            onClose();
        } catch {
            toast.error(normalizeError(passwordMutation.error));
        }
    }

    const handleClose = () => {
        if (!isChangingFullName && !passwordMutation.isPending) {
            onClose();
        }
    };

    const handleESC = (event) => {
        if (isChangingFullName || passwordMutation.isPending) {
            event.preventDefault();
        } else {
            handleClose();
        }
    };

    return (
        <dialog
            ref={modalRef}
            className="modal"
            onCancel={handleESC}
            onClose={handleClose}
        >
            <div className="modal-box max-w-md">
                <form method="dialog">
                    <button
                        type="button"
                        className="btn btn-sm absolute right-2 top-2"
                        onClick={handleClose}
                        disabled={isChangingFullName || passwordMutation.isPending}
                    >
                        <X/>
                    </button>
                </form>

                <h3 className="font-bold text-lg mb-6">Profile Settings</h3>

                {/* Full Name Form */}
                <form
                    className="card py-5 px-4 rounded-lg bg-base-300 grid place-items-center gap-2 w-full mb-4"
                    onSubmit={handleSubmitName(onSubmitName)}
                >
                    <TextField
                        label="Full Name"
                        name="fullName"
                        hint="Only letters and spaces, no consecutive spaces."
                        register={registerName}
                        error={nameErrors.fullName}
                        placeholder="Full Name"
                    />
                    {changeFullNameError && (
                        <div className="alert alert-error text-center text-wrap w-5/6">
                            <CircleX />
                            {normalizeError(changeFullNameError)}
                        </div>
                    )}
                    <button
                        className="btn py-4 my-2 w-2/3 border-accent hover:shadow-lg hover:bg-accent/20 active:bg-accent/85 disabled:bg-accent disabled:text-accent-content"
                        type="submit"
                        disabled={isChangingFullName}
                    >
                        {isChangingFullName ? "Updating..." : "Update Name"}
                    </button>
                </form>

                <div className="divider">OR</div>

                {/* Password Form */}
                <form
                    className="card py-5 px-4 rounded-lg bg-base-300 grid place-items-center gap-2 w-full"
                    onSubmit={handleSubmitPass(onSubmitPass)}
                >
                    <PasswordField
                        label="Current Password"
                        name="oldPassword"
                        hint="Your current password."
                        register={registerPass}
                        error={passErrors.oldPassword}
                        placeholder="Current password"
                    />

                    <PasswordField
                        label="New Password"
                        name="newPassword"
                        hint="Must be between 8 to 30 characters."
                        register={registerPass}
                        error={passErrors.newPassword}
                        placeholder="New password"
                    />

                    {passwordMutation.error && (
                        <div className="alert alert-error text-center text-wrap w-5/6">
                            <CircleX />
                            {normalizeError(passwordMutation.error)}
                        </div>
                    )}

                    <button
                        className="btn py-4 my-2 w-2/3 border-accent hover:shadow-lg hover:bg-accent/20 active:bg-accent/85 disabled:bg-accent disabled:text-accent-content"
                        type="submit"
                        disabled={passwordMutation.isPending}
                    >
                        {passwordMutation.isPending ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>

            <form method="dialog" className="modal-backdrop">
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={isChangingFullName || passwordMutation.isPending}
                >
                    close
                </button>
            </form>
        </dialog>
    );
}