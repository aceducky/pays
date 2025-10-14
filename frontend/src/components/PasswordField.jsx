import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({
  label,
  name,
  hint,
  register,
  error,
  placeholder = "********",
}) {
  const [type, setType] = useState("password");

  const toggleType = () => {
    setType((prevType) => (prevType === "password" ? "text" : "password"));
  };

  return (
    <label className="w-5/6">
      <span className="label mb-1">{label}</span>
      <label
        className={`peer input focus-within:outline-none flex items-center gap-2 w-full ${
          error ? "input-error" : ""
        }`}
      >
        <input
          type={type}
          placeholder={placeholder || label}
          {...register(name)}
          className={`${error ? "input-error" : ""}`}
        />
        <button
          type="button"
          className="btn btn-sm btn-ghost btn-square"
          onClick={(e) => {
            e.preventDefault();
            toggleType();
          }}
          title={type === "password" ? "Show password" : "Hide password"}
          aria-label={type === "password" ? "Show password" : "Hide password"}
        >
          {type === "password" ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </label>
      <div className="grid grid-rows-[0fr] peer-focus-within:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-in-out">
        {!error && hint && (
          <span className="text-wrap text-sm overflow-hidden">{hint}</span>
        )}
      </div>
      {error && (
        <span className="label text-error text-wrap">{error.message}</span>
      )}
    </label>
  );
}
