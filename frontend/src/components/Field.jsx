import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function Field({
  label,
  type,
  id,
  isRequired,
  placeholder,
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
    </div>
  );
}
