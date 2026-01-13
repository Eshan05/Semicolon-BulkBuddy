import Link from "next/link";
import { ArrowRight, Users, TrendingDown, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            BulkBuddy
          </div>
          <div className="flex gap-4">
            <Link
              href="/sign-in"
              className="px-6 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-6 py-2 rounded-lg bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-950 dark:text-slate-50">
          Slash Raw Material{" "}
          <span className="text-blue-600 dark:text-blue-400">Costs by 20%</span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
          Join the group buying revolution. Pool resources with other SME businesses
          and unlock volume-based discounts automatically.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/buyer-dashboard"
            className="px-8 py-3 rounded-lg bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 transition flex items-center gap-2 font-semibold"
          >
            Login as Buyer <ArrowRight size={20} />
          </Link>
          <Link
            href="/supplier-dashboard"
            className="px-8 py-3 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition flex items-center gap-2 font-semibold"
          >
            Login as Supplier <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white dark:bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-950 dark:text-slate-50">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-blue-900 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-950 dark:text-slate-50">
                Join Pool
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Browse active buying pools for materials you need. Select quantity
                and join with other businesses.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-6">
                <TrendingDown className="w-10 h-10 text-emerald-900 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-950 dark:text-slate-50">
                Price Drops
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                As the pool reaches volume milestones, unit prices automatically
                decrease. Watch real-time price reductions.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-6">
                <Zap className="w-10 h-10 text-amber-900 dark:text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-950 dark:text-slate-50">
                Save Big
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Get your materials at bulk prices without the hassle of finding
                multiple suppliers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-950 dark:text-slate-50">
            Why BulkBuddy
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <h4 className="text-xl font-bold mb-3 text-slate-950 dark:text-slate-50">
                Transparent Pricing
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                See exactly how much you save at each volume tier. No hidden fees.
              </p>
            </div>
            <div className="p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <h4 className="text-xl font-bold mb-3 text-slate-950 dark:text-slate-50">
                Verified Suppliers
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                All suppliers are verified. Quality and timely delivery guaranteed.
              </p>
            </div>
            <div className="p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <h4 className="text-xl font-bold mb-3 text-slate-950 dark:text-slate-50">
                Mobile-First
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Access pools on-the-go. Join or manage orders from your phone.
              </p>
            </div>
            <div className="p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <h4 className="text-xl font-bold mb-3 text-slate-950 dark:text-slate-50">
                Real-Time Updates
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Get notified when volume milestones are reached and prices drop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2026 BulkBuddy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
