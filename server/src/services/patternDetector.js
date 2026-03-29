// Frustration detect karo ek conversation mein
const detectFrustration = (messages) => {
  const textMessages = messages.filter((m) => m.messageType === "text");
  const userMessages = textMessages.filter((m) => m.sender === "user");

  const signals = [];

  // Signal 1: User ne same cheez repeat ki
  const userTexts = userMessages.map((m) => m.text?.toLowerCase() || "");
  for (let i = 0; i < userTexts.length; i++) {
    for (let j = i + 1; j < userTexts.length; j++) {
      const similarity = getSimilarity(userTexts[i], userTexts[j]);
      if (similarity > 0.6) {
        signals.push("User repeated similar question");
        break;
      }
    }
  }

  // Signal 2: Frustration words
  const frustrationWords = [
    "not helpful",
    "wrong",
    "useless",
    "bad",
    "disappointed",
    "terrible",
    "worst",
    "doesn't work",
    "not working",
    "again",
    "still",
    "why",
    "!!",
    "???",
  ];

  userMessages.forEach((m) => {
    const text = m.text?.toLowerCase() || "";
    frustrationWords.forEach((word) => {
      if (text.includes(word)) {
        signals.push(`Frustration word detected: "${word}"`);
      }
    });
  });

  // Signal 3: Very short angry replies
  const shortAngryReplies = userMessages.filter(
    (m) => m.text && m.text.length < 15 && m.text.includes("?")
  );
  if (shortAngryReplies.length > 1) {
    signals.push("Multiple short impatient replies");
  }

  return {
    isFrustrated: signals.length > 0,
    signals: [...new Set(signals)],
  };
};

// Drop-off detect karo
const detectDropOff = (messages) => {
  const textMessages = messages.filter((m) => m.messageType === "text");
  if (textMessages.length === 0) return false;

  const lastMessage = textMessages[textMessages.length - 1];

  // Agar last message user ka hai — agent ne reply nahi kiya
  return lastMessage.sender === "user";
};

// Agent response quality check
const checkResponseQuality = (messages) => {
  const agentMessages = messages.filter(
    (m) => m.messageType === "text" && m.sender === "agent"
  );

  const poorResponses = agentMessages.filter((m) => {
    const text = m.text || "";
    // Too short
    if (text.length < 30) return true;
    // Generic phrases
    const genericPhrases = [
      "i don't know",
      "i'm not sure",
      "please contact",
      "i cannot",
      "i am unable",
    ];
    return genericPhrases.some((p) => text.toLowerCase().includes(p));
  });

  return {
    totalAgentReplies: agentMessages.length,
    poorResponseCount: poorResponses.length,
    poorResponseRate:
      agentMessages.length > 0
        ? Math.round((poorResponses.length / agentMessages.length) * 100)
        : 0,
  };
};

// Conversation ka status determine karo
const getConversationStatus = (messages) => {
  const frustration = detectFrustration(messages);
  const droppedOff = detectDropOff(messages);

  if (frustration.isFrustrated) return "frustrated";
  if (droppedOff) return "dropped_off";
  return "resolved";
};

// Simple word similarity (Jaccard)
const getSimilarity = (str1, str2) => {
  const set1 = new Set(str1.split(" "));
  const set2 = new Set(str2.split(" "));
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
};

module.exports = {
  detectFrustration,
  detectDropOff,
  checkResponseQuality,
  getConversationStatus,
};