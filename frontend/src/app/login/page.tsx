"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch (error) {
      // Error is handled by store
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-background-light py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl lg:p-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-4xl">login</span>
          </div>
          <h1 className="text-3xl font-bold text-text-main">Welcome Back</h1>
          <p className="mt-2 text-lg text-text-secondary">
            Sign in to continue learning
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-base text-red-600">
              {error}
              <button
                type="button"
                onClick={clearError}
                className="ml-2 font-medium underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-11 text-base text-text-secondary hover:text-primary"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 text-base text-text-secondary">
              <input
                type="checkbox"
                className="size-5 rounded border-gray-300"
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-base text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-center text-lg text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
