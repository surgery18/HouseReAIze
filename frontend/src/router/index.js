import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"
import EpisodeGenerationView from "../views/EpisodeGenerationView.vue"
import EpisodesView from "../views/EpisodesView.vue"

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			component: HomeView,
		},
		{
			path: "/generate-episode",
			name: "EpisodeGeneration",
			component: EpisodeGenerationView,
		},
		{
			path: "/episode/:hash",
			name: "ViewEpisode",
			component: EpisodeGenerationView,
		},
		{
			path: "/episodes",
			name: "Episodes",
			component: EpisodesView,
		},
	],
})

export default router
