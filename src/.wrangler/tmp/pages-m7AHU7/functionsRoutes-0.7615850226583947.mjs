import { onRequestGet as __api_episodes_js_onRequestGet } from "C:\\Users\\surge\\Desktop\\projects\\HouseReAIze\\src\\functions\\api\\episodes.js"
import { onRequestPost as __api_generate_episode_js_onRequestPost } from "C:\\Users\\surge\\Desktop\\projects\\HouseReAIze\\src\\functions\\api\\generate_episode.js"
import { onRequestGet as __api_latest_episodes_js_onRequestGet } from "C:\\Users\\surge\\Desktop\\projects\\HouseReAIze\\src\\functions\\api\\latest-episodes.js"

export const routes = [
    {
      routePath: "/api/episodes",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_episodes_js_onRequestGet],
    },
  {
      routePath: "/api/generate_episode",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_generate_episode_js_onRequestPost],
    },
  {
      routePath: "/api/latest-episodes",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_latest_episodes_js_onRequestGet],
    },
  ]