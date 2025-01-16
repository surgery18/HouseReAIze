export default class AudioManager {
	constructor() {
		this._audios = {}
		this._sequence = []
		this._audioContext = new (AudioContext || webkitAudioContext)()
		this.audioDestination = this._audioContext.createMediaStreamDestination()

		// Track whether an audio is currently playing
		this.currentlyPlaying = false
	}

	destroy() {
		this._audios = {}
		this._sequence = []
		this._audioContext.close()
		this._audioContext = null
	}

	addAudio(url) {
		this._sequence.push(url)
		this._audios[url] = null
	}

	async preloadInitialAudio() {
		const lastIndex = 3
		for (let i = 0; i < lastIndex; i++) {
			if (i >= this._sequence.length) break
			this._audios[this._sequence[i]] = await this._loadAudio(this._sequence[i])
		}
	}

	fixSuspended() {
		if (this._audioContext.state === "suspended") {
			this._audioContext.resume()
		}
	}

	playNextAudio() {
		const head = this._sequence.shift()
		if (head) {
			const buffer = this._audios[head]
			const source = this._audioContext.createBufferSource()
			source.buffer = buffer
			source.connect(this._audioContext.destination)
			source.connect(this.audioDestination)

			// Mark playing
			this.currentlyPlaying = true
			source.onended = () => {
				this.currentlyPlaying = false
				delete this._audios[head]
			}

			source.start(0)

			// Preload next
			if (this._sequence.length > 0) {
				const url = this._sequence[0]
				if (url) {
					this._loadAudio(url).then((buf) => (this._audios[url] = buf))
				}
			}
		}
	}

	isPlaying() {
		return this.currentlyPlaying
	}

	state() {
		return this._audioContext.state
	}

	async _loadAudio(url) {
		const response = await fetch(url)
		const buffer = await response.arrayBuffer()
		const audio = await this._audioContext.decodeAudioData(buffer)
		return audio
	}
}
