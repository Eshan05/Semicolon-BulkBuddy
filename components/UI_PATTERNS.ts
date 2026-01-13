/**
 * BulkBuddy UI Component Patterns
 * 
 * This file documents reusable component patterns used throughout the app
 */

// ============================================================================
// STAT CARD COMPONENT PATTERN
// ============================================================================
/*
<div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
  <div className="flex items-start justify-between mb-4">
    <h3 className="font-semibold text-slate-600 dark:text-slate-400">
      Stat Title
    </h3>
    <IconComponent className="w-5 h-5 text-color-600 dark:text-color-400" />
  </div>
  <p className="text-3xl md:text-4xl font-bold text-slate-950 dark:text-slate-50">
    Value
  </p>
  <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
    Subtitle
  </p>
</div>
*/

// ============================================================================
// PRICE DISPLAY PATTERN
// ============================================================================
/*
<div className="space-y-2">
  <div className="flex justify-between items-center">
    <span className="text-sm text-slate-600 dark:text-slate-400">
      Retail Price
    </span>
    <span className="text-sm line-through text-slate-500">
      ₹{price}
    </span>
  </div>
  <div className="flex justify-between items-center">
    <span className="text-sm font-semibold text-slate-950 dark:text-slate-50">
      Current Price
    </span>
    <span className="text-lg font-bold text-blue-900 dark:text-blue-400">
      ₹{currentPrice}
    </span>
  </div>
  <div className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
    Save ₹{savings} per kg
  </div>
</div>
*/

// ============================================================================
// PROGRESS BAR PATTERN
// ============================================================================
/*
<div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
  <div
    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400 transition-all duration-500"
    style={{ width: `${percentage}%` }}
  />
</div>
*/

// ============================================================================
// BUTTON PATTERNS
// ============================================================================

// Primary Action Button
/*
<button className="px-6 py-3 rounded-lg bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 transition font-bold">
  Action Text
</button>
*/

// Secondary Button
/*
<button className="px-6 py-3 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-950 dark:text-slate-50 hover:bg-slate-300 dark:hover:bg-slate-700 transition font-bold">
  Action Text
</button>
*/

// Ghost/Outline Button
/*
<button className="px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-bold">
  Action Text
</button>
*/

// ============================================================================
// INPUT FIELD PATTERN
// ============================================================================
/*
<div className="relative">
  <IconComponent className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-600" />
  <input
    type="text"
    placeholder="Placeholder text"
    className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-400"
  />
</div>
*/

// ============================================================================
// STATUS BADGE PATTERNS
// ============================================================================

// Active Badge (Green/Emerald)
/*
<span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
  Active
</span>
*/

// Pending Badge (Amber/Orange)
/*
<span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400 text-sm font-semibold">
  Pending
</span>
*/

// Completed Badge (Blue)
/*
<span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400 text-sm font-semibold">
  Completed
</span>
*/

// ============================================================================
// CARD WITH ICON PATTERN
// ============================================================================
/*
<div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg dark:hover:shadow-xl transition cursor-pointer">
  <div className="h-32 bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900 dark:to-emerald-900 rounded-lg flex items-center justify-center text-5xl mb-4">
    🏭
  </div>
  <h3 className="text-xl font-bold text-slate-950 dark:text-slate-50 mb-3">
    Card Title
  </h3>
  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
    Description text
  </p>
  <button className="w-full py-3 rounded-lg bg-blue-900 dark:bg-blue-600 text-white font-bold hover:bg-blue-800 dark:hover:bg-blue-500 transition">
    Action
  </button>
</div>
*/

// ============================================================================
// EXPANDABLE SECTION PATTERN
// ============================================================================
/*
<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
  <button
    onClick={() => setExpanded(!expanded)}
    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition"
  >
    <div className="flex-1 text-left">
      <h3 className="text-lg font-bold text-slate-950 dark:text-slate-50">
        Title
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Subtitle
      </p>
    </div>
    <ChevronDown
      className={`w-5 h-5 transition ${expanded ? "rotate-180" : ""}`}
    />
  </button>
  
  {expanded && (
    <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-800">
      Content here
    </div>
  )}
</div>
*/

// ============================================================================
// AVATAR COMPONENT PATTERN
// ============================================================================
/*
<div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-400 text-white flex items-center justify-center font-bold">
  A
</div>
*/

// ============================================================================
// EMPTY STATE PATTERN
// ============================================================================
/*
<div className="text-center py-16">
  <div className="text-4xl mb-4">📭</div>
  <p className="text-slate-600 dark:text-slate-400 text-lg font-semibold">
    No items found
  </p>
  <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
    Create your first item to get started
  </p>
</div>
*/

// ============================================================================
// STICKY SIDEBAR PATTERN
// ============================================================================
/*
<div className="sticky top-24 lg:top-32">
  <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800">
    Content here
  </div>
</div>
*/

// ============================================================================
// RESPONSIVE GRID PATTERNS
// ============================================================================

// Two Column Grid
/*
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {items.map(item => (
    <div key={item.id}>Item</div>
  ))}
</div>
*/

// Three Column Grid
/*
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id}>Item</div>
  ))}
</div>
*/

// ============================================================================
// NAVIGATION HEADER PATTERN
// ============================================================================
/*
<header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
    <div className="text-2xl font-bold text-blue-900 dark:text-blue-400">
      BulkBuddy
    </div>
    <nav className="hidden md:flex gap-6">
      <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50">
        Home
      </Link>
    </nav>
  </div>
</header>
*/

// ============================================================================
// FORM LAYOUT PATTERN
// ============================================================================
/*
<form onSubmit={handleSubmit} className="space-y-6">
  <div>
    <label className="block text-sm font-semibold text-slate-950 dark:text-slate-50 mb-2">
      Field Label
    </label>
    <input
      type="text"
      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-400"
    />
  </div>
  
  <button
    type="submit"
    className="w-full py-3 rounded-lg bg-blue-900 dark:bg-blue-600 text-white font-bold hover:bg-blue-800 dark:hover:bg-blue-500 transition"
  >
    Submit
  </button>
</form>
*/

export const UIPatterns = "Reusable component patterns for BulkBuddy";
