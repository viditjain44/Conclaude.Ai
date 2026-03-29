import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Saare brands fetch karo
export const fetchBrands = () => API.get("/brands");

// Brand ki stats fetch karo
export const fetchBrandStats = (widgetId) =>
  API.get(`/brands/${widgetId}/stats`);

// Brand ke AI insights fetch karo
export const fetchBrandInsights = (widgetId) =>
  API.get(`/brands/${widgetId}/insights`);

// Brand ki saari conversations fetch karo
export const fetchConversations = (widgetId) =>
  API.get(`/conversations/${widgetId}`);

// Single conversation detail fetch karo
export const fetchConversationDetail = (conversationId) =>
  API.get(`/conversations/detail/${conversationId}`);

// Single conversation ka AI analysis fetch karo
export const fetchConversationInsights = (conversationId) =>
  API.get(`/insights/${conversationId}`);