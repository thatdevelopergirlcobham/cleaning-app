// src/components/community/ReportModal.tsx
import React, { useState, useRef } from "react";
import { FiX, FiMapPin, FiUpload, FiLoader, FiCrosshair } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LocationAutocomplete from "../common/LocationAutocomplete";

const CLOUDINARY_ENDPOINT = "https://clean-cal-api.vercel.app/upload";


type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  initialData?: {
    title?: string;
    description?: string;
    category?: string;
    priority?: string;
    image_url?: string;
    location?: { lat: number; lng: number; address?: string } | string;
  };
  onSubmit: (data: {
    title: string;
    description: string;
    category: string;
    priority: string;
    image_url: string;
    location: { lat: number; lng: number; address?: string } | string;
  }) => Promise<void>;
};

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, mode = 'create', initialData, onSubmit }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "other");
  const [priority, setPriority] = useState(initialData?.priority || "medium");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [previewUrl, setPreviewUrl] = useState(initialData?.image_url || "");
  const [locationObj, setLocationObj] = useState<{ lat: number; lng: number; address?: string } | null>(
    typeof initialData?.location === 'object' && initialData?.location ? initialData.location as any : null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // submit is delegated to parent via onSubmit

  async function uploadImage(file: File) {
    if (!file) return;
    try {
      setIsUploading(true);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      const fd = new FormData();
      fd.append("image", file, file.name);

      const res = await fetch(CLOUDINARY_ENDPOINT, { method: "POST", body: fd });
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      const json = JSON.parse(text || "{}");
      const url =
        json.url ||
        json.secure_url ||
        json.data?.url ||
        json.data?.secure_url;

      if (!url) throw new Error("Upload returned no URL");
      setImageUrl(url);
      toast.success("Image uploaded successfully");
    } catch (err) {
      const error = err as Error;
      toast.error("Image upload failed: " + error.message);
      setImageUrl("");
      setPreviewUrl("");
    } finally {
      setIsUploading(false);
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadImage(file);
  };

  async function getCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    toast.info("Fetching location...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await response.json();
          const addr = data.display_name || `${lat}, ${lng}`;
          setLocationObj({ lat, lng, address: addr });
          toast.success("Location fetched successfully");
        } catch {
          setLocationObj({ lat, lng });
          toast.info("Using coordinates as location");
        }
      },
      () => toast.error("Unable to fetch your location")
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isUploading) return toast.error("Please wait for upload to finish");
    if (!imageUrl) return toast.error("Please upload an image first");
    if (!title || !description) return toast.error("Title and description required");

    try {
      setIsSubmitting(true);
      await onSubmit({
        title,
        description,
        category,
        priority,
        image_url: imageUrl,
        location: locationObj || "",
      });
      toast.success(mode === 'edit' ? "Report updated successfully" : "Report submitted successfully");

      setTitle("");
      setDescription("");
      setImageUrl("");
      setPreviewUrl("");
      setLocationObj(null);
      setCategory("other");
      setPriority("medium");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    } catch (err) {
      const error = err as Error;
      toast.error((mode === 'edit' ? "Update failed: " : "Submission failed: ") + error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-900">{mode === 'edit' ? 'Edit Report' : 'Create Report'}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1 -mr-2"
              disabled={isSubmitting}
            >
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter a descriptive title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe the issue in detail"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                  <div className="pl-10">
                    <LocationAutocomplete
                      value={locationObj?.address || ''}
                      onChange={(loc) => setLocationObj({ lat: loc.lat, lng: loc.lng, address: loc.address })}
                      placeholder="Enter or search location"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-green-50 text-green-700 transition"
                  title="Use my current location"
                >
                  <FiCrosshair />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="other">Other</option>
                  <option value="illegal_dumping">Illegal Dumping</option>
                  <option value="overflowing_bin">Overflowing Bin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  {/* <option value="urgent">Urgent</option> */}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="border p-2 rounded w-full"
                />
                {isUploading && <FiLoader className="animate-spin text-green-600" />}
              </div>
              {previewUrl && (
                <div className="mt-3">
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="rounded-lg border w-40 h-28 object-cover"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="bg-green-700 text-white px-4 py-2 rounded-lg mt-4 w-full flex items-center justify-center gap-2 hover:bg-green-800 transition"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <FiUpload /> {mode === 'edit' ? 'Save Changes' : 'Submit Report'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
