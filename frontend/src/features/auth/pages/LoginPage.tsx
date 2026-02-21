import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";
import { useLogin } from "../hooks/useAuth";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";

export default function LoginPage() {
  const loginMutation = useLogin();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="w-[400px] shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Welcome Back
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <Input type="text" placeholder="Email OR Username" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Input
                      type="password"
                      placeholder="Password"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Login"}
               

              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
