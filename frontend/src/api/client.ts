import axios from "axios";
import { createResource } from "./resource";

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

// Response interceptor to catch 401 globally
api.interceptors.response.use(
  response => response, //success
  error => {
    if (error.response?.token === 401){
      // token exprired or invalid
      localStorage.removeItem("token")
      window.location.href = "/auth"
    }
    return Promise.reject(error)
  }
)

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

export const topicsResource = createResource(getTopics);

export const createTopic = async (name: string): Promise<Topic> => {
  const res = await api.post("/topics", { name });
  topicsResource.update((topics) => [res.data, ...topics]);
  topicsResource.invalidate();
  return res.data;
};

// Posts
export const getTopicPosts = async (topicId: number): Promise<TopicDetail> => {
  const res = await api.get(`/topics/${topicId}/posts`);
  return res.data;
};

const topicResources = new Map<
  number,
  ReturnType<typeof createResource<TopicDetail>>
>();

export function getTopicResource(topicId: number) {
  let resource = topicResources.get(topicId);
  if (!resource) {
    resource = createResource(() => getTopicPosts(topicId));
    topicResources.set(topicId, resource);
  }
  return resource;
}

export const createPost = async (
  topicId: number,
  content: string,
): Promise<Post> => {
  const res = await api.post(`topics/${topicId}/posts`, { content });
  const resource = getTopicResource(topicId);
  resource.update((topic) => ({
    ...topic,
    posts: [res.data, ...topic.posts].slice(0, 20),
  }));
  resource.invalidate();
  topicsResource.invalidate();
  return res.data;
};

export const deletePost = async (postId: number): Promise<void> => {
  await api.delete(`topics/posts/${postId}`);
  // Dashboard deletion also updates any previously visited topic pages.
  for (const resource of topicResources.values()) {
    resource.update((topic) => ({
      ...topic,
      posts: topic.posts.filter((post) => post.id !== postId),
    }));
    resource.invalidate();
  }
  topicsResource.invalidate();
};

// Dashboard
export const getDashboard = async (): Promise<Dashboard> => {
  const res = await api.get("/users/me");
  return res.data;
};

export default api;
