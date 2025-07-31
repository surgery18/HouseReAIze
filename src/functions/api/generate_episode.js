import GetMongo from "../../cf-utils/mongodb"
import { GoogleGenAI } from "@google/genai"
import { RequestMD } from "../../cf-utils/request"
import md5 from "md5"
import genAudioForScript from "../../cf-utils/genAudioForScript"

export async function onRequestPost(context) {
	const { request } = context
	const json = await request.json()
	const topic = json.topic ?? "Generate episode"

	//load up the model
	// console.log(context.env.GOOGLE_API_KEY)
	const ai = new GoogleGenAI({ apiKey: context.env.GOOGLE_API_KEY })

	//populate the message for the ai
	// const prompt_parts = ["SYSTEM: " + RequestMD, "\n\nUSER: ", topic]
	const response = await ai.models.generateContent({
		model: "gemini-2.5-flash",
		contents: [
			{
				role: "user",
				parts: [
					{
						text: topic,
					},
				],
			},
		],
		config: {
			systemInstruction: [
				{
					text: RequestMD,
				},
			],
			// 	tools: [],
			// 	thinkingConfig: {
			// 		thinkingBudget: 0,
			// 	},
		},
	})
	const text = response.text.replace("```json", "").replace("\n```", "").trim()
	console.log(text)
	//convert to json
	let script = JSON.parse(text)
	const url = md5(text)

	//upload script to mongo
	const { scripts_collection } = await GetMongo(context)
	const res = await scripts_collection.insertOne({
		url,
		script,
		views: 0,
	})

	script = await genAudioForScript(context, script)

	console.log("Updating entry")
	await scripts_collection.updateOne(
		{ _id: res.insertedId },
		{ $set: { script } }
	)
	console.log("Done")
	return Response.json({ url })

	// for (const entry of script.timeline) {
	// 	const action = entry.action
	// 	if (action.audio_s3) {
	// 		action.audio_url = "/api/audio/" + action.audio_file
	// 	}
	// }

	// return Response.json({ _id: res.insertedId, script, url, views: 0 })
}
