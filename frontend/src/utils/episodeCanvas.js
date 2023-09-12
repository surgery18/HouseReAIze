import Office from "../../../assets/rooms/office.png"
import Hallway from "../../../assets/rooms/hallway.png"
import Meeting from "../../../assets/rooms/meeting.png"
import MRI from "../../../assets/rooms/mri.png"
import HospitalRoom from "../../../assets/rooms/patient.png"
import OperatingRoom from "../../../assets/rooms/or.png"

import Chase from "../../../assets/characters/chase.png"
import Cuddy from "../../../assets/characters/cuddy.png"
import House from "../../../assets/characters/house.png"
import Wilson from "../../../assets/characters/wilson.png"
import Cameron from "../../../assets/characters/cameron.png"
import Patient from "../../../assets/characters/patient.png"

import AudioManager from "./audioManager"
import Recorder from "./recorder"

const lerp = (start, end, t) => start + (end - start) * t

const FRAME_INTERVAL = 1000 / 60

export default class EpisodeCanvas {
	constructor(canvas) {
		this.audioManager = new AudioManager()
		this.recorder = new Recorder()
		this.canvas = canvas
		this.ctx = null
		this.script = {}
		this.playing = false
		this.characters = {}
		this.reqId = null
		this.lastRenderTime = 0
		this.startTime = null
		this.currentTimestamp = 0
		this.actionStartTime = 0
		this.activeActions = []
		this.scenes = {}
		this.curScene = null
		this.isFinished = false

		this.resizeCanvas()

		canvas.addEventListener("resize", this.resizeCanvas)
	}
	resizeCanvas() {
		const displayWidth = this.canvas.clientWidth
		const displayHeight = this.canvas.clientHeight

		// Check if the canvas size has changed
		// console.log(displayWidth, displayHeight)
		// if (
		// 	this.canvas.width !== displayWidth ||
		// 	this.canvas.height !== displayHeight
		// ) {
		// Update the canvas's drawing resolution
		this.canvas.width = displayWidth
		this.canvas.height = displayHeight

		this.scaleX = this.canvas.width / 1024
		this.scaleY = this.canvas.height / 1024
		// console.log(this.scaleX, this.scaleY)
		// }
	}

	callRA() {
		this.reqId = requestAnimationFrame((delta) => this.mainLoop(delta))
	}

