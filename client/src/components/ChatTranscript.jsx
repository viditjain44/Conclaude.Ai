function ChatTranscript({ messages }) {
  const textMessages = messages.filter((m) => m.messageType === "text");
  const eventMessages = messages.filter((m) => m.messageType === "event");
    const cleanAgentText = (text) => {
  if (!text) return "";
  
  // "End of stream..." aur uske baad sab kuch remove karo
  text = text.replace(/End of stream[\s\S]*/gi, "").trim();
  
  // Koi bhi JSON object jo accidentally aa gaya ho
  text = text.replace(/\{[\s\S]*"type"[\s\S]*\}/g, "").trim();
  
  // Markdown bold (**text**) ko clean text mein convert karo
  text = text.replace(/\*\*(.*?)\*\*/g, "$1");
  
  return text;
};
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4 max-h-[600px] overflow-y-auto">
      {textMessages.map((msg) => (
        <div
          key={msg._id}
          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.sender === "user"
                ? "bg-blue-600 text-white rounded-br-sm"
                : "bg-gray-800 text-gray-100 rounded-bl-sm"
            }`}
          >
            <p className="text-xs font-semibold mb-1 opacity-70">
              {msg.sender === "user" ? "👤 User" : "🤖 Assistant"}
            </p>
            <p className="leading-relaxed whitespace-pre-wrap">
  {msg.sender === "agent" ? cleanAgentText(msg.text) : msg.text}
</p>
            <p className="text-xs opacity-40 mt-1 text-right">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}

      {/* Events */}
      {eventMessages.length > 0 && (
        <div className="border-t border-gray-800 pt-4">
          <p className="text-gray-500 text-xs mb-2">User Interactions</p>
          {eventMessages.map((e) => (
            <div
              key={e._id}
              className="text-xs text-gray-400 bg-gray-800/50 rounded-lg px-3 py-2 mb-2"
            >
              🖱️ {e.metadata?.eventType || "event"} —{" "}
              {new Date(e.timestamp).toLocaleTimeString()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatTranscript;