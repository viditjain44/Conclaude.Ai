const { MongoClient, ObjectId } = require("mongodb");

const getDB = async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  return client.db("helio_intern");
};

// Sabhi unique brands fetch karo with stats
const getAllBrands = async () => {
  const db = await getDB();

  const brands = await db
    .collection("conversations")
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

// Ek brand ki saari conversations
const getConversationsByBrand = async (widgetId) => {
  const db = await getDB();

  const conversations = await db
    .collection("conversations")
    .find({ widgetId: widgetId })
    .sort({ createdAt: -1 })
    .toArray();

  const enriched = await Promise.all(
    conversations.map(async (conv) => {
      const convIdStr = conv._id.toString();

      let messages = await db
        .collection("messages")
        .find({ conversationId: convIdStr })
        .sort({ timestamp: 1 })
        .toArray();

      // Agar messages nahi mile toh ObjectId se try karo
      if (messages.length === 0) {
        try {
          messages = await db
            .collection("messages")
            .find({ conversationId: new ObjectId(convIdStr) })
            .sort({ timestamp: 1 })
            .toArray();
        } catch (e) {
          messages = [];
        }
      }

      return { ...conv, messages };
    })
  );

  return enriched;
};

// Ek conversation ki detail
const getConversationById = async (conversationId) => {
  const db = await getDB();

  let conversation;

  // Pehle ObjectId se try karo
  try {
    conversation = await db
      .collection("conversations")
      .findOne({ _id: new ObjectId(conversationId) });
  } catch (e) {
    conversation = null;
  }

  // Agar nahi mila toh string se try karo
  if (!conversation) {
    conversation = await db
      .collection("conversations")
      .findOne({ _id: conversationId });
  }

  if (!conversation) return null;

  // Messages string se try karo
  let messages = await db
    .collection("messages")
    .find({ conversationId: conversationId })
    .sort({ timestamp: 1 })
    .toArray();

  // Agar messages nahi mile toh ObjectId se try karo
  if (messages.length === 0) {
    try {
      messages = await db
        .collection("messages")
        .find({ conversationId: new ObjectId(conversationId) })
        .sort({ timestamp: 1 })
        .toArray();
    } catch (e) {
      messages = [];
    }
  }

  return { ...conversation, messages };
};

// Brand ke liye analytics stats
const getBrandStats = async (widgetId) => {
  const db = await getDB();

  const conversations = await db
    .collection("conversations")
    .find({ widgetId: widgetId })
    .toArray();

  const conversationIds = conversations.map((c) => c._id.toString());

  // Messages string IDs se fetch karo
  let messages = await db
    .collection("messages")
    .find({ conversationId: { $in: conversationIds } })
    .toArray();

  // Agar kuch nahi mila toh ObjectId se try karo
  if (messages.length === 0) {
    try {
      const objectIds = conversationIds.map((id) => new ObjectId(id));
      messages = await db
        .collection("messages")
        .find({ conversationId: { $in: objectIds } })
        .toArray();
    } catch (e) {
      messages = [];
    }
  }

  const textMessages = messages.filter((m) => m.messageType === "text");
  const userMessages = textMessages.filter((m) => m.sender === "user");
  const agentMessages = textMessages.filter((m) => m.sender === "agent");
  const eventMessages = messages.filter((m) => m.messageType === "event");
  const productViews = eventMessages.filter(
    (m) => m.metadata?.eventType === "product_view"
  );

  const avgMessagesPerConv =
    textMessages.length / (conversations.length || 1);

  return {
    totalConversations: conversations.length,
    totalMessages: textMessages.length,
    totalUserMessages: userMessages.length,
    totalAgentMessages: agentMessages.length,
    avgMessagesPerConversation: Math.round(avgMessagesPerConv * 10) / 10,
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
