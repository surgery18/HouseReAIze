<template>
	<div class="episode-generation-page">
		<div class="main-content">
			<!-- Page Title -->
			<div class="page-header">
				<h1>Generate Your Episode</h1>
				<p>Experience a new, AI-powered episode of House M.D. every time!</p>
			</div>

			<!-- Generate Button -->
			<div class="generate-button-container">
				<button @click="generateEpisode" class="btn btn-primary btn-lg">
					Generate Episode
				</button>
			</div>

			<!-- Loading Spinner (Initially Hidden) -->
			<div v-if="isLoading" class="loading-container">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>
				<p class="mt-2">Generating episode...</p>
			</div>

			<!-- Playback Area -->
			<div class="playback-container">
				<canvas ref="episodeCanvas"></canvas>

				<!-- Playback Controls -->
				<div class="playback-controls mt-3">
					<button class="btn btn-secondary" @click="togglePlayPause">
						<i v-if="isPlaying" class="bi bi-pause-fill"></i>
						<i v-else class="bi bi-play-fill"></i>
					</button>
					<input
						type="range"
						v-model="volume"
						min="0"
						max="100"
						class="volume-slider"
					/>
				</div>

				<div class="progress-bar">
					<div class="progress" :style="{ width: currentProgress + '%' }"></div>
				</div>
			</div>

			<div class="dialogue-display">
				<p>{{ currentDialogue }}</p>
			</div>
		</div>

		<!-- Sidebar: Episode Details -->
		<div class="content-right">
			<div class="episode-details">
				<h3>Episode Details</h3>
				<p v-if="episodeTitle">Title: {{ episodeTitle }}</p>
				<p v-if="episodeDuration">Duration: {{ episodeDuration }} mins</p>
			</div>

			<!-- Character Profiles -->
			<div class="character-profiles">
				<h4>Characters</h4>
				<ul v-if="episodeCharacters && episodeCharacters.length">
					<li v-for="character in episodeCharacters" :key="character.name">
						<img :src="character.icon" alt="" class="character-icon" />
						{{ character.name }}
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
	import DemoScript from "@/assets/demo_script.json"
	import House from "@/assets/house.png"
	import Chase from "@/assets/chase.png"
	import Wilson from "@/assets/wilson.png"
	import Cameron from "@/assets/cameron.png"
	import Cuddy from "@/assets/cuddy.png"
	import Office from "@/assets/office.png"

	function lerp(start, end, interpolant) {
		return start + (end - start) * interpolant
	}

	export default {
		data() {
			return {
				isPlaying: false,
				episodeScript: DemoScript,
				currentTimestamp: 0,
				characterPositions: {},
				characterImages: {},
				lastRenderTime: 0,
				frameInterval: 1000 / 60,
				sceneImage: null,
				startTime: null,
				currentAction: null,
				currentActionStartTimestamp: null,
				currentActionState: "idle",
				reqId: null,
				currentProgress: 0,
				uniformScale: 1, // initialize uniform scale factor
			}
		},
		mounted() {
			const canvas = this.$refs.episodeCanvas
			canvas.width = 1024
			canvas.height = 768
			this.generateEpisode()
		},
		beforeDestroy() {
			window.cancelAnimationFrame(this.reqId)
		},
		methods: {
			initCharacterPositions() {
				this.characterPositions = {
					house: { x: -100, y: 0, scale: 0.6 * this.uniformScale },
					cuddy: { x: -100, y: 0, scale: 0.5 * this.uniformScale },
					chase: { x: -100, y: 0, scale: 0.5 * this.uniformScale },
					wilson: { x: -100, y: 0, scale: 0.5 * this.uniformScale },
					cameron: { x: -100, y: 0, scale: 0.5 * this.uniformScale },
				}

				this.characterPositions.house = {
					x: 200,
					y: 200,
					scale: 0.6 * this.uniformScale,
				}
			},
			loadImages() {
				const imagePromises = []
				const characters = {
					house: new Image(),
					cuddy: new Image(),
					chase: new Image(),
					wilson: new Image(),
					cameron: new Image(),
				}

				characters.house.src = House
				characters.cuddy.src = Cuddy
				characters.chase.src = Chase
				characters.wilson.src = Wilson
				characters.cameron.src = Cameron

				for (const character in characters) {
					this.characterImages[character] = characters[character]
					const img = this.characterImages[character]
					const promise = new Promise((resolve, reject) => {
						img.onload = () => {
							resolve()
						}
						img.onerror = reject
					})
					imagePromises.push(promise)
				}

				const sceneImg = new Image()
				sceneImg.src = Office
				const scenePromise = new Promise((resolve, reject) => {
					sceneImg.onload = () => {
						const originalWidth = sceneImg.width
						const originalHeight = sceneImg.height
						const scaleX = 800 / originalWidth
						const scaleY = 600 / originalHeight

						this.uniformScale = Math.min(scaleX, scaleY)

						this.sceneImage = sceneImg
						resolve()
					}
					sceneImg.onerror = reject
				})
				imagePromises.push(scenePromise)

				return Promise.all(imagePromises)
			},
			mainLoop(timestamp) {
				if (
					!this.isPlaying ||
					timestamp - this.lastRenderTime <= this.frameInterval
				) {
					return
				}

				if (!this.currentActionStartTimestamp)
					this.currentActionStartTimestamp = timestamp
				if (!this.startTime) this.startTime = timestamp

				const elapsedTime = timestamp - this.startTime
				const ctx = this.$refs.episodeCanvas.getContext("2d")
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
				ctx.drawImage(
					this.sceneImage,
					0,
					0
					// this.sceneImage.width,
					// this.sceneImage.height
				)

				for (let character in this.characterPositions) {
					this.drawCharacter(character)
				}

				if (this.currentActionState === "idle") {
					this.updateCurrentAction(elapsedTime)
				}

				if (this.currentAction) {
					this.executeAction(this.currentAction, elapsedTime)
				}

				this.lastRenderTime = timestamp
				this.currentTimestamp = elapsedTime
				this.currentProgress = (elapsedTime / this.totalDuration) * 100
				this.reqId = requestAnimationFrame(this.mainLoop)
			},
			drawCharacter(character) {
				const ctx = this.$refs.episodeCanvas.getContext("2d")
				const position = this.characterPositions[character]
				const image = this.characterImages[character]
				ctx.drawImage(
					image,
					position.x,
					position.y,
					image.width * position.scale,
					image.height * position.scale
				)
			},
			updateCurrentAction(elapsedTime) {
				if (
					this.currentAction &&
					elapsedTime > this.currentAction.duration * 1000
				) {
					this.currentTimestamp++
					this.currentActionStartTimestamp = null
				}

				for (let event of this.episodeScript.timeline) {
					if (event.timestamp === this.currentTimestamp) {
						this.currentAction = event.actions[0]
						break
					}
				}
			},
			executeAction(action, elapsedTime) {
				const actions = {
					move: () => {
						const { character, startX, startY, endX, endY, duration } = action
						const fraction = Math.min(elapsedTime / duration, 1)
						this.characterPositions[character].x = lerp(startX, endX, fraction)
						this.characterPositions[character].y = lerp(startY, endY, fraction)
					},
					speak: () => {
						this.displayDialogue(action.character, action.dialogue)
						setTimeout(
							() => this.clearSpeechBubble(action.character),
							action.duration * 1000
						)
					},
				}
				actions[action.action_type]?.()
			},
			displayDialogue(character, dialogue) {
				const ctx = this.$refs.episodeCanvas.getContext("2d")
				const position = this.characterPositions[character]

				ctx.font = "16px Arial"
				ctx.fillStyle = "white"
				ctx.fillRect(
					position.x,
					position.y - 40,
					ctx.measureText(dialogue).width + 10,
					30
				)
				ctx.fillStyle = "black"
				ctx.fillText(dialogue, position.x + 5, position.y - 20)
			},
			clearSpeechBubble(character) {
				const ctx = this.$refs.episodeCanvas.getContext("2d")
				const position = this.characterPositions[character]
				ctx.clearRect(
					position.x,
					position.y - 40,
					ctx.measureText(dialogue).width + 10,
					30
				)
			},
			async generateEpisode() {
				await this.loadImages()
				this.initCharacterPositions()
				this.togglePlayPause()
			},
			togglePlayPause() {
				this.isPlaying = !this.isPlaying
				if (this.isPlaying) {
					requestAnimationFrame(this.mainLoop)
				}
			},
			reset() {
				this.isPlaying = false
				this.currentTimestamp = 0
				this.currentActionStartTimestamp = null
				this.initCharacterPositions()
			},
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
