import { useNavigate } from "react-router-dom";

const brandNames = ["Brand Alpha", "Brand Beta", "Brand Gamma"];
const brandColors = [
  "from-blue-600 to-blue-800",
  "from-purple-600 to-purple-800",
  "from-emerald-600 to-emerald-800",
];
const brandIcons = ["🧴", "💊", "🏋️"];

function BrandCard({ brand, index }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/brand/${brand._id}`)}
      className="cursor-pointer bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 hover:scale-105 transition-all duration-200"
    >
      {/* Icon */}
      <div
        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${brandColors[index % 3]} flex items-center justify-center text-2xl mb-4`}
      >
        {brandIcons[index % 3]}
      </div>

      {/* Name */}
      <h3 className="text-xl font-bold text-white mb-1">
        {brandNames[index % 3]}
      </h3>
      <p className="text-gray-500 text-xs mb-4 font-mono">
        {brand._id.slice(0, 16)}...
      </p>

      {/* Stats */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400 text-sm">Conversations</span>
          <span className="text-white font-semibold">
            {brand.totalConversations}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400 text-sm">Last Active</span>
          <span className="text-white font-semibold text-sm">
            {new Date(brand.lastSeen).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 w-full bg-gray-800 hover:bg-gray-700 text-white text-center py-2 rounded-lg text-sm font-medium transition-colors">
        Analyze Brand →
      </div>
    </div>
  );
}

export default BrandCard;