import { useLoginMutation } from "./useLoginMutation.jsx";
import { useLogoutMutation } from "./useLogoutMutation.jsx";
import { useSignupMutation } from "./useSignupMutation.jsx";
import { useUserQuery } from "./useUserQuery.jsx";
import { usePasswordMutation } from "./usePasswordMutation.jsx";
import {normalizeError} from "../../utils/utils.js";

export function useAuth() {
  const { data: user, isLoading: isUserLoading } = useUserQuery(); // THIS will only run
  // Idle, no request to api:
  const loginMutation = useLoginMutation();
  const signupMutation = useSignupMutation();
  const logoutMutation = useLogoutMutation();
  const passwordMutation = usePasswordMutation();
  return {
    // user state
    user,
    isUserLoading,

    // login
    loginAsync: loginMutation.mutateAsync,
    loginError: normalizeError(loginMutation.error),
    isLoggingIn: loginMutation.isPending,

    // signup
    signupAsync: signupMutation.mutateAsync,
    signupError: normalizeError(signupMutation.error),
    isSigningUp: signupMutation.isPending,

    // logout
    logoutAsync: logoutMutation.mutateAsync,
    logoutError: normalizeError(logoutMutation.error),
    isLoggingOut: logoutMutation.isPending,

    //changing password
    changePasswordAsync: passwordMutation.mutateAsync,
    changePasswordError: normalizeError(passwordMutation.error),
    isChangingPassword: passwordMutation.isPending,
  };
}
