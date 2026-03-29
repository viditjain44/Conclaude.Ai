const express = require("express");
const router = express.Router();
const { getConversationById } = require("../services/analytics");
const { analyzeConversation } = require("../services/aiService");

// GET /api/insights/:conversationId — single conversation AI analysis
router.get("/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await getConversationById(conversationId);

    if (!conversation) {
      return res.status(404).json({ success: false, error: "Not found" });
    }

    const aiAnalysis = await analyzeConversation(conversation);

    res.json({ success: true, data: aiAnalysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;