This folder contains the backend (domain + data + services) implemented **inside Next.js**.

Layers:
- `routes` (Next.js Route Handlers) → `controllers` → `services` → `domain` → `data`

Rules:
- No business logic in `app/api/**/route.ts`
- Zod validation at the boundary
- Prisma transactions for anything that moves money/prices
