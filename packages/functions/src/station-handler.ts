import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const main = async (event: any) => {
    try {
        console.log("Received event:", JSON.stringify(event)); // Log the full event for debugging

        // Parse the request body
        const body = JSON.parse(event.body);
        console.log("Parsed body:", body); // Log parsed body

        // Validate required fields
        if (!body.StationID || !body.Name || !body.Location) {
            console.log("Validation failed. Missing fields.");
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "StationID, Name, and Location are required." }),
            };
        }

        // Create the item to insert
        const params = {
            TableName: process.env.StationTableName,
            Item: {
                StationID: { S: body.StationID },
                Name: { S: body.Name },
                Location: { S: body.Location },
            },
        };

        console.log("DynamoDB parameters:", params); // Log DynamoDB parameters

        // Execute the PutItemCommand
        await client.send(new PutItemCommand(params));
        console.log("DynamoDB insertion successful."); // Log success

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Station added successfully!" }),
        };
    } catch (error) {
        console.error("Error occurred:", error); // Log the error
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
        };
    }
};
