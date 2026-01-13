"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Plus,
  TrendingUp,
  Package,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { UserMenu } from "@/components/features/user-menu";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/lib/auth-context";

interface Deal {
  id: number;
  product: string;
  basePrice: number;
  tiers: { volume: number; discount: number }[];
  status: "active" | "pending" | "completed";
  createdAt: string;
}

interface Order {
  id: number;
  poolId: number;
  product: string;
  totalVolume: number;
  totalAmount: number;
  participantsCount: number;
  status: "ready" | "dispatched" | "delivered";
  dispatchDate?: string;
}

const mockDeals: Deal[] = [
  {
    id: 1,
    product: "Industrial Steel",
    basePrice: 60,
    tiers: [
      { volume: 500, discount: 5 },
      { volume: 1000, discount: 8 },
      { volume: 1500, discount: 12 },
    ],
    status: "active",
    createdAt: "2026-01-10",
  },
  {
    id: 2,
    product: "Aluminum Sheets",
    basePrice: 45,
    tiers: [
      { volume: 750, discount: 4 },
      { volume: 1500, discount: 7 },
    ],
    status: "active",
    createdAt: "2026-01-08",
  },
];

const mockOrders: Order[] = [
  {
    id: 1,
    poolId: 1,
    product: "Industrial Steel",
    totalVolume: 1200,
    totalAmount: 66000,
    participantsCount: 24,
    status: "ready",
  },
  {
    id: 2,
    poolId: 2,
    product: "Aluminum Sheets",
    totalVolume: 950,
    totalAmount: 39900,
    participantsCount: 18,
    status: "dispatched",
    dispatchDate: "2026-01-12",
  },
];

