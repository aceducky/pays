export default function TextField({
  label,
  name,
  hint,
  register,
  error,
  type = "text",
  placeholder,
}) {
  return (
    <label className="w-5/6">
      <span className="label mb-1">{label}</span>
      <input
        type={type}
        placeholder={placeholder || label}
        {...register(name)}
        className={`peer input focus:outline-none w-full ${
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
