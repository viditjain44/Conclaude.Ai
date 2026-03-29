import { useEffect, useState } from "react";
import { fetchBrands } from "../services/api";
import BrandCard from "../components/BrandCard";

function Home() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const res = await fetchBrands();
        setBrands(res.data.data);
      } catch (err) {
        setError("Failed to load brands");
      } finally {
        setLoading(false);
      }
    };
    loadBrands();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading brands...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">
          Helio Insights 🔍
        </h1>
        <p className="text-gray-400 text-lg">
          AI-powered conversation analysis across all brands
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm">Total Brands</p>
          <p className="text-3xl font-bold text-white">{brands.length}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm">Total Conversations</p>
          <p className="text-3xl font-bold text-white">
            {brands.reduce((acc, b) => acc + b.totalConversations, 0)}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm">Date Range</p>
          <p className="text-xl font-bold text-white">Mar 2026</p>
        </div>
      </div>

      {/* Brand Cards */}
      <h2 className="text-xl font-semibold text-gray-300 mb-6">
        Select a Brand to Analyze
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {brands.map((brand, index) => (
          <BrandCard key={brand._id} brand={brand} index={index} />
        ))}
      </div>
    </div>
  );
}

export default Home;