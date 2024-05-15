import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

export default async function uploadImage(
	ctx,
	bucketName,
	key,
	body,
	contentType
) {
	const client = new S3Client({
		region: "auto",
		credentials: {
			accessKeyId: ctx.env.S3_ACCESS_KEY_ID,
			secretAccessKey: ctx.env.S3_SECRET_ACCESS_KEY,
		},
		endpoint: ctx.env.S3_ENDPOINT,
		s3ForcePathStyle: true,
	})

	try {
		const data = await client.send(
			new PutObjectCommand({
				Bucket: bucketName,
				Key: key,
				Body: body,
				ContentType: contentType,
				ACL: "public-read",
			})
		)
		console.log("Success", data)
		return data
	} catch (err) {
		console.error("Error", err)
		throw new Error("Failed to upload image to S3")
	}
}
