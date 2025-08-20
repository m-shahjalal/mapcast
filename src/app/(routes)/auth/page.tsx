"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { login } from "./auth-action";
import { useRouter } from "next/navigation";

const validateSchema = z.object({
  email: z.email(),
  password: z.string().min(4),
});

export default function LoginPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(validateSchema),
  });

  const onSubmit = (data: z.infer<typeof validateSchema>) => {
    startTransition(async () => {
      try {
        const response = await login(data);
        if (response.success) {
          router.push("/dashboard");
        } else {
          form.setError("root", { message: "Invalid credentials" });
        }
      } catch (error) {
        form.setError("root", { message: "Invalid credentials" });
        console.error(error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign In
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.formState.errors.root && (
            <p className="text-red-500 text-center">
              {form.formState.errors.root.message}
            </p>
          )}
          <form
            className="flex flex-col gap-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                {...form.register("email")}
                placeholder="Enter your email"
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-xs">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                {...form.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
              />
              <div className="flex items-center justify-start gap-2 w-full">
                <Input
                  className="w-4 h-4 mt-2"
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                <Label className="mt-2" htmlFor="showPassword">
                  Show Password
                </Label>
              </div>

              {form.formState.errors.password && (
                <p className="text-red-500 text-xs">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <Button disabled={pending} className="w-full my-2" type="submit">
              {pending ? "Loading..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
