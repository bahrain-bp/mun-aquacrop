import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const main = async () => {
    try {
        // Define the scan parameters
        const params = {
            TableName: process.env.CropTableName,
        };

        // Perform the Scan operation
        const command = new ScanCommand(params);
        const result = await client.send(command);

        // Return the data
        return {
            statusCode: 200,
            body: JSON.stringify(result.Items || []),
        };
    } catch (error) {
        console.error("Error retrieving crops:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
        };
    }
};
