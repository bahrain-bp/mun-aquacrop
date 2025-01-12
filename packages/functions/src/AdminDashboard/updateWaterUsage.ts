import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event: any) => {
    try {
        if (!event.body) {
            throw new Error('No body provided');
        }

        const { waterAmount } = JSON.parse(event.body);
        
        const params = {
            TableName: process.env.statsTable,
            Key: {
                "StatID": { S: "MAIN_STATS" }
            },
            UpdateExpression: "ADD TotalWaterUsage :w, TotalRecommendations :r",
            ExpressionAttributeValues: {
                ":w": { N: waterAmount.toString() },
                ":r": { N: "1" }
            },
            ReturnValues: "UPDATED_NEW"
        };

        const command = new UpdateItemCommand(params);
        const result = await client.send(command);
        
        console.log('Water usage update result:', result);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            body: JSON.stringify({
                totalWaterUsage: Number(result.Attributes?.TotalWaterUsage.N),
                totalRecommendations: Number(result.Attributes?.TotalRecommendations.N)
            })
        };

    } catch (error) {
        console.error("Error updating water usage:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error updating water usage",
                error: error instanceof Error ? error.message : "Unknown error"
            })
        };
    }
};
