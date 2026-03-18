import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { useLogin } from "@/hooks/useAuth";
import { LoginInput } from "@/types/auth.types";
import { loginSchema } from "@/schemas/auth.schema";

interface LoginFormProps {
    onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
    const loginMutation = useLogin()

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    });

    const onSubmit = (data: LoginInput) => {
        loginMutation.mutate(
            data,
            {
                onSuccess: () => {
                    if (onSuccess) onSuccess()
                }
            }
        )

    };


    return (

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

            <div className="flex justify-center gap-x-2 mt-4">

                <p className="text-sm text-gray-600">Have not already account? </p>
                <Link to={"/register"} className="text-blue-500 text-bold  ">Register</Link>
            </div>
        </Card>


    );
}
