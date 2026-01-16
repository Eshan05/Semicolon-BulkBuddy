"use client";

import { Map, MapCircleMarker, MapPopup, MapTileLayer, MapZoomControl } from "@/components/ui/map";

type Props = {
  lat: number | null;
  lng: number | null;
  label: string;
  locationLabel: string;
};

export function CompanyLocationMap({ lat, lng, label, locationLabel }: Props) {
  if (lat == null || lng == null) {
    return (
      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium">Map</p>
        <p className="mt-1 text-sm text-muted-foreground">Location coordinates not available yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="p-4 border-b">
        <p className="text-sm font-medium">Map</p>
        <p className="text-xs text-muted-foreground">{locationLabel}</p>
      </div>
      <div className="h-80">
        <Map center={[lat, lng]} zoom={10} scrollWheelZoom={false}>
          <MapTileLayer name="Default" />
          <MapZoomControl className="bottom-2 right-2 top-auto left-auto" />
          <MapCircleMarker center={[lat, lng]} radius={10} pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.6 }}>
            <MapPopup>
              <div className="text-sm font-medium">{label}</div>
              <div className="text-xs text-muted-foreground">{locationLabel}</div>
            </MapPopup>
          </MapCircleMarker>
        </Map>
      </div>
    </div>
  );
}
