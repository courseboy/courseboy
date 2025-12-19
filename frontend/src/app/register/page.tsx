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

const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register: registerUser,
    isLoading,
    error,
    clearError,
  } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data.email, data.username, data.password);
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
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-secondary/20 text-teal-700">
            <span className="material-symbols-outlined text-4xl">
              person_add
            </span>
          </div>
          <h1 className="text-3xl font-bold text-text-main">Create Account</h1>
          <p className="mt-2 text-lg text-text-secondary">
            Join SeniorLearn and start learning today
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            label="Username"
            type="text"
            placeholder="johndoe"
            error={errors.username?.message}
            {...register("username")}
          />

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
              placeholder="Create a strong password"
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

          <Input
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <p className="text-base text-text-secondary">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>

          <p className="text-center text-lg text-text-secondary">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
