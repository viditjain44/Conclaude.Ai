const sentimentConfig = {
  positive: { color: "text-green-400", icon: "😊" },
  neutral: { color: "text-yellow-400", icon: "😐" },
  negative: { color: "text-red-400", icon: "😞" },
};

const performanceConfig = {
  good: { color: "text-green-400", bg: "bg-green-500/20", icon: "✅" },
  average: { color: "text-yellow-400", bg: "bg-yellow-500/20", icon: "⚠️" },
  poor: { color: "text-red-400", bg: "bg-red-500/20", icon: "❌" },
};

function InsightPanel({ insights, loading, conversation }) {
  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Analyzing with Gemini AI...</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-4 bg-gray-800 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p className="text-gray-400">No insights available</p>
      </div>
    );
  }

  const sentiment = sentimentConfig[insights.overallSentiment] || sentimentConfig.neutral;
  const performance = performanceConfig[insights.assistantPerformance] || performanceConfig.average;

  return (
    <div className="space-y-4">
      {/* Sentiment & Performance */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Sentiment</p>
          <p className={`text-lg font-bold ${sentiment.color}`}>
            {sentiment.icon} {insights.overallSentiment}
          </p>
        </div>
        <div className={`border border-gray-800 rounded-xl p-4 ${performance.bg}`}>
          <p className="text-gray-400 text-xs mb-1">Performance</p>
          <p className={`text-lg font-bold ${performance.color}`}>
            {performance.icon} {insights.assistantPerformance}
          </p>
        </div>
      </div>

      {/* Resolved */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-gray-400 text-xs mb-1">Was Resolved?</p>
        <p className={`font-bold ${insights.wasResolved ? "text-green-400" : "text-red-400"}`}>
          {insights.wasResolved ? "✅ Yes" : "❌ No"}
        </p>
      </div>

      {/* Issues */}
      {insights.issues && insights.issues.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-3">Issues Detected</p>
          <div className="space-y-2">
            {insights.issues.map((issue, i) => (
              <div
                key={i}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
              >
                <p className="text-red-400 text-xs font-semibold uppercase mb-1">
                  ⚠️ {issue.type}
                </p>
                <p className="text-gray-300 text-sm">{issue.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Moment */}
      {insights.keyMoment && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-2">🎯 Key Moment</p>
          <p className="text-white text-sm">{insights.keyMoment}</p>
        </div>
      )}

      {/* Recommendation */}
      {insights.recommendation && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-400 text-xs mb-2">💡 Recommendation</p>
          <p className="text-white text-sm">{insights.recommendation}</p>
        </div>
      )}
    </div>
  );
}

export default InsightPanel;