import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Loader } from 'lucide-react'

interface LocationSuggestion {
  place_id: string
  display_name: string
  lat: string
  lon: string
  address?: {
    city?: string
    state?: string
    country?: string
  }
}

interface LocationAutocompleteProps {
  value: string
  onChange: (location: { lat: number; lng: number; address: string }) => void
  placeholder?: string
  className?: string
}

/**
 * Location Autocomplete Component
 * Provides location suggestions as user types using Nominatim (OpenStreetMap) API
 */
const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Enter location (e.g., Atiwa, Calabar)',
  className = ''
}) => {
  const [inputValue, setInputValue] = useState(value || '')
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout>()

  /**
   * Fetch location suggestions from Nominatim API
   */
  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    
    try {
      // Using Nominatim (OpenStreetMap) API - free and no API key required
      // Focusing on Nigeria (Calabar region) by adding countrycodes=ng
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=5&` +
        `countrycodes=ng`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CleanCal-App' // Required by Nominatim
          }
        }
      )

      if (!response.ok) throw new Error('Failed to fetch suggestions')

      const data: LocationSuggestion[] = await response.json()
      setSuggestions(data)
      setShowDropdown(true)
    } catch (error) {
      console.error('Error fetching location suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle input change with debouncing
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setSelectedIndex(-1)

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set new timer for debounced search
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue)
    }, 500) // Wait 500ms after user stops typing
  }

  /**
   * Handle suggestion selection
   */
  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    const locationData = {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
      address: suggestion.display_name
    }

    setInputValue(suggestion.display_name)
    onChange(locationData)
    setShowDropdown(false)
    setSuggestions([])
  }

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        break
    }
  }

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /**
   * Cleanup debounce timer
   */
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowDropdown(true)
            }
          }}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
          autoComplete="off"
        />

        {isLoading && (
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
        )}
      </div>

      {/* Dropdown with suggestions */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.address?.city || suggestion.display_name.split(',')[0]}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {suggestion.display_name}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown && !isLoading && inputValue.length >= 3 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-500 text-center">
            No locations found. Try a different search term.
          </p>
        </div>
      )}

      {/* Helper text */}
      <p className="mt-1 text-xs text-gray-500">
        Start typing to search for locations in Nigeria (e.g., "Atiwa", "Calabar", "Lagos")
      </p>
    </div>
  )
}

export default LocationAutocomplete
