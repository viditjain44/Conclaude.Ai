import React, { useState } from "react";
import { fetchSystemPromptGenerator } from "../services/api";

const SystemPromptGen = ({ widgetId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSystemPromptGenerator(widgetId);
      // Accessing the data nested inside Axios response and your Express success wrapper
      const result = res.data?.data;
      
      if (result) {
        setData(result);
      } else {
        setError("No data returned from AI service.");
      }
    } catch (err) {
      console.error("Frontend Error:", err);
      setError("Failed to connect to the AI service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 transition-all">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">AI Persona Optimizer</h2>
          <p className="text-gray-400 text-sm">
            Fix chatbot behavior based on failed conversations.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Analyzing...
            </>
          ) : (
            "✨ Generate New Prompt"
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
          {/* Key Improvements Section */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
              Key Improvements
            </h3>
            <div className="space-y-2">
              {data.keyImprovements?.length > 0 ? (
                data.keyImprovements.map((item, i) => (
                  <div
                    key={i}
                    className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-sm text-gray-300"
                  >
                    ✅ {item}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-xs italic">No specific improvements listed.</p>
              )}
            </div>
          </div>

          {/* Prompt Section */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2">
              Optimized System Prompt
            </h3>
            <div className="relative group">
              <pre className="bg-black p-4 rounded-lg text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap border border-gray-800 h-64 scrollbar-thin scrollbar-thumb-gray-700">
                {data.systemPrompt || "No prompt content generated."}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(data.systemPrompt);
                  alert("Prompt copied to clipboard!");
                }}
                className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white text-[10px] px-3 py-1.5 rounded border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemPromptGen;