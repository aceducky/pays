export default function TextField({
  label,
  hint,
  error,
  type = "text",
  placeholder,
  disabled = false,
  registration,
}) {
  "use no memo"
  return (
    <label className="w-5/6">
      <span className="label mb-1 text-white">{label}</span>
      <input
        {...registration}
        disabled={disabled}
        type={type}
        placeholder={placeholder || label}
        className={`peer input w-full focus-within:outline-none focus-within:border-2 focus-within:border-base-content/80 ${
          error ? "input-error" : ""
        }`}
      />
      <div className="grid grid-rows-[0fr] peer-focus:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-in-out">
        {!error && hint && (
          <span className="text-wrap text-sm overflow-hidden">{hint}</span>
        )}
      </div>
      {error && <span className="text-error text-wrap">{error.message}</span>}
    </label>
  );
}
