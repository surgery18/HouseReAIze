import GetMongo from "../../cf-utils/mongodb"

export async function onRequestGet(context) {
	const { scripts_collection } = await GetMongo(context)
	const episodes = await scripts_collection.aggregate([
		{
			$sort: {
				_id: -1,
			},
		},
	])
	return Response.json(
		episodes.map((episode) => ({
			url: episode.url,
			title: episode.script.title,
			views: episode.views,
		}))
	)
}
