import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { userNameSchema } from "../../../shared/zodSchemas/user.zodSchema.js";
import TextField from "./TextField.jsx";

export default function UserSearchForm() {
  const onSubmit = async (data) => {
    console.log(data);
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userNameSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField  />
      </form>
    </>
  );
}
