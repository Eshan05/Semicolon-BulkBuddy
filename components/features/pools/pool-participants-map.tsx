"use client";

import { Map, MapCircleMarker, MapPopup, MapTileLayer, MapZoomControl } from "@/components/ui/map";

export type PoolMapMarker = {
  id: string;
  type: "buyer" | "supplier";
  lat: number;
  lng: number;
  title: string;
  subtitle?: string | null;
};

const colors: Record<PoolMapMarker["type"], { stroke: string; fill: string }> = {
  buyer: { stroke: "#2563eb", fill: "#2563eb" },
  supplier: { stroke: "#16a34a", fill: "#16a34a" },
};

function computeCenter(markers: PoolMapMarker[]): [number, number] {
  if (!markers.length) return [0, 0];
  const lat = markers.reduce((acc, m) => acc + m.lat, 0) / markers.length;
  const lng = markers.reduce((acc, m) => acc + m.lng, 0) / markers.length;
  return [lat, lng];
}

export function PoolParticipantsMap({ markers }: { markers: PoolMapMarker[] }) {
  if (!markers.length) {
    return (
      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium">Map</p>
        <p className="mt-1 text-sm text-muted-foreground">No mappable participants yet.</p>
      </div>
    );
  }

  const center = computeCenter(markers);

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="p-4 border-b">
        <p className="text-sm font-medium">Map</p>
        <p className="text-xs text-muted-foreground">Buyers and suppliers (approximate)</p>
      </div>
      <div className="h-112">
        <Map center={center} zoom={5} scrollWheelZoom={false}>
          <MapTileLayer name="Default" />
          <MapZoomControl className="bottom-2 right-2 top-auto left-auto" />
          {markers.map((m) => {
            const c = colors[m.type];
            return (
              <MapCircleMarker
                key={m.id}
                center={[m.lat, m.lng]}
                radius={10}
                pathOptions={{ color: c.stroke, fillColor: c.fill, fillOpacity: 0.5 }}
              >
                <MapPopup>
                  <div className="text-sm font-medium">{m.title}</div>
                  {m.subtitle ? <div className="text-xs text-muted-foreground">{m.subtitle}</div> : null}
                  <div className="mt-1 text-xs text-muted-foreground capitalize">{m.type}</div>
                </MapPopup>
              </MapCircleMarker>
            );
          })}
        </Map>
      </div>
    </div>
  );
}
