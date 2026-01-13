# Google Maps Integration Setup

## Overview
The BulkBuddy application now includes an interactive Google Maps component that displays nearby businesses and suppliers. This allows buyers to visually locate and connect with suppliers in their area.

## Features
- **Interactive Map Display**: View nearby businesses on an interactive map
- **Business Markers**: Color-coded markers for different supplier locations
- **Info Windows**: Click on markers to view detailed business information
  - Business name and rating
  - Category
  - Address, phone, and email
  - Products/services offered
- **Geolocation**: Automatically detects user's current location
- **User Location Marker**: Blue circle marker showing your position
- **Dark Mode Support**: Map respects system dark mode preference

## Setup Instructions

### 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Maps Static API
   - Places API

4. Create an API Key:
   - Go to **Credentials** → **Create Credentials** → **API Key**
   - Copy the generated API key

### 2. Add to Environment Variables

Create a `.env.local` file in the project root (same level as `package.json`):

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

**Important**: The variable must start with `NEXT_PUBLIC_` to be accessible in the browser.

### 3. Secure Your API Key

To prevent unauthorized usage:

1. In Google Cloud Console, go to your API Key settings
2. Add **Application Restrictions**:
   - Select "HTTP referrers (web sites)"
   - Add your domain: `localhost:3000` (for development)
   - Add your production domain when deploying

3. Add **API Restrictions**:
   - Restrict to Maps JavaScript API

### 4. Test the Integration

1. Restart the development server:
   ```bash
   npm run dev
   ```

2. Navigate to **Buyer Dashboard** (`/buyer-dashboard`)
3. Scroll to the "Nearby Businesses" section
4. The map should load with mock business markers

## Component Usage

### Basic Usage
```tsx
import { BusinessLocationMap } from "@/components/visuals/business-location-map";

// Use with default mock data
<BusinessLocationMap />

// Use with custom center and zoom
<BusinessLocationMap 
  center={{ lat: 28.6139, lng: 77.209 }}
  zoom={13}
  height="600px"
/>

// Use with custom businesses
const businesses = [
  {
    id: '1',
    name: 'Your Business',
    category: 'Steel & Metals',
    lat: 28.7041,
    lng: 77.1025,
    address: '123 Street, City',
    phone: '+91-xxx-xxxx',
    email: 'contact@business.com',
    rating: 4.5,
    products: ['Product 1', 'Product 2']
  }
];

<BusinessLocationMap businesses={businesses} />
```

### Props
- `businesses?`: Array of Business objects (uses default mock data if not provided)
- `center?`: Map center coordinates `{ lat: number; lng: number }`
- `zoom?`: Initial zoom level (default: 12)
- `height?`: Map container height (default: "500px")

## Mock Data

The component includes 4 sample businesses for demonstration:
1. **Premier Steel Supplies** - Steel & Metals
2. **GreenTech Packaging** - Packaging Materials
3. **FastMove Logistics** - Shipping & Logistics
4. **ChemCore Industries** - Chemicals & Additives

## Connecting to Real Data

To use real business data:

1. **Create API endpoint** to fetch businesses from database:
   ```tsx
   // app/api/businesses/route.ts
   export async function GET() {
     const businesses = await db.businesses.findAll();
     return Response.json(businesses);
   }
   ```

2. **Update BusinessLocationMap** to fetch data:
   ```tsx
   const [businesses, setBusinesses] = useState([]);
   
   useEffect(() => {
     fetch('/api/businesses')
       .then(res => res.json())
       .then(data => setBusinesses(data));
   }, []);
   ```

3. **Pass to component**:
   ```tsx
   <BusinessLocationMap businesses={businesses} />
   ```

## Troubleshooting

### Map Not Loading
- Check that `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is in `.env.local`
- Verify the API key is correct and active
- Check browser console for API errors
- Ensure Maps JavaScript API is enabled in Cloud Console

### "Geolocation not available"
- Works best with HTTPS or localhost
- User must grant location permission
- Some browsers restrict geolocation in private mode

### Markers Not Appearing
- Ensure business data has valid `lat` and `lng` coordinates
- Check that the map is properly centered
- Verify zoom level isn't too high or too low

### Styling Issues
- Map respects Tailwind dark mode classes
- Custom styling can be added via `mapContainerStyle` prop

## Dependencies

- `@react-google-maps/api`: React wrapper for Google Maps API
- `lucide-react`: Icons for UI elements
- Next.js 16+: Server-side rendering and API routes
- Tailwind CSS: Styling

## Location Permissions

The component uses the Geolocation API to detect user location:
- Users will see a browser prompt asking for location permission
- Location is only used to center the map initially
- No location data is sent to your server unless explicitly implemented

## Future Enhancements

Potential improvements:
- [ ] Search businesses by category
- [ ] Filter by rating or distance
- [ ] Save favorite businesses
- [ ] Display real-time pricing from businesses
- [ ] Show distance to each business
- [ ] Integrate with supplier dashboard for management
- [ ] Add heat maps for popular product categories
- [ ] Real-time inventory updates

## Cost Considerations

Google Maps API has a free tier with usage limits:
- First $200 of usage per month is free
- Most development/testing won't exceed this
- Monitor usage in Google Cloud Console under Maps JavaScript API

For production, consider:
- Caching map data
- Implementing geohashing for efficient location queries
- Using server-side rendering to reduce client-side API calls