	async generateEpisode(topic, script, apikey) {
		this.audioManager.fixSuspended()
		this.playing = true
		this.isFinished = false
		this.startTime = null
		this.initCanvas(this.canvas)

		let ret = null
		if (script) {
			//fetch script
			// const response = await fetch("http://localhost:5000/episode/" + hash) //for now
			// const resp = await response.json()
			this.script = script
		} else {
			//create script
			try {
				const response = await fetch("/api/generate_episode", {
					method: "POST",
					cors: "no-cors",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						topic,
						apikey,
					}),
				})
				const resp = await response.json()
				if (resp.error) {
					this.playing = false
					throw new Error(resp.error)
				} else {
					this.script = resp.script
					ret = resp
				}
			} catch (e) {
				alert("Something is wrong")
				console.log(e)
				return null
			}
		}
		await this.loadAudio()
		await this.loadImages()
		this.initCharacters()
		this.startTime = Date.now()
		this.recorder.initRecorder(this.canvas, this.audioManager.audioDestination)
		this.recorder.startRecording()
		this.callRA()
		return ret
	}

	// get isFinished() {
	// 	return this.currentTimestamp >= +this.script.duration
	// }

	mainLoop(delta) {
		if (this.currentTimestamp >= +this.script.duration) {
			// if (this.isFinished) {
			console.log("FINISHED SCRIPT")
			this.isFinished = true
			// console.log("here")
			this.playing = false
			this.currentTimestamp = 0
			this.recorder.stopRecording()
			return
		}
		if (!this.playing || delta - this.lastRenderTime <= FRAME_INTERVAL) {
			// console.log(!this.playing, delta - this.lastRenderTime <= FRAME_INTERVAL)
			return
		}

		// console.log("IN HERE", delta, this.lastRenderTime, delta - this.lastRenderTime, delta - this.lastRenderTime <= FRAME_INTERVAL)

		// if (!this.startTime) this.startTime = delta
		// const elapsedTime = delta - this.lastRenderTime

		const now = Date.now()
		const dt = now - this.startTime
		const gt = dt / 1000
		// console.log(gt)

		this.draw()
		this.update(gt)

		this.startTime = now
		this.callRA()
	}

	_sortByDepth(charactersObject) {
		// Convert the object to an array
		const characterArray = Object.keys(charactersObject)
			.map((key) => ({
				name: key,
				...charactersObject[key],
			}))
			.filter((c) => c.visible)

		// Sort the array based on y position
		return characterArray.sort(
			(a, b) =>
				a.position.y +
				a.image.height * a.position.scale -
				(b.position.y + b.image.height * b.position.scale)
		)
	}

	draw() {
		const ctx = this.ctx
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
		if (this.curScene) {
			ctx.drawImage(
				// this.sceneImage,
				this.curScene.image,
				0,
				0,
				this.curScene.image.width * this.scaleX,
				this.curScene.image.height * this.scaleY
			)

			// console.log(this.curScene)

			const sortedCharacters = this._sortByDepth(this.characters)
			// console.log(sortedCharacters)
			for (const character of sortedCharacters) {
				this.drawCharacter(character)
			}
			// for (let character in this.characters) {
			//   this.drawCharacter(character)
			// }
		}
	}

	drawCharacter(character) {
		const ctx = this.ctx
		// const c = this.characters[character]
		const c = character
		const position = c.position
		const image = c.image
		// console.log(c.name, c.position.scale)
		if (c.visible) {
			let img = image
			//if the character is in the talking action brighten them up
			for (const action of this.activeActions) {
				// if (action.character.toLowerCase() === character.toLowerCase() && action.dialogue) {
				if (
					action.character &&
					action.character.toLowerCase() === c.name.toLowerCase() &&
					action.dialogue
				) {
					//this.brightenCharacter(position.x, position.y, image.width * position.scale, image.height * position.scale)
					img = c.bimage
					break
				}
			}

			// ctx.drawImage(
			// 	img,
			// 	position.x,
			// 	position.y,
			// 	image.width * position.scale,
			// 	image.height * position.scale
			// )

			ctx.save()

			// Translate again by half of the scaled image's width and height.
			ctx.translate(
				position.x * this.scaleX +
					image.width * position.scale * this.scaleX * 0.5,
				position.y * this.scaleY +
					image.height * position.scale * this.scaleY * 0.5
			)
			// Scale the canvas.
			ctx.scale(position.scale, position.scale)
			ctx.scale(this.scaleX, this.scaleY)

			// Rotate the canvas.
			ctx.rotate((position.rotation * Math.PI) / 180)

			// Draw the image, offset by its full width and height.
			ctx.drawImage(
				img,
				-image.width * 0.5,
				-image.height * 0.5
				// image.width * position.scale,
				// image.height * position.scale
			)

			ctx.restore()
		}

		// ctx.fillStyle = "green" // Color of the dots
		// ctx.fillRect(position.x - 2, position.y - 2, 4, 4)

		// ctx.fillStyle = "red" // Color of the dots

		// for (let event of this.script.timeline) {
		// 	for (let action of event.actions) {
		// 		if (action.action_type === "move") {
		// 			// Draw a small rectangle as a dot
		// 			ctx.fillRect(action.startX - 2, action.startY - 2, 4, 4)
		// 			ctx.fillRect(action.endX - 2, action.endY - 2, 4, 4)
		// 		}
		// 	}
		// }
	}

	getBrightenedImage(image) {
		// Create an offscreen canvas
		const offscreenCanvas = document.createElement("canvas")
		offscreenCanvas.width = image.width
		offscreenCanvas.height = image.height
		const offscreenCtx = offscreenCanvas.getContext("2d")

		// Draw the original image onto the offscreen canvas
		offscreenCtx.drawImage(image, 0, 0)

		// Brighten the image
		const imageData = offscreenCtx.getImageData(0, 0, image.width, image.height)
		const data = imageData.data
		for (let i = 0; i < data.length; i += 4) {
			data[i] = Math.min(data[i] + 50, 255) // red
			data[i + 1] = Math.min(data[i + 1] + 50, 255) // green
			data[i + 2] = Math.min(data[i + 2] + 50, 255) // blue
		}
		offscreenCtx.putImageData(imageData, 0, 0)

		// Create a new Image object from the brightened canvas
		const brightenedImage = new Image()
		brightenedImage.src = offscreenCanvas.toDataURL()
		return brightenedImage
	}

	update(deltaTime) {
		this.currentTimestamp += deltaTime

		const ft = +this.currentTimestamp.toFixed(2)
		// Add new actions to the active actions list
		for (const index in this.script.timeline) {
			const event = this.script.timeline[index]
			let found = false
			if (event.timestamp == Math.floor(ft) && !event.playing) {
				event.playing = true
				let hasAudio = false
				let changeScene = null
				// for (const action of event.actions) {
				// 	action.timestamp = this.currentTimestamp
				// 	if (action.audio_file) {
				// 		hasAudio = true
				// 	}
				// 	if (action.action_type === "scene") {
				// 		changeScene = action
				// 	}
				// 	this.activeActions.push({
				// 		...action,
				// 		character: action.character ? action.character.toLowerCase() : null,
				// 	})
				// }
				const action = event.action ?? event
				action.timestamp = this.currentTimestamp
				if (action.audio_file) {
					hasAudio = true
				}
				if (action.action_type === "scene") {
					changeScene = action
				}
				this.activeActions.push({
					...action,
					character: action.character ? action.character.toLowerCase() : null,
				})
				if (hasAudio) {
					this.audioManager.playNextAudio()
				}
				if (changeScene) {
					this.changeScene(changeScene)
				}
				found = true
				break
			}
			if (found) break
		}

		// console.log(ft)

		// Process all active actions
		for (let i = 0; i < this.activeActions.length; i++) {
			const action = this.activeActions[i]
			this.processAction(action, deltaTime)

			// Check if the action has completed and remove it from active actions
			const fraction =
				(this.currentTimestamp - action.timestamp) / action.duration
			if (fraction >= 1) {
				this.activeActions.splice(i, 1)
				i-- // Adjust the loop index after removal
			}
		}
	}

	processAction(action, deltaTime) {
		const actions = {
			scene: () => {
				// console.log("IN HERE")
				//play animation here????
			},
			appear: () => {
				const { character } = action
				this.characters[character].visible = true
			},
			disappear: () => {
				const { character } = action
				this.characters[character].visible = false
			},
			move: () => {
				const { character, position, duration, timestamp } = action
				const { startX, startY, endX, endY, scale, rotation } = position
				// console.log(character, duration)
				const fraction = Math.min(
					(this.currentTimestamp - timestamp) / duration,
					1
				)

				const halfImageWidth =
					(this.characters[character].image.width * scale) / 2
				const halfImageHeight =
					(this.characters[character].image.height * scale) / 2

				const currentX = lerp(
					startX - halfImageWidth,
					endX - halfImageWidth,
					fraction
				)
				const currentY = lerp(
					startY - halfImageHeight,
					endY - halfImageHeight,
					fraction
				)

				this.characters[character].position.x = currentX
				this.characters[character].position.y = currentY
				this.characters[character].position.scale = scale
				this.characters[character].position.rotation = 1
			},
			talk: () => {
				// console.log(action)
				this.displayDialogue(action.character, action.dialogue)
				// setTimeout(
				//   () => this.clearSpeechBubble(action.character, action.dialogue),
				//   action.duration * 1000
				// )
			},
		}
		actions[action.action_type]?.()
	}

	changeScene(action) {
		// if (this.action?.changedScene) return
		// console.log(action)
		// action.changedScene = true
		//make all characters defaulted
		this.initCharacters()
		//now set the characters initial positions
		const initState = action.initialState.characters
		for (const character of initState) {
			const key = character.name.toLowerCase()
			// console.log(key, this.characters, this.characters)
			const image = this.characters[key].image
			//default
			let position = {
				x: -100,
				y: -100,
				scale: 1,
				rotation: 0,
			}
			if (character.position) {
				position = {
					x:
						character.position.startX -
						(image.width * character.position.scale) / 2,
					y:
						character.position.startY -
						(image.height * character.position.scale) / 2,
					scale: character.position.scale,
					rotation: character.position?.rotation,
				}
			}

			this.characters[key] = {
				...this.characters[key],
				position,
				visible: character.visible,
			}
			// console.log(key, this.characters[key])
		}
		this.curScene = this.scenes[this._sanitizeKey(action.scene)]
	}

	// displayDialogue(character, dialogue) {
	// 	const ctx = this.ctx
	// 	const canvasWidth = ctx.canvas.width
	// 	const canvasHeight = ctx.canvas.height
	// 	const position = this.characters[character].position

	// 	ctx.font = "16px Arial"
	// 	const dialogueWidth = ctx.measureText(dialogue).width + 10
	// 	const dialogueHeight = 30

	// 	// Adjusted positions
	// 	let posX = position.x
	// 	let posY = position.y - 40

	// 	// Boundary checks
	// 	const padding = 10
	// 	if (posX + dialogueWidth > canvasWidth) {
	// 		posX = canvasWidth - dialogueWidth - padding
	// 	}
	// 	if (posX < 0) {
	// 		posX = padding
	// 	}
	// 	if (posY - dialogueHeight < 0) {
	// 		posY = dialogueHeight - padding
	// 	}
	// 	if (posY > canvasHeight) {
	// 		posY = canvasHeight - dialogueHeight - padding
	// 	}

	// 	ctx.fillStyle = "white"
	// 	ctx.fillRect(posX, posY, dialogueWidth, dialogueHeight)
	// 	ctx.fillStyle = "black"
	// 	ctx.fillText(dialogue, posX + 5, posY + dialogueHeight / 2 + 5) // Centered vertically
	// }

	displayDialogue(character, dialogue) {
		const ctx = this.ctx
		const canvasWidth = ctx.canvas.width
		const canvasHeight = ctx.canvas.height

		// Dimensions for the dialogue box
		const boxHeight = canvasHeight * 0.25
		const boxWidth = canvasWidth
		const boxPosX = 0
		const boxPosY = canvasHeight - boxHeight

		// Font settings
		const fontSize = 20
		const lineHeight = 25
		const padding = 15

		// Add character's name in bold to the dialogue
		const fullDialogue = character.toUpperCase() + ": " + dialogue

		// Split the dialogue into lines so it fits inside the box
		const words = fullDialogue.split(" ")
		let line = ""
		let lines = []

		for (let word of words) {
			let testLine = line + word + " "
			ctx.font = fontSize + "px Arial"
			if (line === "" && word !== character) {
				ctx.font = "bold " + fontSize + "px Arial"
			}
			let metrics = ctx.measureText(testLine)
			let testWidth = metrics.width

			if (testWidth > boxWidth - 2 * padding && line !== "") {
				lines.push(line)
				line = word + " "
			} else {
				line = testLine
			}
		}
		lines.push(line)

		// Calculate the starting vertical position to center the text in the dialogue box
		const totalTextHeight = lines.length * lineHeight
		const centeredStartY = boxPosY + (boxHeight - totalTextHeight) / 2

		// Draw the dialogue box
		ctx.fillStyle = "rgba(0, 0, 0, 0.75)"
		ctx.fillRect(boxPosX, boxPosY, boxWidth, boxHeight)

		// Draw the dialogue text line by line
		ctx.fillStyle = "white"
		for (let i = 0; i < lines.length; i++) {
			if (i === 0) {
				ctx.font = "bold " + fontSize + "px Arial"
			} else {
				ctx.font = fontSize + "px Arial"
			}
			ctx.fillText(lines[i], boxPosX + padding, centeredStartY + i * lineHeight)
		}
	}

	// displayDialogue(character, dialogue) {
	//   const ctx = this.ctx
	//   const position = this.characters[character].position

	//   ctx.font = "16px Arial"
	//   ctx.fillStyle = "white"
	//   ctx.fillRect(
	//     position.x,
	//     position.y - 40,
	//     ctx.measureText(dialogue).width + 10,
	//     30
	//   )
	//   ctx.fillStyle = "black"
	//   ctx.fillText(dialogue, position.x + 5, position.y - 20)
	// }

	// clearSpeechBubble(character, dialogue) {
	//   const ctx = this.ctx
	//   const position = this.characters[character].position
	//   ctx.clearRect(
	//     position.x,
	//     position.y - 40,
	//     ctx.measureText(dialogue).width + 10,
	//     30
	//   )
	// }

	async loadAudio() {
		//parse script for all dialogue filenames and load them into the audios object
		const timeline = this.script.timeline
		for (const event of timeline) {
			// for (const action of event.actions) {
			// 	if (action.audio_file) {
			// 		this.audioManager.addAudio(
			// 			"http://127.0.0.1:5000/tts/" + action.audio_file
			// 		)
			// 	}
			// }
			const action = event.action ?? event
			if (action.audio_file) {
				this.audioManager.addAudio(
					// "http://127.0.0.1:5000/tts/" + action.audio_file
					action.audio_url
				)
			}
		}
		await this.audioManager.preloadInitialAudio()
	}

	loadImages() {
		const imagePromises = []
		const characters = {
			cameron: {
				img: new Image(),
				loc: Cameron,
			},
			chase: {
				img: new Image(),
				loc: Chase,
			},
			cuddy: {
				img: new Image(),
				loc: Cuddy,
			},
			wilson: {
				img: new Image(),
				loc: Wilson,
			},
			house: {
				img: new Image(),
				loc: House,
			},
			patient: {
				img: new Image(),
				loc: Patient,
			},
		}

		//get all_characters to see what needs to be loaded
		const allChar = this.script.all_characters
		for (const character of allChar) {
			const key = character.toLowerCase()
			this.characters[key] = {}
			// if (!this.characters[key]) continue
			//load it
			// console.log(key, characters[key])
			characters[key].img.src = characters[key].loc
			this.characters[key].image = characters[key].img

			const img = this.characters[key].image
			const loadImage = (img) => {
				return new Promise((resolve, reject) => {
					img.onload = () => {
						this.characters[key].bimage = this.getBrightenedImage(img)
						resolve()
					}
					img.onerror = reject
				})
			}
			imagePromises.push(loadImage(img))
		}

		const scenes = {
			office: {
				img: new Image(),
				loc: Office,
			},
			hallway: {
				img: new Image(),
				loc: Hallway,
			},
			meeting: {
				img: new Image(),
				loc: Meeting,
			},
			mri: {
				img: new Image(),
				loc: MRI,
			},
			hospital_room: {
				img: new Image(),
				loc: HospitalRoom,
			},
			or: {
				img: new Image(),
				loc: OperatingRoom,
			},
		}

		const allScenes = this.script.all_scenes
		for (const scene of allScenes) {
			const key = this._sanitizeKey(scene)
			//load scenes
			// console.log(key, scenes[key])
			scenes[key].img.src = scenes[key].loc
			this.scenes[key] = {}
			this.scenes[key].image = scenes[key].img
			const img = scenes[key].img
			const loadImage = (img) => {
				return new Promise((resolve, reject) => {
					img.onload = () => {
						const originalWidth = img.width
						const originalHeight = img.height
						// const originalWidth = 1024
						// const originalHeight = 1024
						const scaleX = this.canvas.width / originalWidth
						const scaleY = this.canvas.height / originalHeight
						this.scenes[key].uniformScale = Math.min(scaleX, scaleY)
						resolve()
					}
					img.onerror = reject
				})
			}
			imagePromises.push(loadImage(img))
		}

		return Promise.all(imagePromises)
	}

	initCanvas(canvas) {
		this.canvas = canvas
		this.ctx = this.canvas.getContext("2d")
	}

	initCharacters() {
		for (const key in this.characters) {
			this.characters[key] = {
				...this.characters[key],
				position: {
					x: -100,
					y: -100,
					scale: 1,
					rotation: 0,
				},
				visible: false,
			}
		}
		// const initState = this.script.initialState.characters
		// for (const character of initState) {
		// 	const key = character.name.toLowerCase()
		// 	// console.log(key, this.characters, this.characters)
		// 	const image = this.characters[key].image
		// 	this.characters[key] = {
		// 		...this.characters[key],
		// 		position: {
		// 			x:
		// 				character.position.startX -
		// 				(image.width * character.position.scale) / 2,
		// 			y:
		// 				character.position.startY -
		// 				(image.height * character.position.scale) / 2,
		// 			scale: character.position.scale,
		// 		},
		// 		visible: character.visible,
		// 	}
		// }
	}

	_sanitizeKey(key) {
		let ret = key
			// .trim()
			.toLowerCase()
			.replace(/scene/i, "")
			.replace(/\s+/, "_")
			.trim()

		if (ret[ret.length - 1] === "_") {
			ret = ret.substr(0, ret.length - 1)
		}

		return ret
	}
}
