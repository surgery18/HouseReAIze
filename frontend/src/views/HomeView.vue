<template>
	<div class="container mt-5">
		<!-- Card with Branding & Description -->
		<div class="card shadow mb-5">
			<div class="card-body text-center">
				<h1 class="card-title">HouseReAIze</h1>
				<p class="card-text lead">
					Dive into the AI-driven world of medicine with "HouseReAIze." Here,
					each episode unfolds unpredictably, driven by advanced algorithms
					inspired by the iconic medical drama. From mysterious illnesses to Dr.
					House's unique insights, anticipate a fresh adventure each time. Click
					"Generate Episode" to witness a dynamic story, and let the future of
					medical storytelling mesmerize you!
				</p>
			</div>
		</div>

		<!-- Generate Episode Button & Sidebar (if needed) -->
		<div class="row">
			<div class="col-md-8">
				<div class="d-flex justify-content-center">
					<button class="btn btn-primary btn-lg" @click="generateEpisode">
						Generate Episode
					</button>
				</div>
			</div>

			<div class="col-md-4">
				<h5>Recent Episodes</h5>
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
				<router-link :to="{ name: 'Episodes' }">View more episodes</router-link>
			</div>
		</div>

		<!-- How it Works Section -->
		<section class="container-fluid bg-light py-5">
			<h2 class="text-center mb-4">How it Works</h2>
			<div class="row">
				<div class="col-md-4 text-center">
					<i class="bi bi-cpu" style="font-size: 2rem"></i>
					<h4>AI-Powered</h4>
					<p>
						Scripts and scenarios generated using state-of-the-art AI models.
					</p>
				</div>
				<div class="col-md-4 text-center">
					<i class="bi bi-play-circle" style="font-size: 2rem"></i>
					<h4>Dynamic Playback</h4>
					<p>
						Experience a new, unpredictable episode every time you click
						"Generate".
					</p>
				</div>
				<div class="col-md-4 text-center">
					<i class="bi bi-person" style="font-size: 2rem"></i>
					<h4>Familiar Faces</h4>
					<p>
						Relive your favorite moments with House, Wilson, Cuddy, and the
						team.
					</p>
				</div>
			</div>
		</section>

		<!-- Behind the Scenes Section -->
		<section class="container-fluid bg-gradient py-5">
			<div class="row">
				<div class="col-12 text-center">
					<h2>Behind the Scenes</h2>
					<p class="lead">
						Ever wondered how we bring Dr. House to life? Here's a peek under
						the hood:
					</p>
				</div>
			</div>

			<div class="row mt-4">
				<div class="col-md-3 text-center">
					<bootstrap-icon icon="code-slash" size="2em"></bootstrap-icon>
					<h5>Script Generation</h5>
					<p>
						The AI crafts a unique script based on patterns from previous
						episodes.
					</p>
				</div>

				<div class="col-md-3 text-center">
					<bootstrap-icon icon="play-circle" size="2em"></bootstrap-icon>
					<h5>Episode Rendering</h5>
					<p>
						Characters, scenes, and dialogues are brought to life in the
						playback area.
					</p>
				</div>

				<div class="col-md-3 text-center">
					<bootstrap-icon icon="headphones" size="2em"></bootstrap-icon>
					<h5>Soundscapes</h5>
					<p>Ambient sounds and music tracks add depth to each episode.</p>
				</div>

				<div class="col-md-3 text-center">
					<bootstrap-icon icon="magic" size="2em"></bootstrap-icon>
					<h5>AI Magic</h5>
					<p>
						Our cutting-edge AI ensures each episode is both familiar and novel.
					</p>
				</div>
			</div>

			<div class="row mt-5">
				<div class="col-12 text-center">
					<button class="btn btn-primary btn-lg" @click="generateEpisode">
						Generate Your Own Episode Now!
					</button>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
	export default {
		name: "Home",
		data() {
			return {
				episodes: [],
			}
		},
		async created() {
			try {
				const response = await fetch("/api/latest-episodes")
				const json = await response.json()
				this.episodes = json
			} catch (e) {
				console.log(E)
			}
		},
		methods: {
			generateEpisode() {
				// Logic to start the episode generation process.
				this.$router.push("/generate-episode")
			},
		},
	}
</script>

<style scoped>
	/* Continuing with the light gray for 'How It Works' */
	.bg-light {
		background-color: #f9f9f9;
	}

	/* Gradient background for 'Behind the Scenes' */
	.bg-gradient {
		background: linear-gradient(
			135deg,
			#f9f9f9,
			#e6e6e6
		); /* This creates a subtle gradient from a light gray to a slightly darker gray */
	}
</style>
