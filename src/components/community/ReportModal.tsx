// src/components/community/ReportModal.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import type { ReportInsert } from "../../api/reports";
import { getCurrentLocation, searchLocations } from "../../utils/locationUtils";
import { FiCrosshair, FiX, FiMapPin, FiUpload, FiImage, FiLoader } from "react-icons/fi";
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

// FIX: Modified this type to correctly Omit the 'location' field from ReportInsert,
// as the form state handles it as three separate fields.
type ReportSubmitData = Omit<ReportInsert, "id" | "created_at" | "updated_at" | "location"> & {
  location: string; // This is the address string
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
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbortController = useRef<AbortController | null>(null);
  // FIX: This ref will prevent the search useEffect from firing after a location is selected
  const justSelectedRef = useRef(false);

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
    // FIX: Check the ref. If we just selected a location, set the flag to false and exit.
    // This stops the search from re-running with the full address.
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

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
      // Also clear abort controller on unmount
      if (searchAbortController.current) {
        searchAbortController.current.abort();
      }
    };
  }, [searchQuery, handleSearch]);

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    // FIX: Set the flag to true before updating state
    justSelectedRef.current = true;
    setFormData(prev => ({
      ...prev,
      location: suggestion.display_name,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon)
    }));
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]); // FIX: Clear suggestions as well
  };

  const handleUseMyLocation = async () => {
    // FIX: Set the flag to true here too
    justSelectedRef.current = true;
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

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Please select a valid image file');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dcq9pt9qh';
    const apiKey = '269794818535588'; // ⚠️ WARNING: For testing only - move to backend in production
    const apiSecret = 'n9ZJcsEZjkB6B6SaqSTJ6YE8bog'; // ⚠️ WARNING: Never expose in production
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
    
    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary configuration is missing');
      toast.error('Image upload configuration is incomplete. Please try again later.');
      return;
    }
    
    // Get current timestamp for signature
    const timestamp = Math.round((new Date).getTime() / 1000);
    
      // Move the signature generation function to the top level of the component
    const generateSignature = async (cloudName: string, timestamp: number, apiSecret: string) => {
      const message = `cloud_name=${cloudName}&timestamp=${timestamp}${apiSecret}`;
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    try {
      const signature = await generateSignature(cloudName, timestamp, apiSecret);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('cloud_name', cloudName);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      
      setIsUploading(true);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Upload failed with status:', response.status, errorData);
        throw new Error(errorData.message || 'Upload failed');
      }
      
      const data = await response.json();
      setFormData(prev => ({ ...prev, image_url: data.secure_url }));
      setImagePreview(URL.createObjectURL(file));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload the file
    handleImageUpload(file);
  };
  
  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isUploading) {
      toast.warning('Please wait for the image to finish uploading');
      return;
    }
    
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
      const { latitude, longitude, location: locationString, ...reportBase } = formData;
      // FIX: Build the final submission object. It now contains everything from
      // reportBase, plus the new 'location' object, and *excludes* the top-level
      // latitude, longitude, and string location.
      const success = await onSubmit({
        ...reportBase,
        location: {
          lat: latitude,
          lng: longitude,
          address: locationString
        }
      } as unknown as ReportInsert); // Kept your cast as ReportInsert is imported
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Report an Issue</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1 -mr-2"
              disabled={isSubmitting}
              aria-label="Close modal"
            >
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                          e.preventDefault();
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

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Image (optional)
              </label>
              <div className="mt-1 flex items-center">
                <label
                  className={`relative cursor-pointer rounded-md bg-white font-medium text-green-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 hover:text-green-500 ${isUploading || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm">
                    <FiUpload className="mr-2 h-5 w-5" />
                    {isUploading ? 'Uploading...' : 'Choose a file'}
                  </span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading || isSubmitting}
                  />
                </label>
                {isUploading && (
                  <div className="ml-4 flex items-center text-gray-500">
                    <FiLoader className="animate-spin mr-2 h-4 w-4" />
                    <span className="text-sm">Uploading...</span>
                  </div>
                )}
              </div>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4 relative">
                  <div className="group relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isUploading || isSubmitting}
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Click the X to remove the image
                  </p>
                </div>
              )}
              
              {/* Show existing image if available but no preview */}
              {!imagePreview && formData.image_url && (
                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiImage className="mr-2 h-4 w-4 text-gray-400" />
                    <span>Image is attached to this report</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="mt-2 text-xs text-red-600 hover:text-red-800"
                    disabled={isSubmitting}
                  >
                    Remove image
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button - Sticky to bottom */}
            <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t mt-6">
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full bg-[#0d542b] text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
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