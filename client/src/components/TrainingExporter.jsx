import React, { useState } from "react";
import { fetchTrainingDataExporter } from "../services/api";

const TrainingExporter = ({ widgetId }) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetchTrainingDataExporter(widgetId);
      const data = res.data.data;
      
      // Update local stats so the user sees what was found
      setStats({ totalPairs: data.totalPairs });

      // Create a blob and trigger download
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `training_data_${widgetId}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export training data. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="box-archive" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Training Data Exporter</h2>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Download high-quality resolved conversation pairs to fine-tune your LLM or build a custom knowledge base.
        </p>

        {stats && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Pairs Extracted:</span>
              <span className="text-green-400 font-mono font-bold">{stats.totalPairs}</span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleExport}
        disabled={loading}
        className="w-full bg-gray-100 hover:bg-white text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5m0 0l5-5m-5 5V3" />
            </svg>
            Export JSON Dataset
          </>
        )}
      </button>
    </div>
  );
};

export default TrainingExporter;