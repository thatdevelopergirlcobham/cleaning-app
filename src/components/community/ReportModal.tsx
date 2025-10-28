// src/components/community/ReportModal.tsx
import React, { useState, useEffect, useCallback } from "react";
import type { ReportInsert } from "../../api/reports";
import { getCurrentLocation, searchLocations } from "../../utils/locationUtils";
import { FiMapPin, FiSearch, FiCrosshair, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";

type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReportInsert) => Promise<void> | void;
};

type ReportSubmitData = Omit<ReportInsert, "id" | "created_at" | "updated_at">;

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<ReportSubmitData>({
    title: "",
    description: "",
    location: "",
    latitude: null,
    longitude: null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch location suggestions");
    }
  }, [searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => handleSearch(), 400);
    return () => clearTimeout(timeout);
  }, [searchQuery, handleSearch]);

  const handleLocationSelect = (loc: string) => {
    setFormData((prev) => ({ ...prev, location: loc }));
    setSearchResults([]);
  };

  const handleUseMyLocation = async () => {
    setLoadingLocation(true);
    try {
      const loc = await getCurrentLocation();
      if (loc) {
        setFormData((prev) => ({
          ...prev,
          location: loc.name,
          latitude: loc.latitude,
          longitude: loc.longitude,
        }));
        toast.success("Location added successfully");
      } else {
        toast.error("Unable to retrieve location");
      }
    } catch {
      toast.error("Failed to access current location");
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoadingSubmit(true);
    try {
      await onSubmit(formData);
      toast.success("Report submitted successfully");
      onClose();
      setFormData({
        title: "",
        description: "",
        location: "",
        latitude: null,
        longitude: null,
      });
    } catch (error) {
      console.error(error);
      toast.error("Error submitting report");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Submit a Community Report
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full mt-1 border rounded-lg p-2 focus:ring focus:ring-blue-300 outline-none"
              placeholder="Enter report title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full mt-1 border rounded-lg p-2 focus:ring focus:ring-blue-300 outline-none"
              placeholder="Describe the issue"
              rows={3}
            />
          </div>

          {/* Location Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={formData.location || searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a location"
                  className="w-full border rounded-lg pl-9 p-2 focus:ring focus:ring-blue-300 outline-none"
                />
                {searchResults.length > 0 && (
                  <ul className="absolute bg-white border rounded-lg mt-1 w-full shadow-md z-10 max-h-32 overflow-y-auto">
                    {searchResults.map((loc, idx) => (
                      <li
                        key={idx}
                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                        onClick={() => handleLocationSelect(loc)}
                      >
                        {loc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="button"
                onClick={handleUseMyLocation}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                disabled={loadingLocation}
                title="Use my current location"
              >
                {loadingLocation ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <FiCrosshair />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingSubmit}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            {loadingSubmit ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
