import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PasswordField from "./PasswordField.jsx";
import TextField from "./TextField.jsx";
import { CircleX } from "lucide-react";

export default function AuthForm({
  title,
  schema,
  fields,
  onSubmit,
  isSubmitting,
  submitButtonText,
  footerText,
  footerLinkText,
  onFooterLinkClick,
  serverError,
}) {
  "use no memo"
   const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    reValidateMode: "onChange",
  });
  return (
    <main className="grid place-items-center h-screen">
      <div className="flex flex-col w-full px-2 max-w-sm">
        <h2 className="text-2xl mb-4">{title}</h2>

        <form
          className="card py-5 px-2 rounded-lg bg-base-300 grid place-items-center gap-2 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          {fields.map((field) => {
            if (field.type === "password") {
              return (
                <PasswordField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  hint={field.hint}
                  error={errors[field.name]}
                  registration={register(field.name)}
                />
              );
            }
            return (
              <TextField
                key={field.name}
                label={field.label}
                name={field.name}
                type={field.type || "text"}
                hint={field.hint}
                placeholder={field.placeholder}
                error={errors[field.name]}
                registration={register(field.name)}
              />
            );
          })}
          {serverError && (
            <div className="alert alert-error mb-4 text-center text-wrap">
              <CircleX />
              {serverError}
            </div>
          )}
          <button
            disabled={isSubmitting}
            className="btn py-4 my-2 w-2/3 border-accent hover:shadow-lg hover:bg-accent/20 active:bg-accent/85
            disabled:bg-accent
            disabled:text-accent-content
            "
            type="submit"
          >
            {submitButtonText}
          </button>
          <div className="mx-6">
            <span>
              {footerText}{" "}
              <button
                type="button"
                className="underline cursor-pointer disabled:cursor-not-allowed"
                disabled={isSubmitting}
                onClick={onFooterLinkClick}
              >
                {footerLinkText}
              </button>
            </span>
          </div>
        </form>
      </div>
    </main>
  );
}
