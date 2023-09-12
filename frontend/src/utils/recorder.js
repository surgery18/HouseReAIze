function downloadURL(url) {
	const a = document.createElement("a")
	a.style.display = "none"
	a.href = url
	a.download = "recorded_video.webm" // specify the filename
	document.body.appendChild(a)
	a.click()
	setTimeout(() => {
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	}, 100)
}

export default class Recorder {
	constructor() {
		this.recording = false
		this.recorder = null
		this.url = null
	}

	initRecorder(canvas, audioDest) {
		if (this.recorder) return
		let chunks = []
		const stream = canvas.captureStream()
		const combinedStream = new MediaStream([
			...stream.getTracks(),
			...audioDest.stream.getTracks(),
		])
		const options = { mimeType: "video/webm;codecs=vp9,opus" }
		this.recorder = new MediaRecorder(combinedStream, options)
		this.recorder.ondataavailable = function (e) {
			chunks.push(e.data)
		}
		this.recorder.onstop = () => {
			const blob = new Blob(chunks, { type: "video/webm" })
			this.url = URL.createObjectURL(blob)
			// downloadURL(url)
		}
	}

	startRecording() {
		this.recording = true
		this.recorder.start()
	}

	stopRecording() {
		this.recording = false
		this.recorder.stop()
	}

	download() {
		if (!this.url) return
		downloadURL(this.url)
	}
}
