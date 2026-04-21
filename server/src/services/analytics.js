const { MongoClient, ObjectId } = require("mongodb");

const getDB = async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  return client.db("Conclaude");
};

const getAllBrands = async () => {
  const db = await getDB();
  const brands = await db
    .collection("Conversations.json")
    .aggregate([
      {
        $group: {
          _id: "$widgetId",
          totalConversations: { $sum: 1 },
          firstSeen: { $min: "$createdAt" },
          lastSeen: { $max: "$updatedAt" },
        },
      },
      { $sort: { totalConversations: -1 } },
    ])
    .toArray();
  return brands;
};

const getConversationsByBrand = async (widgetId) => {
  const db = await getDB();
  const conversations = await db
    .collection("Conversations.json")
    .find({ widgetId: widgetId })
    .sort({ createdAt: -1 })
    .toArray();

  const enriched = await Promise.all(
    conversations.map(async (conv) => {
      const convIdStr = conv._id.toString();
      const messages = await db
        .collection("Message.json")
        .find({ conversationId: convIdStr })
        .sort({ timestamp: 1 })
        .toArray();
      return { ...conv, messages };
    })
  );
  return enriched;
};

const getConversationById = async (conversationId) => {
  const db = await getDB();

  let conversation = await db
    .collection("Conversations.json")
    .findOne({ _id: conversationId });

  if (!conversation) return null;

  const messages = await db
    .collection("Message.json")
    .find({ conversationId: conversationId })
    .sort({ timestamp: 1 })
    .toArray();

  return { ...conversation, messages };
};

const getBrandStats = async (widgetId) => {
  const db = await getDB();

  const conversations = await db
    .collection("Conversations.json")
    .find({ widgetId: widgetId })
    .toArray();

  const conversationIds = conversations.map((c) => c._id.toString());

  const messages = await db
    .collection("Message.json")
    .find({ conversationId: { $in: conversationIds } })
    .toArray();

  const textMessages = messages.filter((m) => m.messageType === "text");
  const userMessages = textMessages.filter((m) => m.sender === "user");
  const agentMessages = textMessages.filter((m) => m.sender === "agent");
  const eventMessages = messages.filter((m) => m.messageType === "event");
  const productViews = eventMessages.filter(
    (m) => m.metadata?.eventType === "product_view"
  );

  return {
    totalConversations: conversations.length,
    totalMessages: textMessages.length,
    totalUserMessages: userMessages.length,
    totalAgentMessages: agentMessages.length,
    avgMessagesPerConversation:
      Math.round((textMessages.length / (conversations.length || 1)) * 10) / 10,
    productViews: productViews.length,
    totalEvents: eventMessages.length,
  };
};

module.exports = {
  getAllBrands,
  getConversationsByBrand,
  getConversationById,
  getBrandStats,
};