"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, User, Building, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [userType, setUserType] = useState<"buyer" | "supplier">("buyer");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType,
        company: formData.company,
      });
      router.push(
        userType === "buyer"
          ? "/buyer-dashboard"
          : "/supplier-dashboard"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-slate-50 mb-2">
          Join BulkBuddy
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Create your account
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* User Type Selection */}
      <div className="flex gap-4 mb-8">
        <button
          type="button"
          onClick={() => setUserType("buyer")}
          className={`flex-1 py-3 rounded-lg font-semibold transition ${
            userType === "buyer"
              ? "bg-blue-900 dark:bg-blue-600 text-white"
              : "bg-slate-200 dark:bg-slate-800 text-slate-950 dark:text-slate-50 hover:bg-slate-300 dark:hover:bg-slate-700"
          }`}
        >
          Buyer
        </button>
        <button
          type="button"
          onClick={() => setUserType("supplier")}
          className={`flex-1 py-3 rounded-lg font-semibold transition ${
            userType === "supplier"
              ? "bg-emerald-600 dark:bg-emerald-500 text-white"
              : "bg-slate-200 dark:bg-slate-800 text-slate-950 dark:text-slate-50 hover:bg-slate-300 dark:hover:bg-slate-700"
          }`}
        >
          Supplier
        </button>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-slate-950 dark:text-slate-50 mb-2">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-600" />
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="John Doe"
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-400"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-slate-950 dark:text-slate-50 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-600" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="you@example.com"
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-400"
            required
          />
        </div>
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-semibold text-slate-950 dark:text-slate-50 mb-2">
          Company Name
        </label>
        <div className="relative">
          <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-600" />
          <input
            type="text"
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            placeholder="Your Company"
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-400"
            required={userType === "supplier"}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-semibold text-slate-950 dark:text-slate-50 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-600" />
          <input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="••••••••"
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-400"
            required
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
          Minimum 6 characters
        </p>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-semibold text-slate-950 dark:text-slate-50 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-600" />
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({
                ...formData,
                confirmPassword: e.target.value,
              })
            }
            placeholder="••••••••"
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-400"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-blue-900 dark:bg-blue-600 text-white font-bold hover:bg-blue-800 dark:hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>

      <div className="text-center">
        <p className="text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-blue-900 dark:text-blue-400 font-bold hover:text-blue-800 dark:hover:text-blue-300"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50"
        >
          Back to home
        </Link>
      </div>
    </form>
  );
}
