const express = require("express");
const router = express.Router();
const { getConversationsByBrand, getConversationById } = require("../services/analytics");
const { getConversationStatus, detectFrustration, checkResponseQuality } = require("../services/patternDetector");

// GET /api/conversations/:widgetId — brand ki saari conversations
router.get("/:widgetId", async (req, res) => {
  try {
    const { widgetId } = req.params;
    const conversations = await getConversationsByBrand(widgetId);

    // Har conversation ke liye status add karo
    const enriched = conversations.map((conv) => {
      const status = getConversationStatus(conv.messages);
      const frustration = detectFrustration(conv.messages);
      const quality = checkResponseQuality(conv.messages);
      const firstUserMsg = conv.messages.find(
        (m) => m.sender === "user" && m.messageType === "text"
      );

      return {
        _id: conv._id,
        widgetId: conv.widgetId,
        createdAt: conv.createdAt,
        messageCount: conv.messages.filter((m) => m.messageType === "text").length,
        status,
        frustrationSignals: frustration.signals,
        poorResponseRate: quality.poorResponseRate,
        preview: firstUserMsg?.text?.slice(0, 80) || "No message",
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/conversations/detail/:conversationId — single conversation
router.get("/detail/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await getConversationById(conversationId);

    if (!conversation) {
      return res.status(404).json({ success: false, error: "Conversation not found" });
    }

    const status = getConversationStatus(conversation.messages);
    const frustration = detectFrustration(conversation.messages);
    const quality = checkResponseQuality(conversation.messages);

    res.json({
      success: true,
      data: {
        ...conversation,
        status,
        frustrationSignals: frustration.signals,
        quality,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;