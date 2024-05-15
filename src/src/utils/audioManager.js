export default class AudioManager {
	constructor() {
		this._audios = {}
		this._sequence = []
		this._audioContext = new (AudioContext || webkitAudioContext)()
		this.audioDestination = this._audioContext.createMediaStreamDestination()
	}

	addAudio(url) {
		this._sequence.push(url)
		this._audios[url] = null
	}

	async preloadInitialAudio() {
		//load 3 audio files in the buffer
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
		//fetch the head of the array
		const head = this._sequence.shift()
		if (head) {
			//get the buffer audio
			const buffer = this._audios[head]
			const source = this._audioContext.createBufferSource()
			source.buffer = buffer
			source.connect(this._audioContext.destination)
			source.connect(this.audioDestination)
			// console.log(source)

			source.onended = () => {
				delete this._audios[head]
			}
			source.start(0)

			if (this._sequence.length > 0) {
				const url = this._sequence[0]
				if (url) {
					//load in background
					this._loadAudio(url).then((buffer) => (this._audios[url] = buffer))
				}
			}
		}
	}

	async _loadAudio(url) {
		const response = await fetch(url, { mode: "cors" })
		const buffer = await response.arrayBuffer()
		const audio = await this._audioContext.decodeAudioData(buffer)
		return audio
	}
}
