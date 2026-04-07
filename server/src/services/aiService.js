const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


// Helper to extract JSON safely from LLM responses
const extractJSON = (text) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (e) {
    console.error("JSON Parse Error:", e);
    return null;
  }
};

// ─────────────────────────────────────────
// BRAND INSIGHTS
// ─────────────────────────────────────────
const generateBrandInsights = async (brandData) => {
  const { stats, conversations, patterns } = brandData;

  const sampleConvos = conversations.slice(0, 8).map((conv) => ({
    messages: conv.messages
      .filter((m) => m.messageType === "text")
      .slice(-4)
      .map((m) => `${m.sender}: ${m.text}`)
      .join("\n"),
    status: patterns.conversationStatuses[conv._id],
  }));

  const prompt = `Analyze chatbot performance.

STATS:
- Total: ${stats.totalConversations}
- Frustrated: ${patterns.frustratedCount}
- Dropped: ${patterns.droppedOffCount}

SAMPLES:
${sampleConvos.map((c, i) => `Conv ${i + 1} (${c.status}):\n${c.messages}`).join("\n---")}

Return JSON:
{
  "brandHealth": "good/average/poor",
  "healthScore": 0-100,
  "topIssues": [],
  "strengths": [],
  "summary": "..."
}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 800,
  });

  const text = response.choices[0].message.content;
  return extractJSON(text) || {
    summary: text,
    brandHealth: "average",
    healthScore: 50,
    topIssues: [],
    strengths: [],
  };
};

// ─────────────────────────────────────────
// SINGLE CONVERSATION ANALYSIS
// ─────────────────────────────────────────
const analyzeConversation = async (conversation) => {
  const textMessages = conversation.messages
    .filter((m) => m.messageType === "text")
    .slice(-8)
    .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
    .join("\n");

  const prompt = `Analyze conversation:

${textMessages}

Return JSON:
{
  "overallSentiment": "",
  "wasResolved": true/false,
  "issues": [],
  "assistantPerformance": "",
  "keyMoment": "",
  "recommendation": ""
}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 500,
  });

  const text = response.choices[0].message.content;
  return extractJSON(text) || {
    assistantPerformance: "poor",
    recommendation: "Check logs.",
  };
};

// ─────────────────────────────────────────
// SYSTEM PROMPT GENERATOR (FIXED)
// ─────────────────────────────────────────
const generateSystemPrompt = async (conversations) => {
  const shuffled = [...conversations].sort(() => 0.5 - Math.random());
  const selectedConvs = shuffled.slice(0, 5);

  let badConvos = selectedConvs
    .map((conv) =>
      conv.messages
        .filter((m) => m.messageType === "text")
        .slice(-3)
        .map((m) => `${m.sender}: ${m.text}`)
        .join("\n")
    )
    .join("\n---\n");

  // HARD LIMIT
  if (badConvos.length > 8000) {
    badConvos = badConvos.slice(0, 8000);
  }

  const prompt = `Improve chatbot system prompt.

Conversations:
${badConvos}

Return JSON:
{
  "systemPrompt": "short and effective prompt",
  "keyImprovements": []
}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    max_tokens: 800,
  });

  const text = response.choices[0].message.content;
  return extractJSON(text) || {
    systemPrompt: text,
    keyImprovements: ["Improved clarity", "Reduced verbosity"],
  };
};

// ─────────────────────────────────────────
// FAQ GENERATOR (FIXED)
// ─────────────────────────────────────────
const generateFAQs = async (conversations) => {
  const shuffled = [...conversations].sort(() => 0.5 - Math.random());
  const randomConvs = shuffled.slice(0, 5);

  let allUserMessages = randomConvs
    .flatMap((conv) =>
      conv.messages
        .filter((m) => m.messageType === "text" && m.sender === "user")
        .slice(-3)
    )
    .map((m) => m.text)
    .filter(Boolean)
    .join("\n");

  if (allUserMessages.length > 12000) {
    allUserMessages = allUserMessages.slice(0, 12000);
  }

  const prompt = `Generate FAQs:

${allUserMessages}

Return JSON:
{
  "faqs": [
    {"question": "...", "answer": "...", "category": ""}
  ]
}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 800,
  });

  const text = response.choices[0].message.content;
  return extractJSON(text) || { faqs: [] };
};

// ─────────────────────────────────────────
// TRAINING DATA
// ─────────────────────────────────────────
const generateTrainingData = async (conversations) => {
  const goodConvos = conversations
    .filter((conv) => {
      const msgs = conv.messages.filter((m) => m.messageType === "text");
      return msgs.length && msgs[msgs.length - 1].sender === "agent";
    })
    .slice(0, 15);

  const trainingPairs = [];

  goodConvos.forEach((conv) => {
    const msgs = conv.messages.filter((m) => m.messageType === "text");

    for (let i = 0; i < msgs.length - 1; i++) {
      if (msgs[i].sender === "user" && msgs[i + 1].sender === "agent") {
        const clean = msgs[i + 1].text.replace(/End of stream.*/gi, "").trim();

        if (msgs[i].text.length > 5 && clean.length > 20) {
          trainingPairs.push({
            input: msgs[i].text,
            output: clean,
          });
        }
      }
    }
  });

  return {
    totalPairs: trainingPairs.length,
    trainingData: trainingPairs,
  };
};

module.exports = {
  generateBrandInsights,
  analyzeConversation,
  generateSystemPrompt,
  generateFAQs,
  generateTrainingData,
};