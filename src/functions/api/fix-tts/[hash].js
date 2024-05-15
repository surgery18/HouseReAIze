import GetMongo from "../../../cf-utils/mongodb"
import genAudioForScript from "../../../cf-utils/genAudioForScript"

export async function onRequestGet(context) {
	const {
		params: { hash },
	} = context
	const { scripts_collection } = await GetMongo(context)
	const data = await scripts_collection.findOne({ url: hash })
	if (data) {
		const script = await genAudioForScript(context, data.script)
		await scripts_collection.updateOne({ _id: data._id }, { $set: { script } })
	}
	return Response.json({ ok: true })
}
