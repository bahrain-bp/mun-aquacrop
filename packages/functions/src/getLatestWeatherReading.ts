// src/lambda/getLatestWeatherReading.ts
import { DynamoDB } from "aws-sdk";

const docClient = new DynamoDB.DocumentClient();

export async function handler(event: any) {
    const { stationId } = event.pathParameters; // StationID passed in URL
    const { date } = event.queryStringParameters; // Optional date parameter

    // Helper function to format the date (if needed)
    const formatDate = (dateString: string) => new Date(dateString).toISOString(); // Ensure it's in ISO format for comparison

    const params: DynamoDB.DocumentClient.QueryInput = {
        TableName: process.env.WEATHER_READINGS_TABLE!,
        KeyConditionExpression: "StationID = :stationId",
        ExpressionAttributeValues: {
            ":stationId": stationId,
        },
        ScanIndexForward: false, // Get results in descending order of date (latest first)
        Limit: 1, // Only return the closest one
    };

    if (date) {
        // If a date is provided, search for that exact date first
        params.KeyConditionExpression += " AND #date = :date";
        params.ExpressionAttributeNames = { "#date": "date" };
        params.ExpressionAttributeValues = {
            ":stationId": stationId,
            ":date": formatDate(date), // Ensure we pass the formatted date
        };
    }

    try {
        let result = await docClient.query(params).promise();

        // If a reading exists for the exact date, return it
        if (result.Items && result.Items.length > 0) {
            return {
                statusCode: 200,
                body: JSON.stringify(result.Items[0]),
            };
        }

        // If no exact match, look for the closest possible reading by date
        // Remove the date filter and query for the latest reading available
        params.KeyConditionExpression = "StationID = :stationId";
        params.ExpressionAttributeValues = { ":stationId": stationId };

        result = await docClient.query(params).promise();

        if (result.Items && result.Items.length > 0) {
            // Return the closest available reading (the first one in the list since we query in descending order)
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
