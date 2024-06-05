import GetMongo from "../../../cf-utils/mongodb"
export async function onRequestGet(context) {
	const {
		params: { hash },
	} = context

	const { scripts_collection } = await GetMongo(context)
	const data = await scripts_collection.findOne({ url: hash })

	//inject url into audio
	if (data) {
		const script = data.script
		for (const entry of script.timeline) {
			const action = entry.action
			const character = action.character
			if (!character) {
				action.character = entry.character
			}

			if (action.audio_file) {
				const cid = action.audio_cid
				const cf = action.audio_cf
				// console.log(action)
				if (cid) {
					// action.audio_url = `https://${cid}.ipfs.w3s.link`
					action.audio_url = "/api/audio/ipfs/" + cid
					// console.log(action.audio_url, "cid")
				} else if (cf) {
					action.audio_url = "/api/audio/r2/" + action.audio_file
					// console.log(action.audio_url, "s3")
				} else {
					// console.log(action.audio_file, "no")
				}
			}
		}

		await scripts_collection.updateOne({ url: hash }, { $inc: { views: 1 } })
		return Response.json(data)
	}
	return Response.json({ ok: false }, { status: 404 })
}
