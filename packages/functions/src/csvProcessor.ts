import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { parse } from "csv-parse/sync";
import { v4 as uuidv4 } from "uuid"; // Import UUID function

// AWS SDK clients
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
    ET0: number;
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
        ET0: 0,
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

        // Calculate ET0


        for (let i = 0; i < records.length; i ++) {

           if(!(records[i].StationID == "1" || records[i].StationID == "2") ){
               continue;
           }


            var pk = uuidv4();

            records[i].ET0 = penman(records[i].incomingRadiation, records[i].outgoingRadiation, records[i].minTemp, records[i].maxTemp, records[i].humidity, records[i].wind_speed);

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
                    ET0: { N: records[i].ET0.toString() },
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

const penman = (Rin: number, Rout: number, Tmin: number, Tmax: number, H: number, U: number, G: number = 0): number => {
    // Constants

    // Adjust wind speed to 2m height
    // (windspeed, Inistial height, desired height)
    U = adjustWindSpeed(U, 6, 2);


    const T = (Tmax + Tmin) / 2; // Average temperature
    const Rn = Rin - Rout; // Net radiation
    const γ = 0.665 * 0.001 * 101.3; // Psychrometric constant
    const esmax = 0.6108 * Math.exp((17.27 * Tmax) / (Tmax + 237.3)); // Saturation vapor pressure
    const esmin = 0.6108 * Math.exp((17.27 * Tmin) / (Tmin + 237.3)); // Saturation vapor pressure
    const esT = 0.6108 * Math.exp((17.27 * T) / (T + 237.3)); // Saturation vapor pressure
    const es = (esmax + esmin) / 2; // Average saturation vapor pressure
    const ea = es * (H / 100); // Actual vapor pressure
    const Δ = (4098 * esT) / ((T + 237.3) ** 2); // Slope of saturation vapor pressure curve

    // Penman equation
    const ET =
        (0.408 * Δ * (Rn - G) + γ * (900 / (T + 273)) * U * (es - ea)) /
        (Δ + γ * (1 + 0.34 * U));

    return ET;
}

function adjustWindSpeed(V1: number, H1: number, H2: number): number {
    // Ensure the heights are valid (greater than 0)
    if (H1 <= 0 || H2 <= 0) {
        throw new Error("Heights must be greater than zero.");
    }

    // Logarithmic wind speed adjustment formula
    const V2 = V1 * (Math.log(H2) / Math.log(H1));

    return V2;
}