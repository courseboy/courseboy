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
      router.push("/dashboard");
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
              <Link
                href="/register"
                className="relative pb-3 text-text-secondary hover:text-text-main font-medium text-lg flex items-center gap-2 transition-all border-b-[3px] border-transparent"
              >
                Register
                <span className="text-sm font-normal text-text-secondary opacity-70">
                  (ลงทะเบียน)
                </span>
              </Link>
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

          {/* Social Login Divider */}
          <div className="relative flex py-8 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">
              Or continue with
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="h-12 flex items-center justify-center gap-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-text-main font-medium">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button className="h-12 flex items-center justify-center gap-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-text-main font-medium">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#06C755">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              Line
            </button>
          </div>

          {/* Mobile only Register CTA */}
          <div className="mt-8 text-center lg:hidden">
            <p className="text-text-main">
              Don&apos;t have an account?{" "}
              <Link
                className="text-primary font-bold hover:underline"
                href="/register"
              >
                Register now
              </Link>
            </p>
          </div>
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
