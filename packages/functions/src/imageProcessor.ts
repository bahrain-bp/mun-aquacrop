import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { CopyObjectCommand } from "@aws-sdk/client-s3";
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

        // Get the metadata of the object
        const headObjectCommand = new HeadObjectCommand({ Bucket: bucket, Key: key });
        const metadataResponse = await s3Client.send(headObjectCommand);

        // Ensure Metadata is not undefined
        const metadata = metadataResponse.Metadata || {}; // Default to an empty object if Metadata is undefined
        console.log("Metadata:", metadataResponse.Metadata);

        // Extract location from metadata (assuming it's in JSON format)
        const locationMetadata = metadataResponse.Metadata?.['location'] || null;


        // Initialize latitude and longitude
        let latitude: number | null = null;
        let longitude: number | null = null;

        if (locationMetadata) {
            try {
                const location = JSON.parse(locationMetadata);
                latitude = location.latitude || null;
                longitude = location.longitude || null;

                console.log("Latitude:", latitude);
                console.log("Longitude:", longitude);
            } catch (error) {
                console.error("Error parsing location metadata:", error);
            }
        }

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

        // Labels for probabilities
        const labels = [
            "corn-end",
            "corn-ini",
            "corn-mid",
            "cucumber-end",
            "cucumber-ini",
            "cucumber-mid",
            "tomato-end",
            "tomato-ini",
            "tomato-mid"
        ];

        const kcValues: Record<string, number> = {
            "corn-ini": 0.3,
            "corn-mid": 1.15,
            "corn-end": 1.79,
            "cucumber-ini": 0.6,
            "cucumber-mid": 1,
            "cucumber-end": 0.75,
            "tomato-ini": 0.6,
            "tomato-mid": 1.3225,
            "tomato-end": 0.8,
        };

        // Define crop-specific images
        const cropImages: Record<string, string> = {
            corn: "https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/corn.png",
            cucumber: "https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/cucumber.png",
            tomato: "https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/tomato.png",
        };

        // Helper function to parse label into crop and growth stage
        const parseLabel = (label: string) => {
            const [crop, stage] = label.split("-");
            return { crop, stage };
        };

        // Find the maximum probability and its label
        const probabilities = result.probabilities;
        if (!Array.isArray(probabilities)) {
            throw new Error("Unexpected SageMaker response format: 'probabilities' is not an array");
        }

        const maxProbability = Math.max(...probabilities);
        const maxIndex = probabilities.indexOf(maxProbability);
        const maxLabel = labels[maxIndex];
        const { crop, stage } = parseLabel(maxLabel);
        const kc = kcValues[maxLabel] || null; // Retrieve the `kc` value

        console.log("Maximum probability:", maxProbability);
        console.log("Crop:", crop);
        console.log("Growth Stage:", stage);
        console.log("Crop Coefficient (kc):", kc);
        

        if (maxProbability >= 0.75) {
            const imageSource = cropImages[crop];
            const sourceBucket = bucket; // Source bucket from the event
            const destinationBucket = "crop-images-30-class"; // Destination bucket
            const destinationKey = `Directory/${maxLabel}/${key.split('/').pop()}`; // Path in the destination bucket

            console.log(`Copying file from ${sourceBucket}/${key} to ${destinationBucket}/${destinationKey}`);

            const copyObjectCommand = new CopyObjectCommand({
                Bucket: destinationBucket, // Destination bucket
                CopySource: `${sourceBucket}/${key}`, // Source bucket and key
                Key: destinationKey, // Destination key
            });

            await s3Client.send(copyObjectCommand);
            console.log(`File successfully copied to: ${destinationBucket}/${destinationKey}`);

            // Add a record to the DynamoDB table
            const item = {
                filename: key.split('/').pop(), // Extract the filename from the S3 key
                imageSource,
                crop,
                stage,
                kc,
                latitude,
                longitude,
                timestamp: new Date().toISOString(),
            };

            const tableName = process.env.aiResult;
            const putCommand = new PutCommand({
                TableName: tableName,
                Item: item,
            });

            await ddbDocClient.send(putCommand);
            console.log("Record added to DynamoDB:", item);


            return {
                statusCode: 200,
                body: JSON.stringify(item),
            };
        } else {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "No prediction met the confidence threshold.",
                }),
            };
        }
    } catch (error: any) {
        console.error("Error processing event:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
        };
    }
};