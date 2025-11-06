// src/components/community/ReportModal.tsx
import React, { useState, useRef } from "react";
import { FiX, FiMapPin, FiUpload, FiLoader, FiCrosshair } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CLOUDINARY_ENDPOINT = "https://clean-cal-api.vercel.app/upload";
const SUPABASE_URL = "https://hajgpcqbfougojrpaprr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhamdwY3FiZm91Z29qcnBhcHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0Njc1MjksImV4cCI6MjA3NjA0MzUyOX0.JcY366RLPTKNCmv19lKcKVJZE1fpTv3VeheDwXRGchY";


type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("other");
  const [priority, setPriority] = useState("medium");
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  function generateUUID(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID)
      return crypto.randomUUID();
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
      16,
      20
    )}-${hex.slice(20)}`;
  }

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
          setLocation(addr);
          toast.success("Location fetched successfully");
        } catch {
          setLocation(`${lat}, ${lng}`);
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

      const payload = {
        title,
        description,
        image_url: imageUrl,
        user_id: generateUUID(),
        status: "pending",
        category,
        priority,
        location,
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: "Bearer " + SUPABASE_ANON_KEY,
          Prefer: "return=representation",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text);
      toast.success("Report submitted successfully");

      setTitle("");
      setDescription("");
      setImageUrl("");
      setPreviewUrl("");
      setLocation("");
      setCategory("other");
      setPriority("medium");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    } catch (err) {
      const error = err as Error;
      toast.error("Submission failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Create Report</h2>
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
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter or fetch location"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
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
                  <FiUpload /> Submit Report
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
