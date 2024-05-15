import upload from "../../cf-utils/upload"

export async function onRequestGet(context) {
	const response = await fetch(
		"https://api.elevenlabs.io/v1/text-to-speech/ErXwobaYiN019PkySvjV",
		{
			method: "POST",
			headers: {
				"xi-api-key": context.env.ELEVENLABS_API_KEY,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				text: "blah blah",
			}),
		}
	)

	//parse the results
	const audio = await response.blob()

	await upload(
		context,
		context.env.S3_BUCKET_NAME,
		`test.mp3`,
		audio,
		"audio/mp3"
	)

	return new Response(audio, { "Content-Type": "audio/mp3", status: 200 })
}
