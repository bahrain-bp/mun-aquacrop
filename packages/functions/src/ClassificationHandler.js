import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDBClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export async function getClassification(event) {
    const fileName = event.queryStringParameters?.fileName;
    console.log(fileName);

    if (!fileName) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing fileName parameter" }),
        };
    }

    try {
        const params = {
            TableName: process.env.ClassificationTableName, // Set from the ApiStack
            Key: { filename: fileName },
        };

        const result = await dynamoDBClient.send(new GetCommand(params));

        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Record not found" }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result.Item),
        };
    } catch (error) {
        console.error("Error querying DynamoDB:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
}
