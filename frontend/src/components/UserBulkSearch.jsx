import { CircleX } from "lucide-react";
import { useUserBulkSearch } from "../../hooks/useUserBulkSearch.jsx";
import { normalizeError } from "../utils/utils.js";
import LoadingText from "./LoadingText.jsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { userNameSchema } from "../../../shared/zodSchemas/user.zodSchema.js";

export default function UserBulkSearch() {
  const { data, isLoading, isError, error } = useUserBulkSearch();

  if (isLoading) return <LoadingText />;
  if (isError)
    return (
      <div className="alert alert-error">
        <CircleX />
        {normalizeError(error)}
      </div>
    );
  return (
    <>
      <div></div>
      {data.users.map((user) => {
        return (
          <div key={user.userName} className="border my-2">
            <div className="flex">
              <div>
                <div>@{user.userName}</div>
                {user.fullName}
              </div>
              <button
                className="btn"
                onClick={() => {
                  /**todo: daisyui modal to pay the user at api.post("/payments") with data {receiverUserName,amountStr,description,just use fake data or form for now} */
                }}
              >
                Pay
              </button>
            </div>
          </div>
        );
      })}
      <div>
        {Array.from({ length: data.pagination.pages })
          .fill(null)
          .map((_, i) => {
            return (
              <div className="join" key={i}>
                <input
                  className="join-item btn btn-square"
                  type="radio"
                  name="options"
                  aria-label={i + 1}
                  checked={data.pagination.page === i + 1}
                  onClick={() => {
                    /** navigate respective page */
                  }}
                />
              </div>
            );
          })}
      </div>
    </>
  );
}
