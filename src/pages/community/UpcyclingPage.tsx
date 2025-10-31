import { useState } from "react";
import { motion } from "framer-motion";
import { Recycle, Lightbulb, Leaf, Hammer } from "lucide-react";
import SubmitIdeaModal from './SubmitModal';

const upcyclingIdeas = [
  {
    id: 1,
    title: "Plastic Bottle Planters",
    description:
      "Transform plastic bottles into beautiful flower pots. Cut, paint, and decorate them to bring greenery into your home.",
    materials: ["Plastic bottles", "Scissors", "Paint", "Soil", "Plants"],
    category: "Plastics",
    icon: <Leaf className="text-green-600 w-6 h-6" />,
  },
  {
    id: 2,
    title: "Tin Can Lanterns",
    description:
      "Turn used tin cans into charming lanterns. Punch small holes to create patterns, paint, and place a candle or LED inside.",
    materials: ["Tin cans", "Hammer & nail", "Paint", "Candle/LED light"],
    category: "Metals",
    icon: <Hammer className="text-yellow-600 w-6 h-6" />,
  },
  {
    id: 3,
    title: "Eco Brick Furniture",
    description:
      "Use eco bricks (plastic bottles filled with compacted non-recyclables) to build stools or garden benches.",
    materials: ["Eco bricks", "Cushion", "Tape/Glue"],
    category: "Plastics",
    icon: <Recycle className="text-blue-600 w-6 h-6" />,
  },
  {
    id: 4,
    title: "Old Clothes Tote Bags",
    description:
      "Repurpose worn-out clothes into durable shopping bags. A creative way to reduce textile waste.",
    materials: ["Old clothes", "Needle & thread", "Scissors"],
    category: "Textiles",
    icon: <Lightbulb className="text-amber-500 w-6 h-6" />,
  },
];

export default function UpcyclingPage() {
  const [filter, setFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredIdeas =
    filter === "All"
      ? upcyclingIdeas
      : upcyclingIdeas.filter((idea) => idea.category === filter);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1E293B] p-6 md:p-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <motion.h1
          className="font-outfit text-4xl font-bold text-green-600 mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ♻️ Upcycling Ideas
        </motion.h1>
        <p className="text-gray-600">
          Give waste a second life! Explore creative ways to turn everyday
          materials into useful, eco-friendly items.
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center flex-wrap gap-3 mb-10">
        {["All", "Plastics", "Metals", "Textiles"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
              filter === cat
                ? "bg-green-600 text-white shadow-md"
                : "bg-green-900 text-white border"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Upcycling Ideas Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIdeas.map((idea, index) => (
          <motion.div
            key={idea.id}
            className="bg-green-900 rounded-2xl shadow-sm hover:shadow-md transition p-6 border border-gray-100"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              {idea.icon}
              <h2 className="font-semibold text-lg text-lime-500">
                {idea.title}
              </h2>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              {idea.description}
            </p>
            <h3 className="text-xs uppercase text-gray-200 mb-2">
              Materials Needed
            </h3>
            <ul className="text-sm list-disc list-inside text-gray-200">
              {idea.materials.map((mat, i) => (
                <li key={i}>{mat}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        className="mt-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-semibold mb-3">
          Have your own upcycling idea?
        </h2>
        <p className="text-gray-600 mb-5">
          Share your creativity and inspire the CleanCal community to make Calabar
          greener and cleaner!
        </p>
        <div className="mt-8">
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-2xl shadow-sm"
            onClick={() => setIsModalOpen(true)}
          >
            Submit Your Idea
          </button>

          {isModalOpen && <SubmitIdeaModal onClose={() => setIsModalOpen(false)} />}
        </div>
      </motion.div>
    </div>
  );
}
