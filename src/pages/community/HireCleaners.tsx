import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../api/supabaseClient';

interface CleaningRequest {
  name: string;
  address: string;
  description: string;
  service_date: string;
  service_time: string;
  space_size: 'small' | 'medium' | 'large';
  contact_phone: string;
  contact_email: string;
  notes?: string;
  location?: { lat: number; lng: number } | null;
}

const initialState: CleaningRequest = {
  name: '',
  address: '',
  description: '',
  service_date: '',
  service_time: '',
  space_size: 'small',
  contact_phone: '',
  contact_email: '',
  notes: '',
  location: null,
};

type Suggestion = { display_name: string; lat: string; lon: string };

const HireCleaners: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CleaningRequest>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [placeQuery, setPlaceQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const validateTime = useCallback((time: string) => {
    if (!time) return 'Time is required';
    const [hh, mm] = time.split(':').map(Number);
    const total = hh * 60 + mm;
    const start = 9 * 60;
    const end = 17 * 60;
    if (total < start || total > end) return 'Service time must be between 09:00 and 17:00';
    return null;
  }, []);

  const validateDate = useCallback((dateStr: string) => {
    if (!dateStr) return 'Date is required';
    const d = new Date(dateStr + 'T00:00:00');
    if (d.getUTCDay() === 0) return 'Sundays are not available. Please choose another date';
    return null;
  }, []);

  const onDateChange = (value: string) => {
    const err = validateDate(value);
    setDateError(err);
    setFormData(prev => ({ ...prev, service_date: value }));
  };

  const onTimeChange = (value: string) => {
    const err = validateTime(value);
    setTimeError(err);
    setFormData(prev => ({ ...prev, service_time: value }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData(prev => ({ ...prev, location: { lat: latitude, lng: longitude } }));
      },
      () => setError('Unable to get current location'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      const q = placeQuery.trim();
      if (!q) { setSuggestions([]); return; }
      setIsSearching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'CleanCal/1.0' } });
        const data = (await res.json()) as Suggestion[];
        if (active) setSuggestions(Array.isArray(data) ? data : []);
      } catch {
        if (active) setSuggestions([]);
      } finally {
        if (active) setIsSearching(false);
      }
    };
    const t = setTimeout(run, 300);
    return () => { active = false; clearTimeout(t); };
  }, [placeQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please login to submit a cleaning request');
      return;
    }

    const dErr = validateDate(formData.service_date);
    const tErr = validateTime(formData.service_time);
    setDateError(dErr);
    setTimeError(tErr);
    if (dErr || tErr) return;

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('cleaning_requests')
        .insert([{ ...formData, user_id: user.id, status: 'pending' }]);

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData(initialState);
      setPlaceQuery('');
      setSuggestions([]);

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error submitting request:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const rates = [
    { size: 'small', price: '₦2,500', description: 'Perfect for apartments and small offices' },
    { size: 'medium', price: '₦5,000', description: 'Ideal for houses and medium-sized spaces' },
    { size: 'large', price: '₦8,000', description: 'Best for large properties and commercial spaces' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Hire Professional Cleaners</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Book reliable cleaning services for your space. Our professional team ensures top-quality cleaning at competitive rates.
          </p>
        </div>

        {/* Rates Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {rates.map(({ size, price, description }) => (
            <div key={size} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold capitalize">{size} Space</h3>
                <span className="text-2xl font-bold text-green-600">{price}</span>
              </div>
              <p className="text-gray-600">{description}</p>
            </div>
          ))}
        </div>

        {/* Request Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-3xl mx-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Book a Cleaning Service</h2>

            {success && (
              <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline"> Your cleaning request has been received. Our team will contact you soon!</span>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Space Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Space Size</label>
                  <select
                    name="space_size"
                    required
                    value={formData.space_size}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="small">Small Space</option>
                    <option value="medium">Medium Space</option>
                    <option value="large">Large Space</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Service Location</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={useCurrentLocation} className="px-3 py-2 border rounded-md">Use my current location</button>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search for a place"
                        value={placeQuery}
                        onChange={(e) => setPlaceQuery(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                      {isSearching && (
                        <div className="absolute right-2 top-2 text-xs text-gray-500">Searching...</div>
                      )}
                      {placeQuery && suggestions.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow">
                          {suggestions.map((s, idx) => (
                            <button
                              type="button"
                              key={`${s.lat}-${s.lon}-${idx}`}
                              className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, address: s.display_name, location: { lat: parseFloat(s.lat), lng: parseFloat(s.lon) } }));
                                setPlaceQuery(s.display_name);
                                setSuggestions([]);
                              }}
                            >
                              {s.display_name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="Selected address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Date & Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    name="service_date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.service_date}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                  {dateError && <p className="text-sm text-red-600 mt-1">{dateError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                  <input
                    type="time"
                    name="service_time"
                    required
                    value={formData.service_time}
                    onChange={(e) => onTimeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                  {timeError && <p className="text-sm text-red-600 mt-1">{timeError}</p>}
                </div>

                {/* Contact Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="contact_phone"
                    required
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="contact_email"
                    required
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Description</label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="Describe the cleaning service you need..."
                  />
                </div>

                {/* Additional Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="Any special instructions or requirements..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(initialState)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HireCleaners;