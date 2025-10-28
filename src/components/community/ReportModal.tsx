// src/components/community/ReportModal.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import type { ReportInsert } from "../../api/reports";
import { getCurrentLocation, searchLocations } from "../../utils/locationUtils";
import { FiSearch, FiCrosshair, FiX, FiMapPin } from "react-icons/fi";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReportInsert) => Promise<boolean> | boolean;
};

type LocationSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
};

type ReportSubmitData = Omit<ReportInsert, "id" | "created_at" | "updated_at"> & {
  location: string;
  latitude: number | null;
  longitude: number | null;
};

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<ReportSubmitData>({
    title: "",
    description: "",
    location: "",
    latitude: null,
    longitude: null,
    image_url: "",
    status: "pending",
    category: "other",
    priority: "medium" as const,
    user_id: "" // Will be set from auth context
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchAbortController = useRef<AbortController>();

  // Debounced search function
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    // Cancel previous request if it exists
    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }

    // Create new AbortController for this request
    searchAbortController.current = new AbortController();
    const signal = searchAbortController.current.signal;

    try {
      setIsSearching(true);
      const results = await searchLocations(query);
      
      // Only update if the request wasn't aborted
      if (!signal.aborted) {
        setSuggestions(results);
        setShowSuggestions(true);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error searching locations:', error);
        toast.error("Failed to fetch location suggestions");
      }
    } finally {
      if (!signal.aborted) {
        setIsSearching(false);
      }
    }
  }, []);

  // Handle search query changes with debounce
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, handleSearch]);

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    setFormData(prev => ({
      ...prev,
      location: suggestion.display_name,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon)
    }));
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
  };

  const handleUseMyLocation = async () => {
    setLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      setFormData(prev => ({
        ...prev,
        location: location.address,
        latitude: location.lat,
        longitude: location.lng
      }));
      setSearchQuery(location.address);
      toast.success("Location set to your current position");
    } catch (error) {
      console.error("Error getting current location:", error);
      toast.error("Could not get your location. Please enable location services and try again.");
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleInputFocus = () => {
    if (searchQuery && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Use setTimeout to allow click events on suggestions to fire first
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast.error("Please select a valid location from the suggestions");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit({
        ...formData,
        location: {
          lat: formData.latitude,
          lng: formData.longitude,
          address: formData.location
        }
      } as unknown as ReportInsert);
      
      if (success) {
        toast.success("Report submitted successfully!");
        // Reset form
        setFormData({
          title: "",
          description: "",
          location: "",
          latitude: null,
          longitude: null,
          image_url: "",
          status: "pending",
          category: "other",
          priority: "medium",
          user_id: ""
        });
        setSearchQuery("");
        onClose();
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Report an Issue</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isSubmitting}
              aria-label="Close modal"
            >
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter a descriptive title"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Please describe the issue in detail"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Search for a location or use current location"
                    disabled={isSubmitting}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={loadingLocation || isSubmitting}
                    className="absolute right-2 p-1 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50"
                    title="Use current location"
                  >
                    {loadingLocation ? (
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    ) : (
                      <FiCrosshair className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Loading indicator */}
                {isSearching && (
                  <div className="absolute right-12 top-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                  </div>
                )}

                {/* Location Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion) => (
                      <div
                        key={`${suggestion.lat},${suggestion.lon}`}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input blur
                          handleLocationSelect(suggestion);
                        }}
                      >
                        <div className="font-medium text-gray-900">
                          {suggestion.display_name.split(',')[0]}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {suggestion.display_name.split(',').slice(1).join(',').trim()}
                        </div>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {suggestion.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected location preview */}
                {formData.location && (
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <div className="font-medium">Selected Location:</div>
                    <div className="truncate">{formData.location}</div>
                    {formData.latitude && formData.longitude && (
                      <div className="text-xs text-gray-500 mt-1">
                        Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="illegal_dumping">Illegal Dumping</option>
                  <option value="overflowing_bin">Overflowing Bin</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent'
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (optional)
              </label>
              <input
                type="url"
                id="image_url"
                value={formData.image_url || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
                disabled={isSubmitting}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
