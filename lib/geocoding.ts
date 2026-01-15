'use server'

type GeocodeResult = { lat: number; lng: number } | null

const inMemoryCache = new Map<string, GeocodeResult>()

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

export async function geocodeApproxLocation(input: {
  city?: string | null
  state?: string | null
  country?: string | null
}) {
  const city = input.city?.trim() || ""
  const state = input.state?.trim() || ""
  const country = input.country?.trim() || ""

  const query = [city, state, country].filter(Boolean).join(", ")
  if (!query) return null

  const cacheKey = normalizeKey(query)
  if (inMemoryCache.has(cacheKey)) return inMemoryCache.get(cacheKey) ?? null

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search")
    url.searchParams.set("format", "json")
    url.searchParams.set("limit", "1")
    url.searchParams.set("q", query)

    const res = await fetch(url, {
      headers: {
        // Nominatim requires a valid User-Agent.
        "User-Agent": process.env.NOMINATIM_USER_AGENT ?? "BulkBuddy/0.1 (dev)",
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      inMemoryCache.set(cacheKey, null)
      return null
    }

    const data = (await res.json()) as Array<{ lat?: string; lon?: string }>
    const first = data?.[0]
    const lat = first?.lat ? Number.parseFloat(first.lat) : Number.NaN
    const lng = first?.lon ? Number.parseFloat(first.lon) : Number.NaN

    const result = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
    inMemoryCache.set(cacheKey, result)
    return result
  } catch {
    inMemoryCache.set(cacheKey, null)
    return null
  }
}