function SupplierDashboardContent() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [expandedDeal, setExpandedDeal] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    product: "",
    basePrice: "",
    tier1Volume: "",
    tier1Discount: "",
    tier2Volume: "",
    tier2Discount: "",
  });

  const totalSales = deals.reduce((sum, deal) => {
    return sum + deal.basePrice * 100;
  }, 0);

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const newDeal: Deal = {
      id: deals.length + 1,
      product: formData.product,
      basePrice: parseFloat(formData.basePrice),
      tiers: [
        {
          volume: parseInt(formData.tier1Volume),
          discount: parseInt(formData.tier1Discount),
        },
        formData.tier2Volume && formData.tier2Discount
          ? {
              volume: parseInt(formData.tier2Volume),
              discount: parseInt(formData.tier2Discount),
            }
          : { volume: 0, discount: 0 },
      ].filter((t) => t.volume > 0),
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setDeals([...deals, newDeal]);
    setFormData({
      product: "",
      basePrice: "",
      tier1Volume: "",
      tier1Discount: "",
      tier2Volume: "",
      tier2Discount: "",
    });
    setShowCreateForm(false);
  };

  const handleDeleteDeal = (id: number) => {
    setDeals(deals.filter((deal) => deal.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            BulkBuddy Supplier
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
            <UserMenu />
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Sales */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-slate-600 dark:text-slate-400">
                Total Sales
              </h3>
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-3xl md:text-4xl font-bold text-slate-950 dark:text-slate-50">
              ₹{totalSales.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              This month
            </p>
          </div>

          {/* Active Deals */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-slate-600 dark:text-slate-400">
                Active Deals
              </h3>
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl md:text-4xl font-bold text-slate-950 dark:text-slate-50">
              {deals.filter((d) => d.status === "active").length}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              Running pools
            </p>
          </div>

          {/* Pending Deliveries */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-slate-600 dark:text-slate-400">
                Pending Deliveries
              </h3>
              <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-3xl md:text-4xl font-bold text-slate-950 dark:text-slate-50">
              {mockOrders.filter((o) => o.status === "ready").length}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              Ready to ship
            </p>
          </div>
        </div>

        {/* Create Deal Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-slate-950 dark:text-slate-50">
              Create Deal
            </h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-3 rounded-lg bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 transition flex items-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              New Deal
            </button>
          </div>

          {showCreateForm && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 mb-8">
              <form onSubmit={handleCreateDeal} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-950 dark:text-slate-50 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.product}
                    onChange={(e) =>
                      setFormData({ ...formData, product: e.target.value })
                    }
                    placeholder="e.g., Industrial Steel"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-950 dark:text-slate-50 mb-2">
                    Base Price (per kg)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-slate-600 dark:text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      value={formData.basePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, basePrice: e.target.value })
                      }
                      placeholder="60"
                      className="w-full pl-8 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-950 dark:text-slate-50 mb-3">
                      Tier 1
                    </h4>
                    <input
                      type="number"
                      required
                      value={formData.tier1Volume}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tier1Volume: e.target.value,
                        })
                      }
                      placeholder="Volume (kg)"
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-400"
                    />
                    <input
                      type="number"
                      required
                      value={formData.tier1Discount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tier1Discount: e.target.value,
                        })
                      }
                      placeholder="Discount %"
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-950 dark:text-slate-50 mb-3">
                      Tier 2 (Optional)
                    </h4>
                    <input
                      type="number"
                      value={formData.tier2Volume}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tier2Volume: e.target.value,
                        })
                      }
                      placeholder="Volume (kg)"
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-400"
                    />
                    <input
                      type="number"
                      value={formData.tier2Discount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tier2Discount: e.target.value,
                        })
                      }
                      placeholder="Discount %"
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-400"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-lg bg-blue-900 dark:bg-blue-600 text-white font-bold hover:bg-blue-800 dark:hover:bg-blue-500 transition"
                  >
                    Create Deal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 py-3 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-950 dark:text-slate-50 font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Active Deals Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-950 dark:text-slate-50 mb-6">
            Your Deals
          </h2>
          <div className="space-y-4">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedDeal(
                      expandedDeal === deal.id ? null : deal.id
                    )
                  }
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-slate-950 dark:text-slate-50">
                      {deal.product}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Base Price: ₹{deal.basePrice} • {deal.tiers.length} tiers
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                      {deal.status}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 transition ${
                        expandedDeal === deal.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {expandedDeal === deal.id && (
                  <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-800">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-950 dark:text-slate-50 mb-3">
                          Price Tiers
                        </h4>
                        <div className="space-y-2">
                          {deal.tiers.map((tier, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-lg"
                            >
                              <span className="text-slate-600 dark:text-slate-400">
                                Tier {idx + 1}: {tier.volume}kg
                              </span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                -{tier.discount}% (₹
                                {(deal.basePrice * (1 - tier.discount / 100)).toFixed(2)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button className="flex-1 py-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-400 font-semibold hover:bg-blue-200 dark:hover:bg-blue-800 transition flex items-center justify-center gap-2">
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDeal(deal.id)}
                          className="flex-1 py-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-400 font-semibold hover:bg-red-200 dark:hover:bg-red-800 transition flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Orders Ready for Dispatch */}
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-slate-50 mb-6">
            Orders Ready for Dispatch
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-950 dark:text-slate-50">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-950 dark:text-slate-50">
                    Volume
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-950 dark:text-slate-50">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-950 dark:text-slate-50">
                    Participants
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-950 dark:text-slate-50">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <td className="px-6 py-4 text-slate-950 dark:text-slate-50 font-semibold">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {order.totalVolume}kg
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-bold">
                      ₹{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {order.participantsCount} businesses
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          order.status === "ready"
                            ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400"
                            : order.status === "dispatched"
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400"
                              : "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400"
                        }`}
                      >
                        {order.status === "ready" && (
                          <>
                            <Package className="w-3 h-3 inline mr-1" />
                            Ready
                          </>
                        )}
                        {order.status === "dispatched" && (
                          <>
                            <Clock className="w-3 h-3 inline mr-1" />
                            In Transit
                          </>
                        )}
                        {order.status === "delivered" && (
                          <>
                            <Package className="w-3 h-3 inline mr-1" />
                            Delivered
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SupplierDashboard() {
  return (
    <ProtectedRoute requiredUserType="supplier">
      <SupplierDashboardContent />
    </ProtectedRoute>
  );
}
