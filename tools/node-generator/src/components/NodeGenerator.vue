<template>
	<div class="node-generator">
		<!-- Character Selector -->
		<div class="character-selector">
			<div
				v-for="char in characters"
				:key="char.id"
				@click="toggleVisibility(char)"
			>
				<img
					:src="char.image"
					alt="Character"
					draggable="false"
					:class="{ 'hidden-character': !char.visible }"
				/>
			</div>
		</div>

		<select v-model="selectedScene" @change="loadScene">
			<option v-for="scene in scenes" :key="scene.name" :value="scene.name">
				{{ scene.name }}
			</option>
		</select>

		<div class="scene-container">
			<img
				:src="selectedSceneImage"
				alt="Scene"
				class="scene-image"
				draggable="false"
			/>
			<div
				v-for="node in nodes"
				:key="node.id"
				class="node-point"
				:style="{ top: node.y + 'px', left: node.x + 'px' }"
			></div>
			<template v-for="char in characters">
				<div
					v-if="char.visible"
					@mousedown="startDrag($event, char)"
					@wheel="resizeCharacter($event, char)"
					@dblclick="addNode(char)"
					@contextmenu.prevent="toggleLock($event, char)"
					class="character"
					:class="{ locked: char.locked }"
					:style="{
						// 'transform-origin': 'center',
						top: char.y + 'px',
						left: char.x + 'px',
						transform: `rotate(${char.rotation}deg) scale(${char.scale})`,
					}"
					:key="char.name"
					@mouseover="hoveredCharacter = char"
					@mouseout="hoveredCharacter = null"
				>
					<img :src="char.image" alt="Character" draggable="false" />
				</div>
			</template>
		</div>

		<button @click="generateNodeFile">Generate Node File</button>
	</div>
</template>

