const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Brand ke liye AI insights generate karo
const generateBrandInsights = async (brandData) => {
  const { stats, conversations, patterns } = brandData;

  const sampleConvos = conversations.slice(0, 10).map((conv) => ({
    messages: conv.messages
      .filter((m) => m.messageType === "text")
      .map((m) => `${m.sender}: ${m.text}`)
      .join("\n"),
    status: patterns.conversationStatuses[conv._id],
  }));

  const prompt = `You are analyzing an AI shopping assistant's conversation data for a brand.

STATS:
- Total Conversations: ${stats.totalConversations}
- Avg Messages per Conversation: ${stats.avgMessagesPerConversation}
- Product Views: ${stats.productViews}
- Frustrated Conversations: ${patterns.frustratedCount}
- Dropped Off Conversations: ${patterns.droppedOffCount}
- Poor Response Rate: ${patterns.avgPoorResponseRate}%

SAMPLE CONVERSATIONS:
${sampleConvos
  .map(
    (c, i) => `
Conversation ${i + 1} (${c.status}):
${c.messages}
---`
  )
  .join("\n")}

Based on this data, provide actionable insights in this exact JSON format:
{
  "brandHealth": "good/average/poor",
  "healthScore": <number 0-100>,
  "topIssues": [
    {"issue": "...", "impact": "high/medium/low", "recommendation": "..."}
  ],
  "strengths": ["...", "..."],
  "summary": "2-3 sentence executive summary of brand performance"
}

Return ONLY the JSON, no extra text, no markdown backticks.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1000,
  });

  const text = response.choices[0].message.content;

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return { summary: text };
};

// Single conversation ka AI analysis
const analyzeConversation = async (conversation) => {
  const textMessages = conversation.messages
    .filter((m) => m.messageType === "text")
    .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
    .join("\n");

  const prompt = `Analyze this AI shopping assistant conversation and provide insights:

CONVERSATION:
${textMessages}

Provide analysis in this exact JSON format:
{
  "overallSentiment": "positive/neutral/negative",
  "wasResolved": true/false,
  "issues": [
    {"type": "hallucination/poor_response/irrelevant_product/unanswered", "description": "..."}
  ],
  "assistantPerformance": "good/average/poor",
  "keyMoment": "The most critical moment in this conversation",
  "recommendation": "One specific thing the assistant should have done differently"
}

Return ONLY the JSON, no extra text, no markdown backticks.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 500,
  });

  const text = response.choices[0].message.content;

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return { summary: text };
};

module.exports = { generateBrandInsights, analyzeConversation };