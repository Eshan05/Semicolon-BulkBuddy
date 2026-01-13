"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  TrendingDown,
  Users as UsersIcon,
  Zap,
} from "lucide-react";

export default function PoolDetail({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState("");
  const [joined, setJoined] = useState(false);

  // Mock data
  const pool = {
    id: params.id,
    product: "Industrial Steel",
    retailPrice: 60,
    currentPrice: 55,
    nextTierPrice: 50,
    nextTierVolume: 1000,
    currentVolume: 400,
    targetVolume: 1500,
    image: "🏭",
    description: "High-grade cold rolled steel sheets for industrial applications",
    specification: "Thickness: 2mm, Width: 1000mm, Grade: CR COIL A",
    supplier: "Premium Steel Co.",
    participantsCount: 24,
    participants: [
      { id: 1, name: "Factory A", quantity: 50 },
      { id: 2, name: "Factory B", quantity: 75 },
      { id: 3, name: "Workshop C", quantity: 30 },
      { id: 4, name: "Manufacturing D", quantity: 100 },
      { id: 5, name: "Industrial E", quantity: 45 },
    ],
  };

  const handleJoinPool = () => {
    if (quantity && parseInt(quantity) > 0) {
      setJoined(true);
    }
  };

  const volumePercentage = (pool.currentVolume / pool.targetVolume) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/buyer-dashboard" className="flex items-center gap-2 text-blue-900 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold">
            <ArrowLeft className="w-5 h-5" />
            Back to Pools
          </Link>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            BulkBuddy
          </div>
          <div className="w-24" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Header */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 md:p-8 mb-8 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Product Image */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900 dark:to-emerald-900 flex items-center justify-center text-6xl md:text-7xl">
                {pool.image}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-950 dark:text-slate-50 mb-2">
                {pool.product}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-4 text-lg">
                {pool.description}
              </p>
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold">Specification:</span>{" "}
                  {pool.specification}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold">Supplier:</span>{" "}
                  {pool.supplier}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Price Tracker */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-slate-950 dark:text-slate-50 mb-6">
                Dynamic Price Tracker
              </h2>

              {/* Volume Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                    Pool Progress
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round(volumePercentage)}%
                  </span>
                </div>
                <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400 transition-all duration-500"
                    style={{ width: `${volumePercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mt-2">
                  <span>{pool.currentVolume}kg</span>
                  <span>{pool.targetVolume}kg</span>
                </div>
              </div>

              {/* Price Tiers */}
              <div className="grid grid-cols-3 gap-4">
                {/* Retail Price */}
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-center">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    Retail Price
                  </p>
                  <p className="text-2xl font-bold line-through text-slate-500 dark:text-slate-500">
                    ₹{pool.retailPrice}
                  </p>
                </div>

                {/* Current Price */}
                <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4 text-center border-2 border-blue-600 dark:border-blue-400">
                  <p className="text-xs text-blue-900 dark:text-blue-300 font-semibold mb-2">
                    Current Price
                  </p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-400">
                    ₹{pool.currentPrice}
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                    Save ₹{pool.retailPrice - pool.currentPrice}
                  </p>
                </div>

                {/* Next Tier Price */}
                <div className="bg-emerald-100 dark:bg-emerald-900 rounded-lg p-4 text-center">
                  <p className="text-xs text-emerald-900 dark:text-emerald-300 font-semibold mb-2">
                    Next Tier
                  </p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                    ₹{pool.nextTierPrice}
                  </p>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                    @ {pool.nextTierVolume}kg
                  </p>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <UsersIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-2xl font-bold text-slate-950 dark:text-slate-50">
                  Pool Participants ({pool.participantsCount})
                </h2>
              </div>

              <div className="space-y-3">
                {pool.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-400 text-white flex items-center justify-center font-bold">
                        {participant.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-950 dark:text-slate-50">
                        {participant.name}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {participant.quantity}kg
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                +{pool.participantsCount - pool.participants.length} more businesses
              </p>
            </div>
          </div>

          {/* Sidebar - Join Pool (Sticky on Mobile) */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 sticky top-24 lg:top-32">
              {!joined ? (
                <>
                  <h3 className="text-2xl font-bold text-slate-950 dark:text-slate-50 mb-6">
                    Join This Pool
                  </h3>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-950 dark:text-slate-50 mb-3">
                      Quantity Required (kg)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 100"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-400"
                    />
                  </div>

                  {quantity && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Estimated Cost at Current Price:
                      </p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-400">
                        ₹{(parseInt(quantity) * pool.currentPrice).toLocaleString()}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleJoinPool}
                    disabled={!quantity || parseInt(quantity) <= 0}
                    className="w-full py-4 rounded-lg bg-blue-900 dark:bg-blue-600 text-white font-bold text-lg hover:bg-blue-800 dark:hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-5 h-5 inline mr-2" />
                    Join Pool Now
                  </button>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-4 text-center">
                    Delivery in 5-7 business days
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                    Joined Successfully!
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    You've joined with {quantity}kg
                  </p>
                  <button
                    onClick={() => setJoined(false)}
                    className="w-full py-3 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-950 dark:text-slate-50 font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}

              {/* Info Cards */}
              <div className="mt-8 space-y-4 pt-8 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    MINIMUM ORDER
                  </p>
                  <p className="font-bold text-slate-950 dark:text-slate-50">
                    50kg
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    PAYMENT METHOD
                  </p>
                  <p className="font-bold text-slate-950 dark:text-slate-50">
                    Online / Bank Transfer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
