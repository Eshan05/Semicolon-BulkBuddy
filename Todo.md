# BulkBuddy MVP – Status

## Shipped / Working

### Pools
- Dynamic pricing tiers + live pool room refresh
- Buyer join flow (supports overflow split)
- Pool chat (buyers + suppliers who submitted offers)
- Anonymous pool participation (reveals once pool locks; owner/admin/self can always see)
- Supplier offers (submit/update) + buyer-side comparison table
- Offer selection (pool owner/admin can accept one offer; others become rejected)
- Post-pool vibe check (opens when pool locks) + aggregate stats on pool room
- Location filtering on dashboards (country/state/city/all)
- Pool room map (buyers + suppliers with coordinates)
- One-click pool sharing (copy link + QR + WhatsApp) + referral tag support
- Oversubscription-aware supplier selection (partial accept + notify other suppliers)
- Participant spec notes (for spec mismatch transparency)
- Pool room “Contact support” (DM to admin)
- Supplier offer auto-comparison enhancements (best-bid badge, savings delta)

### UX
- Sidebar navigation fixed (tooltip/link composition)
- Default dialogs are larger (Dialog/Credenza feel less cramped)
- Key pool forms have loading states + success/error toasts
- Dev-mode quick-fill defaults for faster manual testing

### Profiles
- Public company profile page
- Basic Trust Score + badges (MVP heuristics)
- Profile map (company location when coordinates available)
- Join streak + referral counts on profile

## In Progress / Next

### Product
- Payment/finalization flow after selecting supplier
- Daily/weekly pool challenges
- Better spec compatibility (AI-assisted matching + suggested pool split)
- Supplier bid comparison v2 (filters, lead-time fields, export)
- Anonymous reveal controls (explicit reveal button, staged reveal)
- Collusion/anomaly detection (heuristics + audit review)

### Testing
- Expand Bun unit coverage beyond pricing (actions, messaging utilities, trust score logic)
- Add Playwright signed-in flows:
  - Sign up → onboarding → create pool → join pool → chat
  - Supplier: find pool → submit offer → chat
  - Admin: verify company → audit logs
- Keep Playwright smoke test always-on (home loads)

## How To Run

### Unit tests
- `bun test`
- `bun test tests/unit`

### E2E tests (Playwright)
- `bunx playwright install` (first time)
- `bunx playwright test`

### DB migrations
- `bun run db:migrate`
