<template>
	<div class="episode-generation-page">
		<div class="main-content">
			<div class="episode-details" v-if="obj">
				<h3>Episode Details</h3>
				<p v-if="obj.script">Title: {{ obj.script.title }}</p>
				<p v-if="obj.script">Description: {{ obj.script.description }}</p>
				<p>Views: {{ obj.views }}</p>
			</div>
			<!-- Page Title -->
			<div v-if="!isHash && !ec">
				<div class="page-header">
					<h1>Generate Your Episode</h1>
					<p>Experience a new, AI-powered episode of House M.D. every time!</p>
				</div>

				<!-- User API Key Input -->
				<div class="api-key-container">
					<label for="api-key"
						>Enter your Open API key (This will cost around ~$0.30):</label
					>
					<input
						class="form-control"
						type="text"
						id="api-key"
						v-model="apiKey"
					/>
				</div>

				<!-- Generate Button -->
				<div class="generate-button-container">
					<input
						class="form-control form-control-lg"
						type="text"
						placeholder="Want to make your own topic? Go ahead. Leave blank for random."
						v-model="topic"
					/>
					<br />
					<button @click="generateEpisode" class="btn btn-primary btn-lg mt-4">
						Generate Episode
					</button>
				</div>
			</div>
			<div v-if="isHash && !ec">
				<div class="generate-button-container" v-if="isHash">
					<button @click="generateEpisode" class="btn btn-primary btn-lg mt-4">
						Play Episode
					</button>
				</div>
			</div>

			<div class="finished text-center" v-if="ec && isFinished">
				<h5>Episode finished Playing</h5>
				<div>
					<button
						class="btn btn-lg btn-success my-3"
						@click="ec.recorder.download()"
					>
						DOWNLOAD EPISODE
					</button>
				</div>
				<div class="share-section my-3">
					<h5>Share The Episode</h5>
					<div class="input-group mb-3">
						<input
							type="text"
							class="form-control"
							:value="getShareUrl"
							readonly
						/>
						<div class="input-group-append">
							<button
								class="btn btn-outline-secondary"
								type="button"
								@click="copyLink"
							>
								Copy
							</button>
						</div>
					</div>
					<div class="social-icons">
						<i
							class="bi bi-facebook mx-2"
							style="font-size: 36px"
							@click="shareFb"
						></i>
						<i
							class="bi bi-twitter mx-2"
							style="font-size: 36px"
							@click="shareTwitter"
						></i>
					</div>
				</div>
				<button @click="$router.push('/')" class="btn btn-primary btn-lg">
					Back Home
				</button>
			</div>

			<!-- Playback Area -->
			<div class="playback-container">
				<div class="canvas-container" ref="canvasContainer">
					<canvas
						ref="episodeCanvas"
						id="myCanvas"
						width="1024"
						height="1024"
					></canvas>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import EpisodeCanvas from "@/utils/episodeCanvas.js"
	import { startLoading, stopLoading } from "@/utils/eventbus"

	export default {
		data() {
			return {
				ec: null,
				topic: "",
				obj: {},
				apiKey: "",
			}
		},
		setup() {
			return { startLoading, stopLoading }
		},
		async created() {
			if (this.isHash) {
				const hash = this.$route.params.hash
				const response = await fetch("/api/episode/" + hash) //for now
				const resp = await response.json()
				this.obj = resp
			}
		},
		mounted() {
			this.$refs.canvasContainer.style.display = "none"
			// console.log(this.$route)
			// console.log(window.location)
		},
		computed: {
			isHash() {
				return this.$route.params.hash
			},
			isFinished() {
				return this.ec && typeof this.ec.isFinished !== "undefined"
					? this.ec.isFinished
					: false
				// return true
			},
			getShareUrl() {
				return this.obj
					? window.location.origin + "/episode/" + this.obj.url
					: ""
			},
		},
		watch: {
			isFinished(v) {
				if (v) {
					// console.log("ec.isFinished", v)
					this.$refs.canvasContainer.style.display = "none"
				}
			},
		},
		methods: {
			shareFb() {
				const shareUrl = this.getShareUrl
				window.open(
					`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
						shareUrl
					)}`,
					"facebook-share-dialog"
				)
			},
			shareTwitter() {
				const shareUrl = this.getShareUrl
				const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
					"Check out this AI generated episode of House @"
				)}&url=${encodeURIComponent(shareUrl)}&hashtags=house,ai,houseai`
				window.open(twitterUrl, "_blank")
			},
			copyLink() {
				navigator.clipboard.writeText(this.getShareUrl)
			},
			async generateEpisode() {
				this.$refs.canvasContainer.style.display = "block"
				// this.ec.generateEpisode()
				// this.togglePlayPause()
				startLoading()
				try {
					const canvas = this.$refs.episodeCanvas
					this.ec = new EpisodeCanvas(canvas)
					this.ec.isPlaying = true

					const ret = await this.ec.generateEpisode(
						this.topic,
						this.obj.script,
						this.apiKey
					)
					if (ret) {
						this.obj = ret
					}
				} catch (e) {
					alert(e.message)
					this.ec = null
				}
				stopLoading()
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
	.social-icons > i {
		cursor: pointer;
	}
	.canvas-container {
		position: relative;
		width: 100%;
		// height: 100%;
		max-width: 1024px;
		// height: 600px;
		// max-height: 1024px;
		// padding-bottom: 100%; /* 1:1 Aspect Ratio */
		// overflow: hidden;
		margin: 0 auto;
	}

	canvas {
		// position: absolute;
		// top: 0;
		// left: 0;
		// width: 100%;
		// height: 100%;
		// position: relative;
		width: 100%;
		height: 100%;
	}

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
