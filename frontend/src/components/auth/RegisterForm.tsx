import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useRegister } from "@/hooks/useAuth";
import { RegisterInput } from "@/types/auth.types";
import { registerSchema } from "@/schemas/auth.schema";


interface RegisterFormProps {
    onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
    const registerMutation = useRegister()

    const form = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            username: "",
            email: "",
            password: "",
        },
    })

    const onSubmit = (data: RegisterInput) => {
        registerMutation.mutate(
            data,
            {
                onSuccess: () => {
                    if (onSuccess) onSuccess();
                }
            }
        )
    }


    return (
       
            <Card className="w-[400px] shadow-xl">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">
                        Create Account
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
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <Input placeholder="Full Name" {...field} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <Input placeholder="Username" {...field} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <Input placeholder="Email" {...field} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <Input type="password" placeholder="Password" {...field} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={registerMutation.isPending} >
                                {registerMutation.isPending ? "Registering..." : "Register"}


                            </Button>

                        </form>
                    </Form>

                    <div className="flex items-center justify-center gap-x-2 mt-2">
                        <p>Have already account? </p>
                        <Link to={"/login"} className="text-blue-500 text-bold  ">Login</Link>
                    </div>
                </CardContent>
            </Card>
        
    )

}
