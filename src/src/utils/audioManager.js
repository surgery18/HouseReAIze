export default class AudioManager {
	constructor() {
		this._audios = {}
		this._sequence = []
		this._audioContext = new (AudioContext || webkitAudioContext)()
		this.audioDestination = this._audioContext.createMediaStreamDestination()
		this._isPlaying = false
	}

	destroy() {
		this._audios = {}
		this._sequence = []
		this._audioContext.close()
		this._audioContext = null
		this._isPlaying = false
	}

	addAudio(url) {
		this._sequence.push(url)
		this._audios[url] = null
	}

	async preloadInitialAudio() {
		// Load 3 audio files in the buffer
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
		// Fetch the head of the array
		const head = this._sequence.shift()
		if (head) {
			// Get the buffer audio
			const buffer = this._audios[head]
			const source = this._audioContext.createBufferSource()
			source.buffer = buffer
			source.connect(this._audioContext.destination)
			source.connect(this.audioDestination)

			source.onended = () => {
				delete this._audios[head]
				this._isPlaying = false
				if (this._sequence.length > 0) {
					this.playNextAudio()
				}
			}
			source.start(0)
			this._isPlaying = true

			if (this._sequence.length > 0) {
				const url = this._sequence[0]
				if (url) {
					// Load in background
					this._loadAudio(url).then((buffer) => (this._audios[url] = buffer))
				}
			}
		}
	}

	isPlaying() {
		return this._isPlaying
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
