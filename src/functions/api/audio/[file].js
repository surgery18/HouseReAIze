export async function onRequestGet(context) {
	const {
		params: { file },
	} = context
	const response = await fetch(
		"https://pub-75cb6cb3287242cebe726a306d9c927a.r2.dev/housereaize/" + file
	)
	const audio = await response.blob()
	return new Response(audio, {
		headers: {
			"Content-Type": "audio/mp3",
		},
		status: 200,
	})
}
