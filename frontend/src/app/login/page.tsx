"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/lib/store/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
      // Small delay to ensure state is persisted before redirect
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push("/dashboard");
      router.refresh(); // Force refresh to update server components
    } catch (error) {
      // Error is handled by store
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center bg-background-light p-4 md:p-10 relative overflow-hidden min-h-[calc(100vh-5rem)]">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] -z-10"></div>

      <div className="flex flex-col lg:flex-row w-full max-w-[1100px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-[600px]">
        {/* Left Side: Image / Value Prop */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 relative bg-background-section p-12">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center opacity-90"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAWFUBZE3oT_IoYqhidzuuRIVzaBA7RwfBpl73XDbocLKQRafSJ2Ocrb_98tfrk4Zfjmz6rPaRqdqD4hd7KU2E_APyE6f3ZZ6CzgahylcAsTG326qfDbgFMh7I9SNz1wPZzI0TFo6Nrvtr9mdhMBhbjwPctXlTjk9S1iRoZE93CUfaBYXNcQAsM6XTCcTJV-lwkSs5h8ejoI9OBOFn3iwxsZrVWLGkd6R7f0uGrWvoU-JMGAzJkHoGoctfCOGw44GFluWDHobi7SyMT')",
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          </div>
          <div className="relative z-10 mt-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/90 text-white text-sm font-medium mb-4 backdrop-blur-sm">
              <span className="material-symbols-outlined text-[18px]">
                verified
              </span>
              Trusted by 10,000+ Seniors
            </div>
            <h1 className="text-white text-4xl font-bold leading-tight mb-4">
              Lifelong learning made simple.
            </h1>
            <p className="text-gray-200 text-lg">
              Join a community of curious minds. Access courses designed
              specifically for your pace.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 flex flex-col p-6 sm:p-10 md:p-14 justify-center">
          {/* Header Text */}
          <div className="mb-8">
            <h2 className="text-text-main text-3xl font-bold mb-2">
              Welcome Back
            </h2>
            <p className="text-text-secondary text-base">
              Please enter your details to continue learning.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8 border-b border-gray-200">
            <div className="flex gap-8">
              <button className="relative pb-3 text-primary border-b-[3px] border-primary font-bold text-lg flex items-center gap-2 transition-all">
                Login
                <span className="text-sm font-normal text-text-secondary">
                  (เข้าสู่ระบบ)
                </span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form
            className="flex flex-col gap-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-base text-red-600 flex items-center justify-between">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={clearError}
                  className="font-medium text-red-700 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-text-main text-base font-medium">
                Email or Phone Number{" "}
                <span className="text-text-secondary text-sm font-normal ml-1">
                  (อีเมล หรือ เบอร์โทร)
                </span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-2xl">
                  mail
                </span>
                <input
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-gray-300 bg-white text-text-main placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary text-lg transition-all"
                  placeholder="somchai@email.com"
                  type="email"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-text-main text-base font-medium">
                Password{" "}
                <span className="text-text-secondary text-sm font-normal ml-1">
                  (รหัสผ่าน)
                </span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-2xl">
                  lock
                </span>
                <input
                  className="w-full h-14 pl-12 pr-12 rounded-xl border border-gray-300 bg-white text-text-main placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary text-lg transition-all"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Options */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-text-main text-base group-hover:text-primary transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                className="text-primary hover:text-blue-700 font-medium text-base hover:underline decoration-2 underline-offset-4"
                href="/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full h-14 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-lg font-bold rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>
                {isLoading ? "Signing in..." : "Log In (เข้าสู่ระบบ)"}
              </span>
              {!isLoading && (
                <span className="material-symbols-outlined">arrow_forward</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Help Link */}
      <div className="absolute bottom-4 text-center w-full text-text-secondary text-sm">
        Need help?{" "}
        <Link className="text-primary hover:underline" href="/help">
          Contact Support
        </Link>
      </div>
    </main>
  );
}
