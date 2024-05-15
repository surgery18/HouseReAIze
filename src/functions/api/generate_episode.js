import GetMongo from "../../cf-utils/mongodb"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { RequestMD } from "../../cf-utils/request"
import md5 from "md5"
import genAudioForScript from "../../cf-utils/genAudioForScript"

export async function onRequestPost(context) {
	const { request } = context
	const json = await request.json()
	const topic = json.topic ?? "Generate episode"

	//load up the model
	// console.log(context.env.GOOGLE_API_KEY)
	const genai = new GoogleGenerativeAI(context.env.GOOGLE_API_KEY)

	const model = genai.getGenerativeModel({
		model: "gemini-1.5-pro-latest",
	})

	//populate the message for the ai
	const prompt_parts = ["SYSTEM: " + RequestMD, "\n\nUSER: ", topic]
	const response = await model.generateContent(prompt_parts, {
		temperature: 0.4,
		topK: 32,
		topP: 1,
		maxOutputTokens: 8192,
	})
	const text = response.response
		.text()
		.replace("```json", "")
		.replace("\n```", "")
		.trim()
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
