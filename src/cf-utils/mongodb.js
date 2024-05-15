import * as Realm from "realm-web"

export default async function GetMongo(context) {
	// Initialize your App.
	const app = new Realm.App({
		id: "application-0-cotzzqd",
	})

	// Get the API key from the local environment
	const apiKey = context.env.MONGO_API_TOKEN
	if (!apiKey) {
		throw new Error("Could not find a Server API Key.")
	}
	// Create an api key credential
	const credentials = Realm.Credentials.apiKey(apiKey)
	const user = await app.logIn(credentials)

	const client = user.mongoClient("mongodb-atlas")
	const scripts_collection = client.db("db").collection("scripts")

	return {
		client,
		scripts_collection,
		ObjectId: Realm.BSON.ObjectId,
		Binary: Realm.BSON.Binary,
	}
}
