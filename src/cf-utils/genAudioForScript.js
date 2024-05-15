import { ttsmap } from "./ttsmap"
import upload from "./upload"
import md5 from "md5"

export default async function genAudioForScript(context, script) {
	for (const entry of script.timeline) {
		const action = entry.action
		let character = action.character
		if (!character) {
			character = entry.character
		}
		const dialogue = action.dialogue
		if (dialogue && character) {
			const hash = md5(dialogue)
			const fn = `${hash}.mp3`
			const ttsv = ttsmap[character.toLowerCase()]
			console.log("Generating audio for character", character, ttsv, dialogue)

			//generate tts from elevenlabs via api call
			const response = await fetch(
				"https://api.elevenlabs.io/v1/text-to-speech/" + ttsv.id,
				{
					method: "POST",
					headers: {
						"xi-api-key": context.env.ELEVENLABS_API_KEY,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						text: dialogue,
					}),
				}
			)

			//parse the results
			const audio = await response.blob()

			//upload audio to s3
			await upload(context, context.env.S3_BUCKET_NAME, fn, audio, "audio/mp3")

			action.audio_file = fn
			action.audio_cf = true
		}
	}
	return script
}
