import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchConversationDetail,
  fetchConversationInsights,
} from "../services/api";
import ChatTranscript from "../components/ChatTranscript";
import InsightPanel from "../components/InsightPanel";

function ConversationView() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchConversationDetail(conversationId);
        setConversation(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [conversationId]);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const res = await fetchConversationInsights(conversationId);
        setInsights(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingInsights(false);
      }
    };
    loadInsights();
  }, [conversationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 transition-colors"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          Conversation Deep Dive
        </h1>
        <p className="text-gray-500 font-mono text-sm">{conversationId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Transcript */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            💬 Chat Transcript
          </h2>
          {conversation && (
            <ChatTranscript messages={conversation.messages} />
          )}
        </div>

        {/* AI Insights */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            🤖 AI Analysis
          </h2>
          <InsightPanel
            insights={insights}
            loading={loadingInsights}
            conversation={conversation}
          />
        </div>
      </div>
    </div>
  );
}

export default ConversationView;