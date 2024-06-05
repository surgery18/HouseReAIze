export async function onRequestGet(context) {
	const {
		params: { catchall },
	} = context

	const [provider, file] = catchall
	console.log(provider, file)
	let response
	if (provider === "ipfs") {
		response = await fetch(`https://${file}.ipfs.w3s.link`)
		console.log(response)
	} else if (provider === "r2") {
		response = await fetch(
			"https://pub-75cb6cb3287242cebe726a306d9c927a.r2.dev/housereaize/" + file
		)
	}
	const audio = await response.blob()
	return new Response(audio, {
		headers: {
			"Content-Type": "audio/mp3",
		},
		status: 200,
	})
}
