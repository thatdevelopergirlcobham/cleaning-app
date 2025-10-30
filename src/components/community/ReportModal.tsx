// src/components/community/ReportModal.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import type { ReportInsert } from "../../api/reports";
import { getCurrentLocation, searchLocations } from "../../utils/locationUtils";
import { FiCrosshair, FiX, FiMapPin, FiUpload, FiImage, FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../api/supabaseClient";
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
export type ReportSubmitData = Omit<ReportInsert, "id" | "created_at" | "updated_at" | "location"> & {
  location: string; // This is the address string
  latitude: number | null;
  longitude: number | null;
};

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
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
    user_id: user?.id || "" // Set from auth context
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

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!file) {
      console.log('No file provided to upload');
      return null;
    }
    
    // Validate file type
    if (!file.type.match('image.*')) {
      console.error('Invalid file type:', file.type);
      toast.error('Please select a valid image file');
      return null;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large:', file.size);
      toast.error('Image size should be less than 5MB');
      return null;
    }

    console.log('Starting image upload...', { fileName: file.name, fileSize: file.size });
    
    // Log current session for debugging (optional - works with or without auth)
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session:', session ? 'Active' : 'No session (anonymous upload)');
    
    try {
      toast.info('Uploading image...');
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `report-images/${fileName}`;

      console.log('Uploading to Supabase Storage:', filePath);
      console.log('File details:', { 
        name: file.name, 
        size: file.size, 
        type: file.type 
      });

      // Create upload promise with timeout
      const uploadPromise = supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Upload is taking too long. This might be a network issue. Please check your connection and try again.'));
        }, 45000); // 45 seconds
      });

      // Race between upload and timeout
      const result = await Promise.race([
        uploadPromise,
        timeoutPromise
      ]).catch((err) => {
        console.error('Upload timeout or error:', err);
        throw err;
      });
      
      const { data: uploadData, error: uploadError } = result;

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        console.error('Error message:', uploadError.message);
        console.error('Error details:', JSON.stringify(uploadError, null, 2));
        throw new Error(uploadError.message || 'Upload failed');
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        console.error('Failed to get public URL');
        throw new Error('Failed to get public URL');
      }

      const imageUrl = data.publicUrl;
      console.log('Image URL obtained:', imageUrl);
      
      // Update form data with the uploaded image URL
      console.log('Setting image URL in form data:', imageUrl);
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
      setImagePreview(URL.createObjectURL(file));
      toast.success('Image uploaded successfully!');
      
      console.log('Upload completed successfully, returning URL');
      return imageUrl;
    } catch (error) {
      const err = error as Error;
      console.error('Error uploading image:', err);
      console.error('Full error object:', error);
      
      // Provide specific error messages with actionable advice
      let errorMessage = 'Upload failed. ';
      
      if (err.message?.includes('taking too long') || err.message?.includes('timeout')) {
        errorMessage = '⏱️ Upload is taking too long. This is likely a network or CORS issue. You can submit your report without the image for now.';
      } else if (err.message?.includes('row-level security') || err.message?.includes('policy') || err.message?.includes('permission')) {
        errorMessage = '🔒 Permission denied. The storage policy may not be configured. You can submit without an image.';
      } else if (err.message?.includes('not found') || err.message?.includes('bucket')) {
        errorMessage = '📦 Storage bucket not found. Please contact support or submit without an image.';
      } else if (err.message?.includes('JWT') || err.message?.includes('token')) {
        errorMessage = '🔑 Authentication error. Try refreshing the page or submit without an image.';
      } else if (err.message?.includes('network') || err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
        errorMessage = '🌐 Network error. Check your internet connection or submit without an image.';
      } else {
        errorMessage = `❌ ${err.message}. You can submit your report without an image.`;
      }
      
      toast.error(errorMessage, { autoClose: 8000 });
      
      // Clear the preview so user can try again or submit without image
      setImagePreview(null);
      setFormData(prev => ({ ...prev, image_url: '' }));
      
      return null;
    } finally {
      console.log('Upload process completed, resetting upload state to false');
      setIsUploading(false);
      console.log('isUploading state should now be false');
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log('File selected:', file.name);
    console.log('Setting isUploading to TRUE');
    setIsUploading(true);
    
    // Create preview immediately for better UX
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload the file and wait for completion
    console.log('Starting upload process...');
    try {
      const uploadedUrl = await handleImageUpload(file);
      console.log('Upload process finished. URL:', uploadedUrl);
      
      if (uploadedUrl) {
        console.log('Image uploaded successfully, URL saved to form');
      } else {
        console.log('Image upload failed or was cancelled');
      }
    } catch (error) {
      console.error('Error in handleFileChange:', error);
    }
  };
  
  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
    toast.info('Image removed. You can upload a new one if needed.');
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: string) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Check if pasted content looks like code or SQL (contains common SQL keywords or excessive newlines)
    const sqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|FROM|WHERE|JOIN|POLICY)\b/i;
    const hasMultipleLines = (pastedText.match(/\n/g) || []).length > 5;
    
    if (sqlKeywords.test(pastedText) || (hasMultipleLines && pastedText.length > 500)) {
      e.preventDefault();
      toast.error(`The pasted content appears to be code or a script. Please enter a ${fieldName} manually.`);
      return;
    }
    
    // Limit paste length for title
    if (fieldName === 'title' && pastedText.length > 200) {
      e.preventDefault();
      toast.warning('Title is too long. Please keep it under 200 characters.');
      return;
    }
    
    // Limit paste length for description
    if (fieldName === 'description' && pastedText.length > 2000) {
      e.preventDefault();
      toast.warning('Description is too long. Please keep it under 2000 characters.');
      return;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted. Upload state:', isUploading);
    console.log('Form data:', formData);
    
    // Validation: Check if image is still uploading
    if (isUploading) {
      console.log('Blocked: Image still uploading');
      toast.warning('Image is still uploading. Please wait...');
      return;
    }
    
    // Validation: Check required fields including image
    if (!formData.title.trim() || !formData.description.trim() || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validation: Check if image is uploaded (REQUIRED)
    if (!formData.image_url || !formData.image_url.trim()) {
      toast.error("Please upload an image. Images are required for all reports.");
      return;
    }

    // Validation: Check location coordinates
    if (!formData.latitude || !formData.longitude) {
      toast.error("Please select a valid location from the suggestions");
      return;
    }

    // Validation: Check user authentication
    if (!user?.id) {
      toast.error("You must be logged in to submit a report");
      return;
    }

    // Validation: Check for SQL or code-like content
    const sqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|FROM|WHERE|JOIN|POLICY|TABLE|DATABASE)\b/i;
    if (sqlKeywords.test(formData.title) || sqlKeywords.test(formData.description)) {
      toast.error("Your report appears to contain SQL or code. Please enter a proper description of the issue.");
      return;
    }

    // Validation: Check for excessive length or suspicious patterns
    if (formData.title.length > 200) {
      toast.error("Title is too long. Please keep it under 200 characters.");
      return;
    }

    if (formData.description.length > 2000) {
      toast.error("Description is too long. Please keep it under 2000 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Image is already uploaded to Supabase Storage (if provided)
      // The image_url in formData contains the Supabase Storage public URL
      
      // Step 2: Prepare data for Supabase submission
      // Extract latitude, longitude and exclude the location string from reportBase
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { latitude, longitude, location, ...reportBase } = formData;
      // Note: 'location' is intentionally extracted to exclude it from reportBase
      
      // Build the final submission object with proper structure
      const reportData: ReportInsert = {
        ...reportBase,
        user_id: user.id, // Ensure user_id is set from authenticated user
        location: {
          lat: latitude,
          lng: longitude
        },
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Step 3: Submit to Supabase
      toast.info('Submitting report to database...');
      const success = await onSubmit(reportData);
      
      if (success) {
        toast.success("Report submitted successfully! It will be reviewed by our team.");
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
          user_id: user.id
        });
        setSearchQuery("");
        setImagePreview(null);
        onClose();
      } else {
        toast.error("Failed to submit report. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("An error occurred while submitting your report. Please try again.");
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
                onPaste={(e) => handlePaste(e, 'title')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter a descriptive title"
                required
                disabled={isSubmitting}
                autoComplete="off"
                maxLength={200}
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
                onPaste={(e) => handlePaste(e, 'description')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Please describe the issue in detail"
                required
                disabled={isSubmitting}
                autoComplete="off"
                maxLength={2000}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Search for a location or use current location"
                    disabled={isSubmitting}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={loadingLocation || isSubmitting}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all disabled:opacity-50"
                    title="Use current location"
                  >
                    {loadingLocation ? (
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    ) : (
                      <FiCrosshair className="h-5 w-5" />
                    )}
                  </button>
                  
                  {/* Loading indicator */}
                  {isSearching && (
                    <div className="absolute right-14 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                    </div>
                  )}
                </div>

                {/* Location Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
                    {suggestions.map((suggestion) => (
                      <div
                        key={`${suggestion.lat},${suggestion.lon}`}
                        className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleLocationSelect(suggestion);
                        }}
                      >
                        <div className="font-medium text-gray-900 text-sm">
                          {suggestion.display_name.split(',')[0]}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {suggestion.display_name.split(',').slice(1).join(',').trim()}
                        </div>
                        <div className="mt-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {suggestion.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected location preview - Only show when not searching */}
                {formData.location && !showSuggestions && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start">
                      <FiMapPin className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-green-800 mb-1">Selected Location</div>
                        <div className="text-sm text-gray-700 break-words">{formData.location}</div>
                        {formData.latitude && formData.longitude && (
                          <div className="text-xs text-gray-500 mt-1.5">
                            📍 {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                          </div>
                        )}
                      </div>
                    </div>
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
                Upload Image <span className="text-red-500">*</span>
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