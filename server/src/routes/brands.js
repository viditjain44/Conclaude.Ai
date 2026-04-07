const express = require("express");
const router = express.Router();
const { getAllBrands, getBrandStats, getConversationsByBrand } = require("../services/analytics");
const { 
  detectFrustration, 
  detectDropOff, 
  checkResponseQuality, 
  getConversationStatus 
} = require("../services/patternDetector");
const { 
  generateBrandInsights, 
  generateSystemPrompt, 
  generateFAQs, 
  generateTrainingData 
} = require("../services/aiService");

// GET /api/brands — Get all brands
router.get("/", async (req, res) => {
  try {
    const brands = await getAllBrands();
    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/brands/:widgetId/stats — Get brand stats
router.get("/:widgetId/stats", async (req, res) => {
  try {
    const { widgetId } = req.params;
    const stats = await getBrandStats(widgetId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/brands/:widgetId/insights — AI Insights & Patterns
router.get("/:widgetId/insights", async (req, res) => {
  try {
    const { widgetId } = req.params;

    const [stats, conversations] = await Promise.all([
      getBrandStats(widgetId),
      getConversationsByBrand(widgetId),
    ]);

    let frustratedCount = 0;
    let droppedOffCount = 0;
    let totalPoorResponseRate = 0;
    const conversationStatuses = {};

    conversations.forEach((conv) => {
      const status = getConversationStatus(conv.messages);
      conversationStatuses[conv._id] = status;
      if (status === "frustrated") frustratedCount++;
      if (status === "dropped_off") droppedOffCount++;

      const quality = checkResponseQuality(conv.messages);
      totalPoorResponseRate += quality.poorResponseRate;
    });

    const patterns = {
      frustratedCount,
      droppedOffCount,
      avgPoorResponseRate: Math.round(totalPoorResponseRate / (conversations.length || 1)),
      conversationStatuses,
    };

    const aiInsights = await generateBrandInsights({ stats, conversations, patterns });

    res.json({
      success: true,
      data: { stats, patterns, aiInsights },
    });
  } catch (error) {
    console.error("INSIGHTS ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ──────────────────────────────────────────────────────────────────
// AI FEATURE ROUTES
// ──────────────────────────────────────────────────────────────────

// GET /api/brands/:widgetId/system-prompt — Generate improved prompt
router.get("/:widgetId/system-prompt", async (req, res) => {
  try {
    const { widgetId } = req.params;
    const conversations = await getConversationsByBrand(widgetId);

    console.log("✅ Conversations count:", conversations.length);
    console.log("✅ Sample conv:", JSON.stringify(conversations[0], null, 2));

    const result = await generateSystemPrompt(conversations);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ SYSTEM PROMPT ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/brands/:widgetId/faqs — Generate FAQs
router.get("/:widgetId/faqs", async (req, res) => {
  try {
    const { widgetId } = req.params;
    const conversations = await getConversationsByBrand(widgetId);

    console.log("✅ FAQs - Conversations count:", conversations.length);

    const result = await generateFAQs(conversations);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ FAQ ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/brands/:widgetId/training-data — Export training pairs
router.get("/:widgetId/training-data", async (req, res) => {
  try {
    const { widgetId } = req.params;
    const conversations = await getConversationsByBrand(widgetId);

    console.log("✅ Training - Conversations count:", conversations.length);

    const result = await generateTrainingData(conversations);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ TRAINING DATA ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;