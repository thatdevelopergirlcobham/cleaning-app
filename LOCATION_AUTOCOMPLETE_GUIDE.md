# Location Autocomplete Feature

## Overview
Added a location autocomplete feature to the Create Report form that provides location suggestions as you type.

## Features

### ✅ What's Included

1. **Real-time Search**
   - Start typing a location (minimum 3 characters)
   - Get suggestions after 500ms (debounced)
   - Focused on Nigerian locations (Calabar region)

2. **Dropdown Suggestions**
   - Shows up to 5 location suggestions
   - Displays city/area name and full address
   - Visual map pin icons for each suggestion

3. **Keyboard Navigation**
   - ↑ Arrow Up - Navigate up through suggestions
   - ↓ Arrow Down - Navigate down through suggestions
   - Enter - Select highlighted suggestion
   - Escape - Close dropdown

4. **Mouse Interaction**
   - Click any suggestion to select it
   - Click outside to close dropdown
   - Hover effects on suggestions

5. **Loading States**
   - Spinner icon while fetching suggestions
   - "No results" message when nothing found

## How It Works

### API Used
- **Nominatim (OpenStreetMap)** - Free geocoding API
- No API key required
- Focused on Nigeria (`countrycodes=ng`)

### Example Searches
```
"Ati" → Shows: Atiwa, Atimbo, etc.
"Calabar" → Shows: Calabar, Calabar South, etc.
"Lagos" → Shows: Lagos, Lagos Island, etc.
"Abuja" → Shows: Abuja, Abuja Municipal, etc.
```

## Component Details

### LocationAutocomplete Component
**Location:** `src/components/common/LocationAutocomplete.tsx`

**Props:**
```typescript
interface LocationAutocompleteProps {
  value: string                    // Current location text
  onChange: (location) => void     // Callback when location selected
  placeholder?: string             // Input placeholder text
  className?: string              // Additional CSS classes
}
```

**Returns:**
```typescript
{
  lat: number        // Latitude
  lng: number        // Longitude
  address: string    // Full address text
}
```

### Integration in UserReportsManager
**Location:** `src/components/community/UserReportsManager.tsx`

The component is integrated in the Create/Edit Report form:
```tsx
<LocationAutocomplete
  value={formData.location?.address || ''}
  onChange={(location) => {
    setFormData(prev => ({
      ...prev,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address
      }
    }))
  }}
  placeholder="Search for location (e.g., Atiwa, Calabar, Lagos)"
/>
```

## Usage Example

1. **Open Create Report Form**
   - Navigate to `/my-reports`
   - Click "Create New Report"

2. **Enter Location**
   - Scroll to the "Location" field
   - Start typing: "Ati"
   - Wait for suggestions to appear

3. **Select Location**
   - Click on a suggestion, OR
   - Use arrow keys + Enter

4. **Confirmation**
   - Selected location shows below the input
   - Format: "📍 Selected: [Full Address]"

## Technical Details

### Debouncing
- 500ms delay after user stops typing
- Prevents excessive API calls
- Improves performance

### Error Handling
- Catches API errors gracefully
- Shows "No results" message
- Logs errors to console

### Accessibility
- Keyboard navigation support
- ARIA attributes (future enhancement)
- Focus management
- Click-outside detection

### Performance
- Debounced search
- Limited to 5 results
- Cached in component state
- Cleanup on unmount

## Customization

### Change Country Focus
Edit the API call in `LocationAutocomplete.tsx`:
```typescript
// Current: Nigeria only
countrycodes=ng

// Multiple countries
countrycodes=ng,gh,ke

// All countries (remove parameter)
// Remove: &countrycodes=ng
```

### Change Number of Results
```typescript
// Current: 5 results
limit=5

// More results
limit=10
```

### Change Debounce Delay
```typescript
// Current: 500ms
setTimeout(() => {
  fetchSuggestions(newValue)
}, 500)

// Faster: 300ms
setTimeout(() => {
  fetchSuggestions(newValue)
}, 300)
```

### Styling
The component uses Tailwind CSS classes. Customize in:
- `LocationAutocomplete.tsx` - Component styles
- Pass `className` prop for additional styles

## API Rate Limits

### Nominatim Usage Policy
- **Free tier:** 1 request per second
- **User-Agent required:** Already set to "CleanCal-App"
- **Fair use:** Don't abuse the service

### Alternative APIs (if needed)
1. **Google Places API** - Requires API key, paid
2. **Mapbox Geocoding** - Requires API key, free tier available
3. **Here Geocoding** - Requires API key, free tier available

## Troubleshooting

### No Suggestions Appearing
1. Check internet connection
2. Verify API is accessible (check console)
3. Try typing more characters (minimum 3)
4. Check if location exists in Nigeria

### Slow Response
1. Normal - API can take 1-2 seconds
2. Check network speed
3. Consider caching results

### Wrong Country Results
1. Verify `countrycodes=ng` parameter
2. Be more specific in search
3. Include city/state in query

## Future Enhancements

- [ ] Add recent searches cache
- [ ] Add favorite locations
- [ ] Show location on mini map preview
- [ ] Add GPS/current location button
- [ ] Support multiple countries
- [ ] Add location validation
- [ ] Offline mode with cached locations

## Files Modified

1. ✅ `src/components/common/LocationAutocomplete.tsx` - NEW
2. ✅ `src/components/community/UserReportsManager.tsx` - UPDATED
3. ✅ `src/api/userReportsService.ts` - Already supports location field

## Testing

### Test Cases
1. ✅ Type "Atiwa" - Should show Atiwa locations
2. ✅ Type "Calabar" - Should show Calabar locations
3. ✅ Type "xyz123" - Should show "No results"
4. ✅ Press Escape - Should close dropdown
5. ✅ Use arrow keys - Should navigate suggestions
6. ✅ Click outside - Should close dropdown

---

**Feature Complete!** 🎉

The location autocomplete is now fully integrated and ready to use.
