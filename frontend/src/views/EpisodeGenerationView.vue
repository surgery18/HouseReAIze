<template>
	<div class="episode-generation-page">
		<div class="main-content">
			<!-- Generate Button -->
			<div class="generate-button-container">
				<button @click="generateEpisode" class="btn btn-primary btn-lg">
					Generate Episode
				</button>
			</div>

			<!-- Playback Area -->
			<div class="playback-container">
				<canvas ref="episodeCanvas"></canvas>
			</div>
		</div>
	</div>
</template>

<script>
	import EpisodeCanvas from "@/utils/episodeCanvas.js"

	export default {
		data() {
			return {
				// ec: null,
			}
		},
		mounted() {},
		beforeDestroy() {
			// window.cancelAnimationFrame(this.reqId)
		},
		methods: {
			async generateEpisode() {
				// this.ec.generateEpisode()
				// this.togglePlayPause()
				const canvas = this.$refs.episodeCanvas
				this.ec = new EpisodeCanvas(canvas)
				this.ec.isPlaying = true
				this.ec.generateEpisode()
			},
			// togglePlayPause() {
			// 	this.isPlaying = !this.isPlaying
			// 	if (this.isPlaying) {
			// 		requestAnimationFrame(this.mainLoop)
			// 	}
			// },
			// reset() {
			// 	this.isPlaying = false
			// 	this.currentTimestamp = 0
			// 	this.currentActionStartTimestamp = null
			// 	this.initCharacterPositions()
			// },
		},
	}
</script>

<style lang="less" scoped>
	.episode-generation-page {
		padding: 2rem;
		display: flex; // Set as a flex container
		justify-content: space-between; // Distribute main content and sidebar

		.page-header,
		.generate-button-container,
		.loading-container,
		.playback-container {
			text-align: center;
			margin-bottom: 3rem;
		}

		.volume-slider {
			margin-left: 1rem;
		}

		.main-content {
			flex: 1; // Main content to take up remaining space

			.page-header {
				margin-bottom: 3rem;
			}

			.generate-button-container {
				margin: 2rem 0;
			}

			.loading-container {
				margin-top: 2rem;
			}

			.playback-container {
				margin-top: 2rem;
				position: relative;

				.playback-controls {
					text-align: center;
				}

				.volume-slider {
					margin-left: 1rem;
				}
			}

			.dialogue-display {
				border: 1px solid #e0e0e0;
				padding: 1rem;
				background-color: #f9f9f9;
				margin-top: 1rem;
				max-height: 150px;
				overflow-y: auto;
				font-style: italic;
			}
		}

		.content-right {
			flex-basis: 300px; // Fixed width for sidebar, adjust as necessary
			padding-left: 2rem;
			border-left: 1px solid #e0e0e0;

			.episode-details {
				margin-bottom: 2rem;
			}

			.character-profiles {
				padding: 1rem;

				.character-icon {
					width: 24px;
					height: 24px;
					margin-right: 8px;
					vertical-align: middle;
				}

				ul {
					list-style-type: none;
					padding: 0;

					li {
						margin: 0.5rem 0;
					}
				}
			}
		}
	}

	.progress-bar {
		background-color: #ddd;
		height: 5px;
		width: 100%;
		position: relative;
		// bottom: 10px;
		margin: 20px;
	}

	.progress {
		background-color: #007bff;
		height: 100%;
	}
</style>
