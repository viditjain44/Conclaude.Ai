const express = require("express");
const router = express.Router();
const { getAllBrands, getBrandStats, getConversationsByBrand } = require("../services/analytics");
const { detectFrustration, detectDropOff, checkResponseQuality, getConversationStatus } = require("../services/patternDetector");
const { generateBrandInsights } = require("../services/aiService");

// GET /api/brands — saare brands
router.get("/", async (req, res) => {
  try {
    const brands = await getAllBrands();
    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/brands/:widgetId/stats — brand stats
router.get("/:widgetId/stats", async (req, res) => {
  try {
    const { widgetId } = req.params;
    const stats = await getBrandStats(widgetId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/brands/:widgetId/insights — AI insights
router.get("/:widgetId/insights", async (req, res) => {
  try {
    const { widgetId } = req.params;

    const [stats, conversations] = await Promise.all([
      getBrandStats(widgetId),
      getConversationsByBrand(widgetId),
    ]);

    // Patterns detect karo
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

    // Claude se insights
    const aiInsights = await generateBrandInsights({ stats, conversations, patterns });

    res.json({
      success: true,
      data: { stats, patterns, aiInsights },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;