<script>
	import Office from "../../../../assets/rooms/office.png"
	import Hallway from "../../../../assets/rooms/hallway.png"
	import Meeting from "../../../../assets/rooms/meeting.png"
	import MRI from "../../../../assets/rooms/mri.png"
	import HospitalRoom from "../../../../assets/rooms/patient.png"
	import OR from "../../../../assets/rooms/or.png"

	import Chase from "../../../../assets/characters/chase.png"
	import Cuddy from "../../../../assets/characters/cuddy.png"
	import House from "../../../../assets/characters/house.png"
	import Wilson from "../../../../assets/characters/wilson.png"
	import Cameron from "../../../../assets/characters/cameron.png"
	import Paitent from "../../../../assets/characters/patient.png"

	export default {
		data() {
			return {
				scenes: [
					{ name: "House's Office", image: Office },
					{ name: "Hallway", image: Hallway },
					{ name: "Meeting", image: Meeting },
					{ name: "MRI", image: MRI },
					{ name: "Paitent", image: HospitalRoom },
					{ name: "OR", image: OR },
				],
				selectedScene: "",
				selectedSceneImage: "",
				nodes: [],
				characters: [
					{
						id: 1,
						name: "House",
						image: House,
						x: 0,
						y: 0,
						dragging: false,
						visible: false, // default visibility
						locked: false,
						rotation: 0, // Initial rotation angle in degrees
						scale: 1, // default scale
					},
					{
						id: 2,
						name: "Cuddy",
						image: Cuddy,
						x: 0,
						y: 0,
						dragging: false,
						visible: false, // default visibility
						locked: false,
						rotation: 0, // Initial rotation angle in degrees
						scale: 1, // default scale
					},
					{
						id: 3,
						name: "Wilson",
						image: Wilson,
						x: 0,
						y: 0,
						dragging: false,
						visible: false, // default visibility
						locked: false,
						rotation: 0, // Initial rotation angle in degrees
						scale: 1, // default scale
					},
					{
						id: 4,
						name: "Cameron",
						image: Cameron,
						x: 0,
						y: 0,
						dragging: false,
						visible: false, // default visibility
						locked: false,
						rotation: 0, // Initial rotation angle in degrees
						scale: 1, // default scale
					},
					{
						id: 5,
						name: "Chase",
						image: Chase,
						x: 0,
						y: 0,
						dragging: false,
						visible: false, // default visibility
						locked: false,
						rotation: 0, // Initial rotation angle in degrees
						scale: 1, // default scale
					},
					{
						id: 6,
						name: "Paitent",
						image: Paitent,
						x: 0,
						y: 0,
						dragging: false,
						visible: false, // default visibility
						locked: false,
						rotation: 0, // Initial rotation angle in degrees
						scale: 1, // default scale
					},
				],
				currentDragging: null,
				hoveredCharacter: null,
			}
		},
		created() {
			this.selectedScene = "House's Office"
			this.loadScene()

			// Automatically set image width and height for characters
			this.characters.forEach((character) => {
				let img = new Image()
				img.src = character.image
				img.onload = () => {
					character.width = img.naturalWidth
					character.height = img.naturalHeight
				}
			})
		},
		mounted() {
			document.addEventListener("keydown", this.handleRotation)
		},

		beforeDestroy() {
			document.removeEventListener("keydown", this.handleRotation)
		},
		methods: {
			loadScene() {
				// Set the selected scene image
				const scene = this.scenes.find((s) => s.name === this.selectedScene)
				this.selectedSceneImage = scene.image

				this.nodes = []
			},
			// Modify the addNode method:
			addNode(character) {
				this.nodes.push({
					id: Date.now(),
					x: character.x + (character.width * character.scale) / 2,
					y: character.y + (character.height * character.scale) / 2,
					rotation: character.rotation,
					scale: character.scale,
				})
			},
			startDrag(event, character) {
				if (character.locked) return // Prevent drag if character is locked
				if (event.button !== 0) return // ensure it's a left-click
				this.draggingCharacter = character
				this.offsetX = event.clientX - character.x
				this.offsetY = event.clientY - character.y
				document.addEventListener("mousemove", this.performDrag)
				document.addEventListener("mouseup", this.stopDrag)
			},

			performDrag(event) {
				this.draggingCharacter.x = event.clientX - this.offsetX
				this.draggingCharacter.y = event.clientY - this.offsetY
			},
			stopDrag() {
				document.removeEventListener("mousemove", this.performDrag)
				document.removeEventListener("mouseup", this.stopDrag)
			},
			handleRotation(event) {
				if (!this.hoveredCharacter) return

				// const character = this.characters.find(
				// 	(char) => char.name === this.hoveredCharacter
				// )
				// console.log(character)
				const character = this.hoveredCharacter
				switch (event.key) {
					case "q":
						character.rotation -= 10 // Rotate 10 degrees counter-clockwise
						break
					case "e":
						character.rotation += 10 // Rotate 10 degrees clockwise
						break
					case "s":
						character.rotation = 0 // Reset rotation
						break
				}
			},
			generateNodeFile() {
				const nodeFile = {
					scene: this.selectedScene,
					nodes: this.nodes,
				}
				// This can be replaced with more complex logic for saving/exporting the data, such as sending it to a backend or saving to a file.
				console.log(JSON.stringify(nodeFile))
			},
			resizeCharacter(event, character) {
				if (character.locked) return
				if (event.deltaY < 0) {
					character.scale += 0.05 // increase size by 10%
				} else {
					character.scale -= 0.05 // decrease size by 10%
				}
				character.scale = Math.max(0.1, character.scale) // set a minimum scale limit, adjust as needed
				character.scale = Math.min(2, character.scale) // set a maximum scale limit, adjust as needed
				event.preventDefault()
			},
			toggleVisibility(character) {
				character.visible = !character.visible
			},
			toggleLock(event, character) {
				character.locked = !character.locked
			},
		},
	}
</script>

<style scoped>
	.node-generator {
		position: relative;
		width: 1024px;
		height: 1024px;
	}
	.scene-container {
		position: relative;
	}
	.scene-image {
		width: 100%;
		height: 100%;
	}
	.node-point {
		position: absolute;
		width: 10px;
		height: 10px;
		background-color: red;
		border-radius: 50%;
	}
	.character {
		position: absolute;
		cursor: pointer;
		transform-origin: center center;
		width: 50px;
		height: 50px;
	}

	.character-selector {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		align-items: center;
	}

	.character-selector img {
		width: 50px; /* or any size you prefer for the small preview */
		height: auto;
		margin: 5px;
		cursor: pointer;
	}

	.character-selector img.hidden-character {
		opacity: 0.5;
	}
	.character.locked {
		opacity: 0.7;
	}
</style>
