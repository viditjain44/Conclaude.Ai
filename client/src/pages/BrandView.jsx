import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchBrandStats, fetchConversations } from "../services/api";
import ConversationList from "../components/ConversationLIst";
import Charts from "../components/Charts";

// Import your 3 new components
import FAQGen from "../components/FAQGen";
import SystemPromptGen from "../components/SystemPromptGen";
import TrainingExporter from "../components/TrainingExporter";

function BrandView() {
  const { widgetId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tab State: 'analysis' or 'optimize'
  const [activeTab, setActiveTab] = useState("analysis");

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, convsRes] = await Promise.all([
          fetchBrandStats(widgetId),
          fetchConversations(widgetId),
        ]);
        setStats(statsRes.data.data);
        setConversations(convsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [widgetId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading brand data...</p>
        </div>
      </div>
    );
  }

  const frustrated = conversations.filter((c) => c.status === "frustrated").length;
  const droppedOff = conversations.filter((c) => c.status === "dropped_off").length;
  const resolved = conversations.filter((c) => c.status === "resolved").length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 transition-colors"
      >
        ← Back to Brands
      </button>

      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Brand Dashboard</h1>
          <p className="text-gray-500 font-mono text-sm">{widgetId}</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
          <button 
            onClick={() => setActiveTab("analysis")}
            className={`px-4 py-2 rounded-md text-sm transition-all ${activeTab === "analysis" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab("optimize")}
            className={`px-4 py-2 rounded-md text-sm transition-all ${activeTab === "optimize" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
          >
            AI Optimization
          </button>
        </div>
      </div>

      {activeTab === "analysis" ? (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Total Conversations</p>
                <p className="text-3xl font-bold text-white">{stats.totalConversations}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Total Messages</p>
                <p className="text-3xl font-bold text-white">{stats.totalMessages}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Avg Messages/Conv</p>
                <p className="text-3xl font-bold text-white">{stats.avgMessagesPerConversation}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Product Views</p>
                <p className="text-3xl font-bold text-white">{stats.productViews}</p>
              </div>
            </div>
          )}

          <div className="mb-10">
            <Charts frustrated={frustrated} droppedOff={droppedOff} resolved={resolved} stats={stats} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">All Conversations ({conversations.length})</h2>
            <ConversationList conversations={conversations} />
          </div>
        </>
      ) : (
        /* AI OPTIMIZATION TAB */
        <div className="space-y-8 animate-in fade-in duration-500">
          <SystemPromptGen widgetId={widgetId} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FAQGen widgetId={widgetId} />
            <TrainingExporter widgetId={widgetId} />
          </div>
        </div>
      )}
    </div>
  );
}

export default BrandView;