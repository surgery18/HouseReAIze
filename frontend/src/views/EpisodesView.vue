<template>
	<div class="container my-2">
		<button class="btn btn-lg btn-primary my-3" @click="back">Home</button>
		<h4>All Episodes</h4>
		<ul class="list-unstyled">
			<ul class="list-unstyled">
				<li v-for="episode in episodes" :key="episode.title">
					<router-link
						:to="{ name: 'ViewEpisode', params: { hash: episode.url } }"
					>
						{{ episode.title }}
						<small>({{ episode.views }} views)</small>
					</router-link>
				</li>
			</ul>
		</ul>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				episodes: [],
			}
		},
		async created() {
			try {
				const resp = await fetch("/api/episodes")
				this.episodes = await resp.json()
			} catch (e) {
				console.log(e)
			}
		},
		methods: {
			back() {
				this.$router.push("/")
			},
		},
	}
</script>

<style></style>
