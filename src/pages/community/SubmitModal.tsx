// src/components/SubmitIdeaModal.tsx
import React, { useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useToast } from "../../contexts/ToastContext";

type SubmitIdeaModalProps = {
  onClose: () => void;
};

export default function SubmitIdeaModal({ onClose }: SubmitIdeaModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [materials, setMaterials] = useState("");
  const [category, setCategory] = useState("Plastics");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("upcycling_ideas").insert([
      {
        title,
        description,
        materials: materials.split(",").map((m) => m.trim()),
        category,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      addToast({ type: 'error', title: 'Failed to submit idea', message: error.message || 'Please try again' });
    } else {
      addToast({ type: 'success', title: 'Idea submitted', message: 'Pending approval' });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white text-black rounded-2xl shadow-lg p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-semibold mb-4 text-green-700">
          Submit Your Upcycling Idea
        </h2>

        <input
          type="text"
          placeholder="Title"
          className="w-full border p-2 rounded-lg mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Describe your idea..."
          className="w-full border p-2 rounded-lg mb-3"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Materials (comma-separated)"
          className="w-full border p-2 rounded-lg mb-3"
          value={materials}
          onChange={(e) => setMaterials(e.target.value)}
          required
        />

        <select
          className="w-full border p-2 rounded-lg mb-4"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Plastics</option>
          <option>Metals</option>
          <option>Textiles</option>
          <option>Other</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-2 font-medium"
        >
          {loading ? "Submitting..." : "Submit Idea"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2 border rounded-xl py-2 text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
