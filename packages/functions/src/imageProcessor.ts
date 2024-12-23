import {APIGatewayProxyHandler} from "aws-lambda";
import {GetObjectCommand, S3Client, HeadObjectCommand} from "@aws-sdk/client-s3";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";

const s3Client = new S3Client({});
const dynamoDBClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDBClient);
const client = new DynamoDBClient({});

export const handler = async (event: any) => {
    try {
        console.log("Received event:", JSON.stringify(event, null, 2));
        try {
            const record = event.Records[0];
            const bucket = record.s3.bucket.name;
            const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

            console.log(`Processing file from bucket: ${bucket}, key: ${key}`);

            // Get the CSV file from S3
            const getObjectCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
            const response = await s3Client.send(getObjectCommand);

            // Get the metadata of the object
            const headObjectCommand = new HeadObjectCommand({ Bucket: bucket, Key: key });
            const metadataResponse = await s3Client.send(headObjectCommand);
            console.log("Metadata:", metadataResponse.Metadata);

        } catch (error: any) {
            return {
                statusCode: 400,
                body: JSON.stringify({error: error.message}),
            };
        }
    } catch (error: any) {
        console.error("Error processing event:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({error: "Internal Server Error"}),
        };
    }
};