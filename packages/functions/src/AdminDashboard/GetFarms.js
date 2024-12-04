import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const dynamoDBClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = "SaqiDev-mun-aquacrop-Farms"; // Replace with your actual table name

export const handler = async (event) => {
  try {
    // Get authenticated user's ID from the event
    const ownerId = event.requestContext.authorizer.claims.sub;

    if (!ownerId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized: OwnerID is missing" }),
      };
    }

    // Query DynamoDB for farms owned by this admin
    const response = await dynamoDBClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "OwnerID = :ownerId",
        ExpressionAttributeValues: {
          ":ownerId": ownerId,
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ farms: response.Items }),
    };
  } catch (error) {
    console.error("Error fetching farms:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch farms", error }),
    };
  }
};
