import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types

export type Topic = {
  id: number;
  name: string;
  vibe_score: number | null;
  post_count: number | null;
};

export type Post = {
  id: number;
  content: string;
  sentiment_score: number | null;
  created_at: string;
};

export type TopicDetail = {
  id: number;
  name: string;
  vibe_score: number | null;
  summary: string | null;
  posts: Post[];
};

export type DashboardPost = {
  id: number;
  content: string;
  sentiment_score: number | null;
  topic_name: string;
  created_at: string;
};

export type Dashboard = {
  email: string;
  total_posts: number;
  avg_sentiment: number | null;
  posts: DashboardPost[];
};

// Auth
export const register = async (email: string, password: string) => {
  const res = await api.post("/auth/register", { email, password });
  return res.data;
};

export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

// Topics
export const getTopics = async (): Promise<Topic[]> => {
  const res = await api.get("/topics");
  return res.data;
};

export const createTopic = async (name: string): Promise<Topic> => {
  const res = await api.post("/topics", { name });
  return res.data;
};

// Posts
export const getTopicPosts = async (topicId: number): Promise<TopicDetail> => {
  const res = await api.get(`/topics/${topicId}/posts`);
  return res.data;
};

export const createPost = async (
  topicId: number,
  content: string,
): Promise<Post> => {
  const res = await api.post(`topics/${topicId}/posts`, { content });
  return res.data;
};

export const deletePost = async (postId: number): Promise<void> => {
  const res = await api.delete(`topics/posts/${postId}`);
  return res.data;
};

// Dashboard
export const getDashboard = async (): Promise<Dashboard> => {
  const res = await api.get("/users/me");
  return res.data;
};

export default api;
