import React, { useState } from "react";
import { fetchFAQGenerator } from "../services/api";

const FAQGen = ({ widgetId }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetchFAQGenerator(widgetId);
      setFaqs(res.data.data.faqs);
    } catch (err) {
      console.error("FAQ Generation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111827] p-6 rounded-lg border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">AI Knowledge Base (FAQs)</h2>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition"
        >
          {loading ? "Analyzing Chats..." : "✨ Generate FAQs"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-[#1f2937] p-4 rounded-md border-l-4 border-blue-500">
            <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">
              {faq.category}
            </span>
            <p className="font-semibold text-gray-100 mt-2">Q: {faq.question}</p>
            <p className="text-gray-400 text-sm mt-1">A: {faq.answer}</p>
          </div>
        ))}
        {!loading && faqs.length === 0 && (
          <p className="text-gray-500 text-center py-10">No FAQs generated yet. Click the button to analyze chat history.</p>
        )}
      </div>
    </div>
  );
};

export default FAQGen;