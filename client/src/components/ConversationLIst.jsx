import { useNavigate } from "react-router-dom";

const statusConfig = {
  resolved: {
    label: "Resolved",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    dot: "bg-green-400",
  },
  frustrated: {
    label: "Frustrated",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    dot: "bg-red-400",
  },
  dropped_off: {
    label: "Dropped Off",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    dot: "bg-yellow-400",
  },
};

function ConversationList({ conversations }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      {conversations.map((conv) => {
        const status = statusConfig[conv.status] || statusConfig.resolved;

        return (
          <div
            key={conv._id}
            onClick={() => navigate(`/conversation/${conv._id}`)}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-gray-600 transition-all duration-200 flex items-center justify-between gap-4"
          >
            {/* Left */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {conv.preview}
              </p>
              <p className="text-gray-500 text-xs mt-1 font-mono">
                {conv._id} · {new Date(conv.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-gray-400 text-xs">
                {conv.messageCount} msgs
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full border ${status.color}`}
              >
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${status.dot} mr-1`}
                ></span>
                {status.label}
              </span>
              <span className="text-gray-600">→</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ConversationList;