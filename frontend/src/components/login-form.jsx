import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, signupSchema } from "@/src/zodSchemas.js";
import { cn } from "@/src/lib/utils.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card.jsx";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form.jsx";
import { Input } from "@/src/components/ui/input.jsx";
import { Button } from "@/src/components/ui/button.jsx";
import { Link } from "react-router";
import { useAuth } from "../auth/useAuth";
import { Alert } from "@/src/components/ui/alert.jsx";

export function LoginForm({ className, isSignup = true }) {
  const form = useForm({
    resolver: zodResolver(isSignup ? signupSchema : loginSchema),
    defaultValues: {
      email: "",
      userName: "",
      fullName: "",
      password: "",
    },
  });
  const { login, loginError, signup, signupError } = useAuth();

  const onSubmit = async (data) => {
    try {
      console.log("Form submitted:", data);

      isSignup ? signup(data) : login(data);
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4 bg-zinc-900", className)}>
      {(loginError || signupError) && (
        <Alert type="error">
          {loginError?.response?.data?.message ||
            signupError?.response?.data?.message ||
            "An error occurred"}
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isSignup
              ? "Signup to create a new account"
              : "Login to your account"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-base">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isSignup && (
                <>
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-base">
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="acme" {...field} />
                        </FormControl>
                        {!fieldState.error && (
                          <FormDescription>
                            Username must start with letters and contain only
                            letters and underscores and be 3 to 15 characters
                            long
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-base">
                          Full name
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="John Doe"
                            {...field}
                          />
                        </FormControl>
                        {!fieldState.error && (
                          <FormDescription>
                            Full name must only contain letters and spaces, no
                            leading/trailing spaces
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-base">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    {!fieldState.error && (
                      <FormDescription>
                        Password must be 8 to 30 characters
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full border-2 border-black bg-white text-black hover:bg-zinc-200 text-lg hover:cursor-pointer"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? isSignup
                    ? "Signing up..."
                    : "Logging in..."
                  : isSignup
                    ? "Sign up"
                    : "Log in"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            {isSignup ? (
              <>Already have an account?</>
            ) : (
              <>Don't have an account?</>
            )}{" "}
            {isSignup ? (
              <Link to="/login" className="underline underline-offset-4">
                Log in
              </Link>
            ) : (
              <Link to="/signup" className="underline underline-offset-4">
                Sign up
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
