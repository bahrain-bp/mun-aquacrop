import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { parse } from "csv-parse/sync";
import { v4 as uuidv4 } from "uuid"; // Import UUID function

const WEATHER_READINGS_TABLE = process.env.WEATHER_READINGS_TABLE ?? "weatherReadingsTable";
const STATION_TABLE = process.env.STATION_TABLE ?? "stationTable";

const s3Client = new S3Client({});
const dynamoDBClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDBClient);
const client = new DynamoDBClient({});
interface WeatherReading {
    ReadingID: string;
    StationID: string;
    date: string;
    incomingRadiation: number;
    outgoingRadiation: number;
    meanTemp: number;
    minTemp: number;
    maxTemp: number;
    wind_speed: number;
    humidity: number;
}

// Helper: Convert stream to string
async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}

// Convert raw CSV record into a strongly-typed WeatherReading
function convertToWeatherReading(record: any): WeatherReading {
    return {
        ReadingID: record.ReadingID,
        StationID: record.StationID,
        date: record.date,
        incomingRadiation: Number(record.incomingRadiation),
        outgoingRadiation: Number(record.outgoingRadiation),
        meanTemp: Number(record.meanTemp),
        minTemp: Number(record.minTemp),
        maxTemp: Number(record.maxTemp),
        wind_speed: Number(record.wind_speed),
        humidity: Number(record.humidity),
    };
}

export const handler = async (event: any) => {
    console.log("Received event:", JSON.stringify(event, null, 2));
    try {
        const record = event.Records[0];
        const bucket = record.s3.bucket.name;
        const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

        console.log(`Processing file from bucket: ${bucket}, key: ${key}`);

        // Get the CSV file from S3
        const getObjectCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
        const response = await s3Client.send(getObjectCommand);
        const body = await streamToString(response.Body as any);

        // Parse CSV
        const rawRecords = parse(body, { columns: true, skipEmptyLines: true });
        const records: WeatherReading[] = rawRecords.map((r: any) => convertToWeatherReading(r));

        // Insert readings into weatherReadingsTable using batch writes
        // const CHUNK_SIZE = 25;
        // for (let i = 0; i < records.length; i += CHUNK_SIZE) {
        //     const batch = records.slice(i, i + CHUNK_SIZE).map((item) => ({
        //         PutRequest: { Item: item }
        //     }));
        //
        //     const command = new BatchWriteCommand({
        //         RequestItems: {
        //             [process.env.weatherReadingsTable]: batch,
        //         },
        //     });
        //     await ddbDocClient.send(command);
        // }


        for (let i = 0; i < records.length; i ++) {

            var pk = uuidv4();


            const params = {
                TableName: process.env.weatherReadingsTable,
                Item: {
                    ReadingID: { S: pk },
                    StationID: { S: records[i].StationID },
                    date: { S: records[i].date },
                    incomingRadiation: { N: records[i].incomingRadiation.toString() },
                    outgoingRadiation: { N: records[i].outgoingRadiation.toString() },
                    meanTemp: { N: records[i].meanTemp.toString() },
                    minTemp: { N: records[i].minTemp.toString() },
                    maxTemp: { N: records[i].maxTemp.toString() },
                    wind_speed: { N: records[i].wind_speed.toString() },
                    humidity: { N: records[i].humidity.toString() },
                },
            };

            await client.send(new PutItemCommand(params));

            // Update stationTable with lastReadingID
            const updateCommand = new UpdateCommand({
                TableName: process.env.stationTable,
                Key: { StationID:records[i].StationID }, // Assuming StationID is the primary key for stationTable
                UpdateExpression: "SET lastReadingID = :rid",
                ExpressionAttributeValues: {
                    ":rid": pk
                }
            });

            await client.send(updateCommand);

        }

        console.log("Successfully inserted all records into weatherReadingsTable.");

        return {
            statusCode: 200,
            body: JSON.stringify("CSV file processed and data inserted into DynamoDB and station updated."),
        };
    } catch (e: any) {
        console.error("Error processing file:", e);
        return {
            statusCode: 500,
            body: JSON.stringify(`Error processing file: ${e.message}`),
        };
    }
};
