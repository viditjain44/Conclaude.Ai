import axios from "axios";

const API = axios.create({
   baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// ─────────────────────────────────────────
// BRAND & STATS
// ─────────────────────────────────────────

// Saare brands fetch karo
export const fetchBrands = () => API.get("/brands");

// Brand ki stats fetch karo
export const fetchBrandStats = (widgetId) =>
  API.get(`/brands/${widgetId}/stats`);

// ─────────────────────────────────────────
// CONVERSATIONS
// ─────────────────────────────────────────

// Brand ki saari conversations fetch karo
export const fetchConversations = (widgetId) =>
  API.get(`/conversations/${widgetId}`);

// Single conversation detail fetch karo
export const fetchConversationDetail = (conversationId) =>
  API.get(`/conversations/detail/${conversationId}`);

// ─────────────────────────────────────────
// AI INSIGHTS & OPTIMIZATION (NEW FEATURES)
// ─────────────────────────────────────────

// Brand ke high-level AI insights (Health, Issues, Strengths)
export const fetchBrandInsights = (widgetId) =>
  API.get(`/brands/${widgetId}/insights`);

// Single conversation ka detailed AI analysis
export const fetchConversationInsights = (conversationId) =>
  API.get(`/insights/${conversationId}`);

// NEW: Failed conversations analyze karke naya system prompt generate karo
export const fetchSystemPromptGenerator = (widgetId) =>
  API.get(`/brands/${widgetId}/system-prompt`);

// NEW: Real user questions se automatic FAQs generate karo
export const fetchFAQGenerator = (widgetId) =>
  API.get(`/brands/${widgetId}/faqs`);

// NEW: Successful conversation pairs export karo (Training/Fine-tuning ke liye)
export const fetchTrainingDataExporter = (widgetId) =>
  API.get(`/brands/${widgetId}/training-data`);