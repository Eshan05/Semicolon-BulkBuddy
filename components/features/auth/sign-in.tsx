"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function SignIn() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await signIn(email, password);
      router.push("/buyer-dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-slate-50 mb-2">
          Welcome to BulkBuddy
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Sign in to your account
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-950 dark:text-slate-50 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-600" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-400"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-950 dark:text-slate-50 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-600" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-400"
            required
          />
        </div>
      </div>

      <Link
        href="/forgot-password"
        className="text-sm text-blue-900 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 block"
      >
        Forgot password?
      </Link>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-blue-900 dark:bg-blue-600 text-white font-bold hover:bg-blue-800 dark:hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <div className="text-center">
        <p className="text-slate-600 dark:text-slate-400">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="text-blue-900 dark:text-blue-400 font-bold hover:text-blue-800 dark:hover:text-blue-300"
          >
            Sign up
          </Link>
        </p>
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50 flex items-center justify-center gap-2"
        >
          Back to home
        </Link>
      </div>

      <div className="mt-8 p-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-400">
        <p className="font-semibold mb-2">Demo credentials:</p>
        <p>Email: demo@bulkbuddy.com</p>
        <p>Password: demo123</p>
      </div>
    </form>
  );
}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </form>
  );
}
