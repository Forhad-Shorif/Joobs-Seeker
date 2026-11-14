'use client';
import { authClient } from "@/lib/auth-client";
import { Button, Description, FieldError, Form, Input, Label, TextField } from "@heroui/react";
import Link from "next/link";
import React, { useState } from "react";
import { showToast } from "@/lib/utils/toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { FaGithub } from "react-icons/fa6";

const SignPage = () => {

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const HandleonSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const user = Object.fromEntries(formData.entries()) as {
      email: string;
      password: string;
    };

    const { data, error } = await authClient.signIn.email({
      ...user,
      callbackURL: callbackUrl,
    });
    console.log(data)

    setLoading(false);

    if (error) {
      showToast.error('Sign-in failed! Please check your credentials.');
      return;
    }
    showToast.success('Successfully signed in!');
    router.replace(callbackUrl);
    router.refresh();
  };

  // Google Sign In Handler
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
    });
  };

  // GitHub Sign In Handler
  const handleGithubSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: callbackUrl,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* Background Glow Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Sign In Page Title */}
      <div className="text-center space-y-2 mb-8 relative z-10">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-2 text-indigo-400 shadow-inner">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back! 👋</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Sign in to access your dashboard, market comparisons, and profile.
        </p>
      </div>

      {/* Sign In Form Box */}
      <Form
        className="w-full max-w-md space-y-5 rounded-3xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl shadow-indigo-950/50 relative z-10"
        onSubmit={HandleonSubmit}
      >
        {/* Social Sign In Buttons */}
        <div className="grid grid-cols-2 gap-3 pb-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center gap-2.5 rounded-2xl border border-slate-700/60 bg-slate-800/50 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-200 transition-all hover:bg-slate-800 hover:border-slate-600 hover:text-white cursor-pointer active:scale-95 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.8 7.3l3.7 2.9C6.4 7.2 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
              <path fill="#FBBC05" d="M5.5 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.8 7.3C.7 9.5 0 10.7 0 12.5s.7 3 1.8 5.2l3.7-2.9z" />
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.6-2.2-6.5-5.2L1.8 17C3.7 20.7 7.5 24 12 24z" />
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={handleGithubSignIn}
            className="flex items-center justify-center gap-2.5 rounded-2xl border border-slate-700/60 bg-slate-800/50 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-200 transition-all hover:bg-slate-800 hover:border-slate-600 hover:text-white cursor-pointer active:scale-95 shadow-sm"
          >
            <FaGithub className="size-4" />
            GitHub
          </button>
        </div>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">Or continue with email</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Email Field */}
        <TextField isRequired className="flex flex-col gap-1.5">
          <Label className="text-xs sm:text-sm font-medium text-slate-300 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-indigo-400" /> Email Address
          </Label>
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-slate-700/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 bg-slate-950/50 focus:bg-slate-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          <FieldError className="text-xs font-medium text-rose-400" />
        </TextField>

        {/* Password Field with Eye Comfort Show/Hide Toggle */}
        <TextField isRequired className="flex flex-col gap-1.5">
          <Label className="text-xs sm:text-sm font-medium text-slate-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-400" /> Password
          </Label>
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              minLength={8}
              placeholder="Enter your password"
              className="w-full rounded-2xl border border-slate-700/80 px-4 py-3 pr-11 text-sm text-slate-100 placeholder-slate-500 bg-slate-950/50 focus:bg-slate-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Description className="text-[11px] text-slate-500 leading-relaxed">
            Must be at least 8 characters, include one uppercase letter and one number.
          </Description>
          <FieldError className="text-xs font-medium text-rose-400" />
        </TextField>

        {/* Form Action Buttons */}
        <div className="flex items-center gap-3 pt-3">
          <Button
            type="submit"
            isDisabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-600/50 cursor-pointer active:scale-98"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <Button
            type="reset"
            variant="secondary"
            className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-3 text-sm font-semibold text-slate-300 shadow-sm transition-all hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            Reset
          </Button>
        </div>

        {/* Bottom Sign Up Link inside Form */}
        <div className="pt-4 text-center border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Don{"'"}t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </Form>

      {/* Back to Home Link */}
      <div className="text-center mt-6 relative z-10">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-all duration-200 bg-slate-900/60 hover:bg-slate-800/80 px-5 py-2.5 rounded-full border border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          <span className="transform transition-transform duration-200 group-hover:-translate-x-1">←</span>
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default SignPage;