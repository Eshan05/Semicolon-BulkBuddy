"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Wallet,
  Clock,
  TrendingDown,
  Search,
  Menu,
  X,
} from "lucide-react";
import { BusinessLocationMap } from "@/components/visuals/business-location-map";
import { UserMenu } from "@/components/features/user-menu";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/lib/auth-context";

interface Pool {
  id: number;
  product: string;
  currentVolume: number;
  targetVolume: number;
  retailPrice: number;
  currentPrice: number;
  endsIn: string;
  image: string;
}

const mockPools: Pool[] = [
  {
    id: 1,
    product: "Industrial Steel",
    currentVolume: 400,
    targetVolume: 1000,
    retailPrice: 60,
    currentPrice: 55,
    endsIn: "4 hours",
    image: "🏭",
  },
  {
    id: 2,
    product: "Aluminum Sheets",
    currentVolume: 750,
    targetVolume: 1500,
    retailPrice: 45,
    currentPrice: 40,
    endsIn: "2 hours",
    image: "🔩",
  },
  {
    id: 3,
    product: "Copper Wire",
    currentVolume: 200,
    targetVolume: 500,
    retailPrice: 85,
    currentPrice: 78,
    endsIn: "6 hours",
    image: "⚡",
  },
  {
    id: 4,
    product: "Rubber Sheets",
    currentVolume: 600,
    targetVolume: 1200,
    retailPrice: 35,
    currentPrice: 30,
    endsIn: "3 hours",
    image: "📦",
  },
];

function BuyerDashboardContent() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPools = mockPools.filter((pool) =>
    pool.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            BulkBuddy
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4 items-center">
            <Link
              href="/"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50"
            >
              Home
            </Link>
            <UserMenu />
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-4">
            <Link
              href="/"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50"
            >
              Home
            </Link>
            <button className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition">
              Logout
            </button>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Location Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5 text-blue-900 dark:text-blue-400" />
              <h3 className="font-semibold text-slate-950 dark:text-slate-50">
                Your Location
              </h3>
            </div>
            <p className="text-2xl font-bold text-slate-950 dark:text-slate-50">
              Pune MIDC
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Industrial Hub Zone
            </p>
          </div>

          {/* Wallet Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-slate-950 dark:text-slate-50">
                Wallet Balance
              </h3>
            </div>
            <p className="text-2xl font-bold text-slate-950 dark:text-slate-50">
              ₹2,50,000
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Ready to spend
            </p>
          </div>
        </div>

        {/* Map - Nearby Businesses */}
        <div className="mb-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-900 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-slate-950 dark:text-slate-50">
                Nearby Businesses
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Find and connect with suppliers around you. Click on markers to view business details and start group buying pools.
            </p>
          </div>
          <BusinessLocationMap height="500px" />
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-600 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Active Pools Header */}
        <h2 className="text-2xl font-bold mb-6 text-slate-950 dark:text-slate-50">
          Active Pools Near You
        </h2>

        {/* Pools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPools.map((pool) => (
            <Link key={pool.id} href={`/pool/${pool.id}`}>
              <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-lg dark:hover:shadow-xl transition cursor-pointer h-full flex flex-col">
                {/* Pool Header with Image */}
                <div className="bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900 dark:to-emerald-900 h-32 flex items-center justify-center text-5xl">
                  {pool.image}
                </div>

                {/* Pool Details */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-950 dark:text-slate-50 mb-4">
                    {pool.product}
                  </h3>

                  {/* Volume Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                      <span>Volume</span>
                      <span className="font-semibold">
                        {pool.currentVolume}/{pool.targetVolume}kg
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all"
                        style={{
                          width: `${(pool.currentVolume / pool.targetVolume) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Retail Price
                      </span>
                      <span className="text-sm line-through text-slate-500 dark:text-slate-500">
                        ₹{pool.retailPrice}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                        Current Price
                      </span>
                      <span className="text-lg font-bold price-highlight text-blue-900 dark:text-blue-400">
                        ₹{pool.currentPrice}
                      </span>
                    </div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                      Save ₹{pool.retailPrice - pool.currentPrice} per kg
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm mb-4">
                    <Clock className="w-4 h-4" />
                    Ending in {pool.endsIn}
                  </div>

                  {/* CTA Button */}
                  <button className="w-full mt-auto bg-blue-900 dark:bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-800 dark:hover:bg-blue-500 transition">
                    View Pool
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredPools.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              No pools found matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BuyerDashboard() {
  return (
    <ProtectedRoute requiredUserType="buyer">
      <BuyerDashboardContent />
    </ProtectedRoute>
  );
}
