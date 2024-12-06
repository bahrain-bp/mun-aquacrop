import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });

function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options).toUpperCase().replace(',', '').replace(' ', '-');
}

export async function handler(event: any) {
    const body = JSON.parse(event.body);

    const { stationId } = body;

    if (!stationId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing stationId in the request body." }),
        };
    }

    // Get today's date in the required format: OCT-23-2024
    const todayFormatted = formatDate(new Date());

    console.log("Querying for stationId:", stationId);
    console.log("Formatted date:", todayFormatted);

    // Define the query parameters for the global secondary index (StationDateIndex)
    const params = {
        TableName: process.env.weatherReadingsTable!,
        IndexName: "StationDateIndex", // Specify the secondary index
        KeyConditionExpression: "StationID = :stationId and #date <= :today",
        ExpressionAttributeNames: {
            "#date": "date",
        },
        ExpressionAttributeValues: {
            ":stationId": stationId,
            ":today": todayFormatted, // Use the formatted date
        },
        Limit: 1,
        ScanIndexForward: false, // Get the latest reading first (descending order)
    };

    try {
        // Log the query parameters before sending the request
        console.log("DynamoDB Query Parameters:", JSON.stringify(params, null, 2));

        const result = await client.send(new QueryCommand(params));

        if (result.Items && result.Items.length > 0) {
            return {
                statusCode: 200,
                body: JSON.stringify(result.Items[0]),
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "No weather readings found." }),
            };
        }
    } catch (error) {
        console.error("Error fetching weather reading", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" }),
        };
    }
}
