<script setup>
	import { RouterLink, RouterView } from "vue-router"
	import Loader from "@/components/Loader.vue"
</script>

<template>
	<div id="app">
		<RouterView />
		<footer class="mt-5 bg-light">
			<div class="container py-3">
				<p class="text-muted text-center mb-1">
					"House M.D." and its characters, trademarks, and properties are the
					intellectual property of their respective owners. HouseReAIze is an
					unofficial, non-commercial project, created for entertainment and
					educational purposes, and is not affiliated with the official "House
					M.D." series.
				</p>
				<p class="text-muted text-center my-3">
					Text-to-speech is generated using elevenlabs.io.
				</p>
				<p class="text-muted text-center mt-3">
					&copy; {{ new Date().getFullYear() }} HouseReAIze. All Rights
					Reserved.
				</p>
			</div>
		</footer>
		<loader />
	</div>
</template>

<style scoped></style>
