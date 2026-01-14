'use client';

import { GoogleMap, LoadScript, MarkerF, InfoWindowF, useJsApiLoader } from '@react-google-maps/api';
import { useState, useCallback, useEffect } from 'react';
import { MapPin, Phone, Mail, Star } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  email: string;
  rating: number;
  products: string[];
}

interface BusinessLocationMapProps {
  businesses?: Business[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
}

const DEFAULT_BUSINESSES: Business[] = [
  {
    id: '1',
    name: 'Premier Steel Supplies',
    category: 'Steel & Metals',
    lat: 28.7041,
    lng: 77.1025,
    address: '123 Industrial Park, New Delhi',
    phone: '+91-11-1234-5678',
    email: 'sales@premierssteel.com',
    rating: 4.5,
    products: ['Steel sheets', 'Aluminum coils', 'Copper rods'],
  },
  {
    id: '2',
    name: 'GreenTech Packaging',
    category: 'Packaging Materials',
    lat: 28.6139,
    lng: 77.2090,
    address: '456 Tech Avenue, New Delhi',
    phone: '+91-11-2345-6789',
    email: 'info@greentech.com',
    rating: 4.2,
    products: ['Cardboard boxes', 'Plastic films', 'Bubble wrap'],
  },
  {
    id: '3',
    name: 'FastMove Logistics',
    category: 'Shipping & Logistics',
    lat: 28.5355,
    lng: 77.3910,
    address: '789 Commerce Hub, New Delhi',
    phone: '+91-11-3456-7890',
    email: 'logistics@fastmove.com',
    rating: 4.7,
    products: ['Warehouse storage', 'Distribution', 'Last-mile delivery'],
  },
  {
    id: '4',
    name: 'ChemCore Industries',
    category: 'Chemicals & Additives',
    lat: 28.4595,
    lng: 77.0266,
    address: '321 Manufacturing Blvd, Noida',
    phone: '+91-120-4567-8901',
    email: 'sales@chemcore.com',
    rating: 4.3,
    products: ['Industrial chemicals', 'Processing aids', 'Quality additives'],
  },
];

export function BusinessLocationMap({
  businesses = DEFAULT_BUSINESSES,
  center = { lat: 28.6139, lng: 77.209 },
  zoom = 12,
  height = '500px',
}: BusinessLocationMapProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState(center);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  // Get user's location on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setMapCenter({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Keep default center if geolocation fails
        }
      );
    }
  }, []);

  const containerStyle = {
    width: '100%',
    height: height,
    borderRadius: '0.5rem',
  };

  const handleMarkerClick = useCallback((businessId: string) => {
    setSelectedBusiness(businessId);
  }, []);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    return (
      <div className="w-full rounded-lg border-2 border-dashed border-amber-200 bg-amber-50 dark:bg-amber-950 p-6 flex items-center justify-center gap-3">
        <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="font-semibold text-amber-900 dark:text-amber-100">
            Google Maps API Key Required
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-200">
            Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-96 flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={zoom}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'poi.business',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        }}
      >
        {/* User location marker */}
        {userLocation && (
          <MarkerF
            position={userLocation}
            icon={{
              path: 'M12,2C6.48,2 2,6.48 2,12C2,17.52 12,22 12,22C12,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,15C10.34,15 9,13.66 9,12C9,10.34 10.34,9 12,9C13.66,9 15,10.34 15,12C15,13.66 13.66,15 12,15Z',
              scale: 1.5,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
            title="Your Location"
          />
        )}

        {/* Business markers */}
        {businesses.map((business) => (
          <MarkerF
            key={business.id}
            position={{ lat: business.lat, lng: business.lng }}
            onClick={() => handleMarkerClick(business.id)}
            title={business.name}
            icon={{
              url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23059669" width="40" height="40"%3E%3Cpath d="M12 2C7.6 2 4 5.6 4 10c0 5.3 8 12 8 12s8-6.7 8-12c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/%3E%3C/svg%3E',
              scaledSize: (typeof google !== 'undefined' && google.maps) 
                ? new google.maps.Size(40, 40) 
                : ({ width: 40, height: 40 } as any),
            }}
          >
            {selectedBusiness === business.id && (
              <InfoWindowF onCloseClick={() => setSelectedBusiness(null)}>
                <div className="max-w-xs p-3 text-slate-950">
                  <h3 className="font-bold text-base mb-1">{business.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold">{business.rating}</span>
                    <span className="text-xs text-slate-600">({business.category})</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                      <p className="text-slate-700">{business.address}</p>
                    </div>

                    <div className="flex gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                      <a href={`tel:${business.phone}`} className="text-emerald-600 hover:underline">
                        {business.phone}
                      </a>
                    </div>

                    <div className="flex gap-2">
                      <Mail className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                      <a href={`mailto:${business.email}`} className="text-emerald-600 hover:underline">
                        {business.email}
                      </a>
                    </div>

                    {business.products.length > 0 && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-xs font-semibold text-slate-600 mb-1">Products:</p>
                        <div className="flex flex-wrap gap-1">
                          {business.products.map((product) => (
                            <span
                              key={product}
                              className="inline-block bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded"
                            >
                              {product}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 rounded transition-colors">
                    Start Group
                  </button>
                </div>
              </InfoWindowF>
            )}
          </MarkerF>
        ))}
      </GoogleMap>
    </div>
  );
}
