import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EpisodeGenerationView from '../views/EpisodeGenerationView.vue'



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/generate-episode',
      name: 'EpisodeGeneration',
      component: EpisodeGenerationView
    },
  ]
})

export default router
