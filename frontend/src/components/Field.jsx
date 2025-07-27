import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function Field({
  label,
  type,
  id,
  isRequired,
  placeholder,
  instructions,
}) {
  return (
    <div className="grid gap-2">
      <Label className="font-semibold text-base" htmlFor={id}>
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        required={isRequired}
      />
      <div className="text-gray-400 text-[0.95rem]">{instructions}</div>
    </div>
  );
}
