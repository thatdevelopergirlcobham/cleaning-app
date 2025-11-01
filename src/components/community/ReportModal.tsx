// src/components/community/ReportModal.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ReportInsert } from '../../api/reports';
import { getCurrentLocation, searchLocations } from '../../utils/locationUtils';
import { FiCrosshair, FiX, FiMapPin, FiUpload, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import 'react-toastify/dist/ReactToastify.css';

// Image upload endpoint
const CLOUDINARY_ENDPOINT = 'https://clean-cal-api.vercel.app/upload';

type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReportInsert) => Promise<boolean> | boolean;
};

type LocationSuggestion = { display_name: string; lat: string; lon: string; type: string };

export type ReportSubmitData = Omit<ReportInsert, 'id' | 'created_at' | 'updated_at' | 'location'> & {
  location: string;
  latitude: number | null;
  longitude: number | null;
};

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState<ReportSubmitData>({
    title: '',
    description: '',
    location: '',
    latitude: null,
    longitude: null,
    image_url: '',
    status: 'pending',
    category: 'other',
    priority: 'medium' as const,
    user_id: user?.id || ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const previewUrlRef = useRef<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbortController = useRef<AbortController | null>(null);
  const justSelectedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (searchAbortController.current) searchAbortController.current.abort();
    };
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    if (searchAbortController.current) searchAbortController.current.abort();
    searchAbortController.current = new AbortController();
    const signal = searchAbortController.current.signal;

    try {
      setIsSearching(true);
      const results = await searchLocations(query);
      if (!signal.aborted) {
        setSuggestions(results);
        setShowSuggestions(true);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Search error', err);
        toast.error('Failed to fetch location suggestions');
      }
    } finally {
      if (!signal.aborted) setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => handleSearch(searchQuery), 300);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery, handleSearch]);

  const handleLocationSelect = (s: LocationSuggestion) => {
    justSelectedRef.current = true;
    setFormData(prev => ({ ...prev, location: s.display_name, latitude: parseFloat(s.lat), longitude: parseFloat(s.lon) }));
    setSearchQuery(s.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleUseMyLocation = async () => {
    justSelectedRef.current = true;
    setLoadingLocation(true);
    try {
      const loc = await getCurrentLocation();
      setFormData(prev => ({ ...prev, location: loc.address, latitude: loc.lat, longitude: loc.lng }));
      setSearchQuery(loc.address);
      toast.success('Location set to your current position');
    } catch (err) {
      console.error('Location error', err);
      toast.error('Could not get your location. Please enable location services and try again.');
    } finally { setLoadingLocation(false); }
  };

  const handleInputFocus = () => { if (searchQuery && suggestions.length > 0) setShowSuggestions(true); };
  const handleInputBlur = () => setTimeout(() => setShowSuggestions(false), 200);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match('image.*')) { toast.error('Please select a valid image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image size should be less than 5MB'); return; }

    setIsUploading(true);
    try {
      if (previewUrlRef.current) { URL.revokeObjectURL(previewUrlRef.current); previewUrlRef.current = null; }
      const newPreview = URL.createObjectURL(file);
      previewUrlRef.current = newPreview;
      setImagePreview(newPreview);

      const fd = new FormData();
      fd.append('image', file, file.name);
      const res = await fetch(CLOUDINARY_ENDPOINT, { method: 'POST', body: fd });
      const text = await res.text();
      if (!res.ok) throw new Error('Upload failed: ' + res.status + ' ' + text);
      const json = JSON.parse(text || '{}');
      const url = json.url || json.secure_url || json.data?.url || json.data?.secure_url;
      if (!url) throw new Error('No URL returned from upload');
      setFormData(prev => ({ ...prev, image_url: url }));
      toast.success('Image uploaded successfully');
    } catch (err) {
      console.error('Upload error', err);
      toast.error('Image upload failed');
      if (previewUrlRef.current) { URL.revokeObjectURL(previewUrlRef.current); previewUrlRef.current = null; }
      setImagePreview(null);
      setFormData(prev => ({ ...prev, image_url: '' }));
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeImage = () => {
    if (previewUrlRef.current) { URL.revokeObjectURL(previewUrlRef.current); previewUrlRef.current = null; }
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
    toast.info('Image removed.');
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: string) => {
    const pasted = e.clipboardData.getData('text');
    const sqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|FROM|WHERE|JOIN|POLICY|TABLE|DATABASE)\b/i;
    const multiple = (pasted.match(/\n/g) || []).length > 5;
    if (sqlKeywords.test(pasted) || (multiple && pasted.length > 500)) { e.preventDefault(); toast.error(`The pasted content appears to be code. Please enter a ${fieldName} manually.`); return; }
    if (fieldName === 'title' && pasted.length > 200) { e.preventDefault(); toast.warning('Title is too long.'); return; }
    if (fieldName === 'description' && pasted.length > 2000) { e.preventDefault(); toast.warning('Description is too long.'); return; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) { toast.warning('Image is still uploading. Please wait...'); return; }
    if (!formData.title.trim() || !formData.description.trim()) { toast.error('Please fill in title and description'); return; }
    if (!formData.image_url || !formData.image_url.trim()) { toast.error('Please upload an image. Images are required for all reports.'); return; }
    const hasCoords = typeof formData.latitude === 'number' && typeof formData.longitude === 'number';
    const hasLocationString = typeof formData.location === 'string' && formData.location.trim() !== '';
    if (!hasCoords && !hasLocationString) { toast.error('Please select a valid location or enter an address'); return; }

    setIsSubmitting(true);
    try {
      // const { latitude, longitude, location, ...reportBase } = formData as any;
      const { latitude, longitude, location, ...reportBase } = formData as any;
      const finalUserId = user?.id || formData.user_id || 'public-test';
      const locationValue = hasCoords ? { lat: formData.latitude as number, lng: formData.longitude as number } : (formData.location || null);
      type LocationValue = { lat: number; lng: number } | string | null;
      type ReportPayload = Omit<ReportInsert, 'id' | 'created_at' | 'updated_at' | 'location'> & { location: LocationValue; status?: string };
      const reportData: ReportPayload = { ...reportBase, user_id: finalUserId, location: locationValue, status: 'pending' };

      const success = await onSubmit(reportData as unknown as ReportInsert);
      if (success) {
        toast.success('Report submitted successfully! It will be reviewed by our team.');
        setFormData({ title: '', description: '', location: '', latitude: null, longitude: null, image_url: '', status: 'pending', category: 'other', priority: 'medium', user_id: user?.id || '' });
        setSearchQuery('');
        if (previewUrlRef.current) { URL.revokeObjectURL(previewUrlRef.current); previewUrlRef.current = null; }
        setImagePreview(null);
        onClose();
      } else {
        toast.error('Failed to submit report. Please try again.');
      }
    } catch (err) {
      console.error('Submit error', err);
      toast.error('An error occurred while submitting your report. Please try again.');
    } finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Report an Issue</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors p-1 -mr-2" disabled={isSubmitting} aria-label="Close modal">
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input id="title" type="text" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} onPaste={(e) => handlePaste(e, 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter a descriptive title" required disabled={isSubmitting} autoComplete="off" maxLength={200} />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} onPaste={(e) => handlePaste(e, 'description')} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Please describe the issue in detail" required disabled={isSubmitting} autoComplete="off" maxLength={2000} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiMapPin className="h-5 w-5 text-gray-400" /></div>
                  <input type="text" id="location" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={handleInputFocus} onBlur={handleInputBlur} className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" placeholder="Search for a location or use current location" disabled={isSubmitting} autoComplete="off" />
                  <button type="button" onClick={handleUseMyLocation} disabled={loadingLocation || isSubmitting} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all disabled:opacity-50" title="Use current location">
                    {loadingLocation ? <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" /> : <FiCrosshair className="h-5 w-5" />}
                  </button>

                  {isSearching && (<div className="absolute right-14 top-1/2 -translate-y-1/2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500" /></div>)}
                </div>

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
                    {suggestions.map(s => (
                      <div key={`${s.lat},${s.lon}`} className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors" onMouseDown={(e) => { e.preventDefault(); handleLocationSelect(s); }}>
                        <div className="font-medium text-gray-900 text-sm">{s.display_name.split(',')[0]}</div>
                        <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{s.display_name.split(',').slice(1).join(',').trim()}</div>
                        <div className="mt-1.5"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">{s.type.replace('_',' ')}</span></div>
                      </div>
                    ))}
                  </div>
                )}

                {formData.location && !showSuggestions && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start">
                      <FiMapPin className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-green-800 mb-1">Selected Location</div>
                        <div className="text-sm text-gray-700 break-words">{formData.location}</div>
                        {formData.latitude && formData.longitude && (<div className="text-xs text-gray-500 mt-1.5">📍 {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</div>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select id="category" value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" disabled={isSubmitting}>
                  <option value="illegal_dumping">Illegal Dumping</option>
                  <option value="overflowing_bin">Overflowing Bin</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select id="priority" value={formData.priority} onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" disabled={isSubmitting}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image <span className="text-red-500">*</span></label>
              <div className="mt-1 flex items-center">
                <label className={`relative cursor-pointer rounded-md bg-white font-medium text-green-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 hover:text-green-500 ${isUploading || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <span className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm"><FiUpload className="mr-2 h-5 w-5" />{isUploading ? 'Uploading...' : 'Choose a file'}</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} disabled={isUploading || isSubmitting} />
                </label>
                {isUploading && (<div className="ml-4 flex items-center text-gray-500"><FiLoader className="animate-spin mr-2 h-4 w-4" /><span className="text-sm">Uploading...</span></div>)}
              </div>

              {imagePreview && (
                <div className="mt-4 relative">
                  <div className="group relative">
                    <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-lg border border-gray-200" />
                    <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" disabled={isUploading || isSubmitting}><FiX className="h-4 w-4" /></button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Click the X to remove the image</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t mt-6">
              <button type="submit" disabled={isSubmitting || isUploading} className="w-full bg-[#0d542b] text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg">
                {isSubmitting ? (<div className="flex items-center justify-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" /><span>Submitting...</span></div>) : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;