import { S3Event, Context, Callback } from "aws-lambda";
import { Readable } from "stream";
import {GetObjectCommand, S3Client, HeadObjectCommand} from "@aws-sdk/client-s3";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";
import { InvokeEndpointCommand, SageMakerRuntimeClient } from "@aws-sdk/client-sagemaker-runtime";

const s3Client = new S3Client({});
const dynamoDBClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDBClient);
const client = new DynamoDBClient({});
const sageMakerClient = new SageMakerRuntimeClient({});
const SAGEMAKER_ENDPOINT = "jumpstart-dft-imagenet-mobilenet-v3-20241227-042804";

export const handler = async (event: S3Event, context: Context, callback: Callback) => {
    try {
        console.log("Received event:", JSON.stringify(event, null, 2));

        const record = event.Records[0];
        const bucket = record.s3.bucket.name;
        const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

        console.log(`Processing file from bucket: ${bucket}, key: ${key}`);

        // Get the image file from S3
        const getObjectCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
        const response = await s3Client.send(getObjectCommand);

        const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
            const chunks: Uint8Array[] = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        };

        const imageBuffer = await streamToBuffer(response.Body as Readable);
        console.log("Image successfully retrieved from S3");

        // Send the image to SageMaker endpoint
        console.log(`Sending image to SageMaker endpoint: ${SAGEMAKER_ENDPOINT}`);
        const invokeCommand = new InvokeEndpointCommand({
            EndpointName: SAGEMAKER_ENDPOINT,
            Body: imageBuffer,
            ContentType: "application/x-image",
        });

        const sageMakerResponse = await sageMakerClient.send(invokeCommand);

        // Parse the response
        const result = JSON.parse(new TextDecoder().decode(sageMakerResponse.Body));
        console.log("SageMaker response:", result);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Image processed successfully",
                persons: result, // Adjust based on your SageMaker response structure
            }),
        };
    } catch (error: any) {
        console.error("Error processing event:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
        };
    }
};